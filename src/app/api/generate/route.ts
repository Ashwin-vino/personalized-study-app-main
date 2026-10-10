import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { generateAcademicStudySet } from '@/lib/study-generator';

export const maxDuration = 60;

function cleanPdfText(raw: string): string {
  return raw
    .replace(/^\s*\d+\s*$/gm, '')
    .replace(/page\s+\d+(\s+of\s+\d+)?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchTopicAcademicContext(topic: string): Promise<string | null> {
  const clean = topic.trim().replace(/^Topic:\s*/i, '').replace(/^Study Topic:\s*/i, '');
  if (!clean || clean.length < 2) return null;

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`, {
      headers: {
        'User-Agent': 'PersonalizedStudyAssistant/1.0 (academic-study-app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.extract && typeof data.extract === 'string' && data.extract.length > 40) {
        return data.extract.trim();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return null;
}

async function callGithubAI(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500); // Fast 2.5s limit to prevent serverless timeout

  try {
    const response = await fetch('https://models.github.ai/inference/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'PersonalizedStudyAssistant',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') return content;
      }
      const text = await response.text();
      if (text && text.trim().startsWith('{')) {
        return text;
      }
    }
  } catch (err: unknown) {
    clearTimeout(timeout);
  }

  throw new Error('GitHub AI unavailable or timed out');
}

async function callGeminiAPI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastErr: unknown;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      });
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim()) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini API] Model ${modelName} failed, trying next:`, err);
    }
  }
  throw lastErr || new Error('All Gemini candidate models failed');
}

async function callNvidiaAPI(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  const candidateModels = [
    'meta/llama-3.1-8b-instruct',
    'meta/llama-3.2-11b-vision-instruct',
  ];

  let lastError = '';

  for (const modelName of candidateModels) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s fast limit

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.2,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }

      const errBody = await response.text();
      lastError = `NVIDIA API ${response.status} (${modelName}): ${errBody}`;
    } catch (err: unknown) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : String(err);
      lastError = msg;
    }
  }

  throw new Error(lastError || 'Failed to generate with NVIDIA NIM API');
}

async function callPollinationsAPI(messages: { role: string; content: string }[]): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s limit

  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages,
        model: 'openai-fast', 
        jsonMode: true 
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error('Pollinations API failed');
    return await response.text();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}


function extractJSON(raw: string) {
  if (!raw) return null;
  let cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  cleaned = cleaned.substring(start);
  
  let chopped = cleaned;
  while (chopped.length > 10) {
    const fixes = [
      chopped,
      chopped + '}',
      chopped + ']}',
      chopped + '}]}',
      chopped + '"}',
      chopped + '"]}',
      chopped + '"]}]}',
      chopped + '"}], "questions":[]}'
    ];
    
    for (const f of fixes) {
      try {
        const parsed = JSON.parse(f);
        if (parsed.flashcards || parsed.questions || parsed.quiz || parsed.cards) {
          return parsed;
        }
      } catch (e) {
        try {
          const sanitized = f
            .replace(/,\s*([\]}])/g, '$1')
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\r\n]/g, ' ');
          const parsed = JSON.parse(sanitized);
          if (parsed.flashcards || parsed.questions || parsed.quiz || parsed.cards) {
            return parsed;
          }
        } catch (e2) {}
      }
    }
    chopped = chopped.slice(0, -1);
  }
  
  return null;
}

const TOPIC_FACETS = [
  {
    focus: 'Core Architectural Definition & Purpose',
    questionPrompt: (t: string) => `What is the fundamental definition and primary purpose of ${t}?`,
    definition: (t: string) => `${t} provides essential structural abstractions and mechanisms designed to manage domain-specific state and operational workflows.`,
    mechanism: (t: string) => `It coordinates fundamental interactions by establishing defined interfaces, enforcing invariants, and optimizing resource distribution.`,
    significance: (t: string) => `Mastering the definition and purpose of ${t} forms the foundation for analyzing operational efficiency, correctness, and system design.`,
    correctOption: (t: string) => `A core architectural framework designed to manage structured abstractions and enforce operational invariants.`,
    distractors: [
      `An auxiliary interrupt controller used exclusively for secondary storage defragmentation.`,
      `A deprecated hardware instruction superseded by unmanaged user-space polling routines.`,
      `A transient caching layer with no persistence guarantees or structural validation.`
    ]
  },
  {
    focus: 'Operational Mechanics & Execution Workflow',
    questionPrompt: (t: string) => `How do primary operations and state transitions execute within ${t}?`,
    definition: (t: string) => `Execution in ${t} proceeds through structured state transitions where inputs are validated against boundary constraints and stage gates.`,
    mechanism: (t: string) => `Operations synchronize internal dependencies, manage concurrent access where applicable, and maintain deterministic outputs across execution lifecycles.`,
    significance: (t: string) => `Clear understanding of execution mechanics allows practitioners to trace data flow, diagnose bottlenecks, and maintain system predictability.`,
    correctOption: (t: string) => `Through structured state transitions validated against boundary constraints and operational dependencies.`,
    distractors: [
      `By issuing unrestricted asynchronous interrupts that bypass validation routines.`,
      `Through unregulated polling loops that lock system buses during execution cycles.`,
      `By overwriting system registers without verifying intermediate execution state.`
    ]
  },
  {
    focus: 'Structural Invariants & Core Properties',
    questionPrompt: (t: string) => `Which core property or invariant must be preserved during operations in ${t}?`,
    definition: (t: string) => `${t} relies on foundational consistency guarantees to prevent race conditions, memory corruption, and illegal intermediate states.`,
    mechanism: (t: string) => `Validation checks enforce that structural relationships and constraints hold before, during, and following all mutative operations.`,
    significance: (t: string) => `Preserving invariants ensures mathematical correctness, predictable fault recovery, and reliable behavior under high-load scenarios.`,
    correctOption: (t: string) => `Consistency guarantees and structural invariants that ensure predictable state and prevent anomalies.`,
    distractors: [
      `Unconditional allocation of execution priorities regardless of process starvation.`,
      `Arbitrary instruction reordering that discards causality and state dependencies.`,
      `Immediate termination of background workers whenever a cache miss occurs.`
    ]
  },
  {
    focus: 'Performance Bounds & Operational Trade-offs',
    questionPrompt: (t: string) => `What is the primary operational trade-off or constraint associated with ${t}?`,
    definition: (t: string) => `Balancing runtime efficiency (latency and throughput) against memory overhead and architectural complexity is the central trade-off in ${t}.`,
    mechanism: (t: string) => `Techniques that optimize read speed or query responsiveness typically introduce auxiliary overhead during updates, rebalancing, or synchronization.`,
    significance: (t: string) => `Evaluating trade-offs enables engineers and students to choose optimal configurations tailored to specific workload demands.`,
    correctOption: (t: string) => `Balancing runtime computational throughput against memory overhead and synchronization latency.`,
    distractors: [
      `Guaranteed zero-latency processing achieved by discarding persistent data integrity.`,
      `Infinite linear scalability with no networking or synchronization overhead.`,
      `Strict reliance on single-threaded execution environments to prevent concurrency.`
    ]
  },
  {
    focus: 'Real-World Systems & Industrial Applications',
    questionPrompt: (t: string) => `In which real-world context or computational system is ${t} predominantly utilized?`,
    definition: (t: string) => `${t} is applied across modern software systems, distributed architectures, database engines, and operating system kernels.`,
    mechanism: (t: string) => `It provides reliable abstractions that isolate high-level domain logic from low-level hardware or peripheral idiosyncrasies.`,
    significance: (t: string) => `Practical deployment demonstrates its resilience, facilitating modular maintenance and cross-platform reliability.`,
    correctOption: (t: string) => `Scalable computing systems, system software, and domain platforms requiring reliable state abstractions.`,
    distractors: [
      `Analog signal decoders restricted strictly to electromechanical relay switches.`,
      `Unencrypted local storage partitions operating without file system drivers.`,
      `Standalone mechanical clock calibration utilities with no network interfaces.`
    ]
  },
  {
    focus: 'Edge Cases, Degeneracy & Optimization Strategies',
    questionPrompt: (t: string) => `What critical edge case or failure mode can arise in ${t}, and how is it mitigated?`,
    definition: (t: string) => `Common edge cases in ${t} include resource contention, boundary overflow, structural imbalance, and deadlocks under concurrent load.`,
    mechanism: (t: string) => `Mitigation strategies incorporate defensive parameter validation, automated balancing, timeouts, and structured rollback routines.`,
    significance: (t: string) => `Rigorous edge-case handling is essential for engineering resilient, production-grade systems capable of graceful degradation.`,
    correctOption: (t: string) => `Resource contention and boundary overflow, mitigated via defensive validation and automated balancing.`,
    distractors: [
      `Complete hardware desynchronization resolved solely by thermal power cycling.`,
      `Permanent instruction cache invalidation requiring manual transistor realignment.`,
      `Unrecoverable kernel failure triggered by standard terminal input prompts.`
    ]
  }
];

function generateFallbackMaterials(text: string, topicOrTitle: string, requestedFlashcards: number, requestedQuestions: number) {
  const cleanTitle = (topicOrTitle || 'Study Subject')
    .replace(/\.[^/.]+$/, '')
    .replace(/^Topic:\s*/i, '')
    .replace(/^Study Topic:\s*/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  const cleanedInput = text
    .replace(/^Topic:\s*/gi, '')
    .replace(/^Study Topic:\s*/gi, '')
    .trim();

  // Clean lines and extract meaningful conceptual sentences
  const sentences = cleanedInput
    .split(/(?<=[.?!])\s+|\n{2,}|\r?\n•|\r?\n-/)
    .map(s => s.trim().replace(/^[-*#0-9.)\]]+\s*/, ''))
    .filter(s => s.length >= 25 && !/^page\s+\d+/i.test(s) && !/^(study topic|topic|title):/i.test(s));

  // Extract key concept-definition pairs
  const concepts: { term: string; explanation: string; full: string }[] = [];
  const seenTerms = new Set<string>();

  for (const sentence of sentences) {
    const match = sentence.match(/^([A-Za-z0-9_\-\s()]{3,40})\s*(?:[-:–—=]|\sis\s+(?:a|an|the)?|\smeans\s|\srefers to\s|\sused to\s|\sallows\s)\s+(.+)$/i);
    if (match && match[1] && match[2] && match[2].length >= 15) {
      const term = match[1].trim();
      const explanation = match[2].trim();
      if (!seenTerms.has(term.toLowerCase()) && !/^(page|unit|chapter|figure|table|note|q\d+|topic|study topic|title|subject)/i.test(term)) {
        seenTerms.add(term.toLowerCase());
        concepts.push({ term, explanation, full: sentence });
      }
    }
  }

  const flashcards: { front: string; back: string }[] = [];
  const questions: { question: string; options: string[]; answer: string; explanation: string; citation?: string }[] = [];

  // 1. Generate comprehensive, in-depth flashcards
  for (let i = 0; i < requestedFlashcards; i++) {
    if (concepts.length > 0 && i < concepts.length) {
      const c = concepts[i];
      const termClean = c.term.trim();
      const rawExp = c.explanation.trim();
      const expClean = rawExp.charAt(0).toUpperCase() + rawExp.slice(1);
      const cleanExpWithDot = expClean.endsWith('.') ? expClean : expClean + '.';

      const sentIndex = sentences.indexOf(c.full);
      const nextSentence = (sentIndex !== -1 && sentences[sentIndex + 1] && sentences[sentIndex + 1].length > 20)
        ? sentences[sentIndex + 1]
        : sentences.find(s => s !== c.full && s.toLowerCase().includes(termClean.toLowerCase()));

      let contextNote = '';
      if (nextSentence && !nextSentence.startsWith(c.term)) {
        contextNote = `\n\nOperational Mechanism & Context:\n${nextSentence.endsWith('.') ? nextSentence : nextSentence + '.'}`;
      } else {
        contextNote = `\n\nOperational Mechanism & Context:\nWithin ${cleanTitle}, ${termClean} coordinates essential state operations and system execution flows.`;
      }

      const summaryNote = `\n\nCore Significance:\nUnderstanding ${termClean} is essential for analyzing system behavior, execution guarantees, and state transitions in ${cleanTitle}.`;
      const comprehensiveAnswer = `Definition & Purpose:\n${cleanExpWithDot}${contextNote}${summaryNote}`;

      flashcards.push({
        front: `What is the role, definition, and operational significance of "${termClean}" in ${cleanTitle}?`,
        back: comprehensiveAnswer
      });
    } else if (sentences.length > 0 && i < sentences.length) {
      const sentence = sentences[i % sentences.length];
      const nextSentence = sentences[(i + 1) % sentences.length] || '';
      const words = sentence.split(/\s+/);
      const subject = words.slice(0, Math.min(5, words.length)).join(' ');

      const comprehensiveAnswer = `Core Principle:\n${sentence.endsWith('.') ? sentence : sentence + '.'}\n\nContext & Application:\n${nextSentence ? (nextSentence.endsWith('.') ? nextSentence : nextSentence + '.') : `This principle defines how core mechanisms operate within ${cleanTitle}.`}\n\nKey Takeaway:\nMastery of "${subject}..." is essential for foundational understanding and practical application of the concepts in ${cleanTitle}.`;

      flashcards.push({
        front: `How does the material explain the concept regarding "${subject}..." and why is it important in ${cleanTitle}?`,
        back: comprehensiveAnswer
      });
    } else {
      const facet = TOPIC_FACETS[i % TOPIC_FACETS.length];
      const comprehensiveAnswer = `Definition & Purpose:\n${facet.definition(cleanTitle)}\n\nOperational Mechanism:\n${facet.mechanism(cleanTitle)}\n\nCore Significance:\n${facet.significance(cleanTitle)}`;

      flashcards.push({
        front: facet.questionPrompt(cleanTitle),
        back: comprehensiveAnswer
      });
    }
  }

  // 2. Generate robust, relevant multiple-choice questions
  for (let i = 0; i < requestedQuestions; i++) {
    if (concepts.length > 0 && i < concepts.length) {
      const target = concepts[i];
      const correct = target.explanation.length > 130 ? target.explanation.slice(0, 130) + '...' : target.explanation;
      
      const allDistractors = TOPIC_FACETS.flatMap(f => f.distractors);
      const uniqueOpts = [correct];
      const candidates = [
        concepts[(i + 1) % concepts.length]?.explanation,
        concepts[(i + 2) % concepts.length]?.explanation,
        ...allDistractors.slice((i * 3) % allDistractors.length),
        ...allDistractors,
      ];
      for (const cand of candidates) {
        if (!cand) continue;
        const formatted = cand.length > 130 ? cand.slice(0, 130) + '...' : cand;
        if (!uniqueOpts.includes(formatted)) {
          uniqueOpts.push(formatted);
        }
        if (uniqueOpts.length === 4) break;
      }
      const shuffled = uniqueOpts.sort(() => 0.5 - ((i * 3 + uniqueOpts.length) % 2));

      questions.push({
        question: `In the context of ${cleanTitle}, what is the main role or definition of "${target.term}"?`,
        options: shuffled,
        answer: correct,
        explanation: `Based on the study text: "${target.full}"`,
        citation: target.full
      });
    } else if (sentences.length > 0 && i < sentences.length) {
      const target = sentences[i % sentences.length];
      const words = target.split(/\s+/);
      const keySubject = words.slice(0, Math.min(5, words.length)).join(' ');
      const correct = target.length > 120 ? target.slice(0, 120) + '...' : target;

      const allDistractors = TOPIC_FACETS.flatMap(f => f.distractors);
      const uniqueOpts = [correct];
      const candidates = [
        sentences[(i + 1) % sentences.length],
        sentences[(i + 2) % sentences.length],
        ...allDistractors.slice((i * 3) % allDistractors.length),
        ...allDistractors,
      ];
      for (const cand of candidates) {
        if (!cand) continue;
        const formatted = cand.length > 120 ? cand.slice(0, 120) + '...' : cand;
        if (!uniqueOpts.includes(formatted)) {
          uniqueOpts.push(formatted);
        }
        if (uniqueOpts.length === 4) break;
      }
      const shuffled = uniqueOpts.sort(() => 0.5 - ((i + 1) % 2));

      questions.push({
        question: `Based on the material concerning "${keySubject}...", which statement is accurate?`,
        options: shuffled,
        answer: correct,
        explanation: `Direct excerpt from document: "${target}"`,
        citation: target
      });
    } else {
      const facet = TOPIC_FACETS[i % TOPIC_FACETS.length];
      const correct = facet.correctOption(cleanTitle);
      const opts = [correct, ...facet.distractors];
      const shuffled = opts.slice(0, 4).sort(() => 0.5 - ((i * 2 + 1) % 2));

      questions.push({
        question: facet.questionPrompt(cleanTitle),
        options: shuffled,
        answer: correct,
        explanation: `${facet.definition(cleanTitle)} ${facet.mechanism(cleanTitle)}`,
        citation: `Foundations of ${cleanTitle}`
      });
    }
  }

  return { flashcards, questions };
}

export async function POST(req: Request) {
  try {
    const { documentId, topic, content: directContent, title: directTitle, numFlashcards = 5, numQuestions = 5 } = await req.json();

    if (!documentId && !topic && !directContent) {
      return NextResponse.json({ error: 'documentId, topic, or content required' }, { status: 400 });
    }

    let document: { id: string; title: string; content: string; userId: string } | null = null;

    if (directContent && typeof directContent === 'string' && directContent.trim().length > 0) {
      document = {
        id: documentId || `doc-${Date.now()}`,
        title: directTitle || topic || 'Study Material',
        content: directContent,
        userId: 'demo-user-id',
      };
    } else if (documentId) {
      try {
        document = await Promise.race([
          prisma.document.findUnique({
            where: { id: documentId },
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB lookup timeout')), 1200))
        ]);
      } catch (err) {
        console.warn('DB lookup failed for documentId:', err);
      }
    }

    if (!document && topic) {
      let userId = 'demo-user-id';
      let fetchedContent = directContent;
      if (!fetchedContent || fetchedContent.length < 50) {
        const wikiExtract = await fetchTopicAcademicContext(topic);
        fetchedContent = wikiExtract || `Study material covering core principles, structural invariants, and operational mechanisms of ${topic}.`;
      }

      try {
        let dbUser = await Promise.race([
          prisma.user.findFirst(),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('User find timeout')), 1000))
        ]);
        if (!dbUser) {
          dbUser = await Promise.race([
            prisma.user.create({ data: { email: 'student@example.com', name: 'Demo Student' } }),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('User create timeout')), 1000))
          ]);
        }
        userId = dbUser?.id || 'demo-user-id';
        document = await Promise.race([
          prisma.document.create({
            data: {
              title: topic,
              content: fetchedContent,
              userId,
            }
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Doc create timeout')), 1200))
        ]);
      } catch (dbErr) {
        console.warn('DB create failed for topic document:', dbErr);
        document = {
          id: `doc-${Date.now()}`,
          title: topic,
          content: fetchedContent,
          userId,
        };
      }
    }

    if (!document) {
      document = {
        id: `doc-${Date.now()}`,
        title: topic || 'Study Material',
        content: topic ? `Study material for ${topic}` : 'Study material content',
        userId: 'demo-user-id',
      };
    }

    if (topic && document && (!document.content || document.content.length < 50 || document.content.startsWith('Topic:'))) {
      const wikiExtract = await fetchTopicAcademicContext(topic);
      if (wikiExtract) {
        document.content = wikiExtract;
      }
    }

    const requestedFlashcards = Math.max(1, Math.min(20, Number(numFlashcards) || 5));
    const requestedQuestions = Math.max(1, Math.min(20, Number(numQuestions) || 5));

    const rawContent = document.content || '';
    const cleanedContent = cleanPdfText(rawContent).slice(0, 15000).trim();
    const titleOrTopic = topic || document.title || "Study Topic";

    const isFileBased = Boolean(documentId) || (rawContent && rawContent.length > 50 && !rawContent.startsWith('Topic:'));

    const systemPrompt = isFileBased
      ? `You are an expert academic tutor and exam creator.

CRITICAL INSTRUCTIONS FOR RELEVANT QUESTIONS & ANSWERS:
1. Thoroughly read and extract all core concepts, definitions, mechanisms, and formulas from the provided document.
2. DO NOT make the question just the title, topic name, or section heading (e.g. NEVER produce questions like "1. Job Queue", "Section 2", or "What is Study Topic?").
3. Each question MUST be a complete, well-crafted academic question that tests understanding of the material (e.g., "What is the primary function of the Job Queue in process scheduling?", "Which event causes a process to transition from the Running state to the Waiting state?").
4. For flashcards:
   - "front": A clear, thought-provoking academic question testing the core concept (e.g. "What is the primary function and significance of a Process in an Operating System?").
   - "back": A comprehensive, in-depth explanation (at least 3-5 complete sentences). NEVER provide a short, single-sentence, or brief answer.
     Structure the back to explain:
     (1) Definition & Purpose: Exact definition and what it accomplishes.
     (2) Key Mechanism: How it works, its components, or how it transitions/executes.
     (3) Significance: Why it is important in the context of the document.
5. For multiple-choice questions:
   - "question": A challenging, clear question testing a specific concept, definition, or application from the text.
   - "options": Exactly 4 distinct, plausible choices (one correct answer, three realistic distractors).
   - "answer": The exact string matching the correct option.
   - "explanation": Detailed explanation of why the correct option is right and what the document explains.
   - "citation": Direct quote or concept from the text.

Respond ONLY with a valid JSON object in this exact schema:
{"flashcards":[{"front":"Detailed Question","back":"Comprehensive Multi-Sentence In-Depth Answer"}],"questions":[{"question":"Multiple Choice Question text","options":["Option A","Option B","Option C","Option D"],"answer":"Correct Option","explanation":"Detailed Explanation","citation":"Relevant text quote"}]}`
      : `You are an expert study tutor. Generate comprehensive study flashcards and quiz questions testing core principles for the topic: "${titleOrTopic}".
DO NOT make the question just the topic name.
For flashcards, the "back" MUST be an in-depth, comprehensive answer with at least 3-4 detailed sentences explaining the definition, purpose, and significance.
Respond ONLY with valid JSON in this exact structure:
{"flashcards":[{"front":"Specific Question","back":"Detailed Multi-Sentence Comprehensive Answer"}],"questions":[{"question":"Multiple Choice Question","options":["A","B","C","D"],"answer":"Correct option","explanation":"Detailed Explanation"}]}`;

    const userPrompt = isFileBased
      ? `DOCUMENT FILE CONTENT:\n\n${cleanedContent}\n\nTask: Generate exactly ${requestedFlashcards} flashcards and ${requestedQuestions} quiz questions testing specific concepts from the text above. Ensure every question is a complete, meaningful question about the subject matter.`
      : `Topic Name: ${titleOrTopic}\nTask: Generate exactly ${requestedFlashcards} flashcards and ${requestedQuestions} quiz questions that test understanding of ${titleOrTopic}.`;

    let flashcardsResult: { flashcards: { front: string; back: string }[] } | undefined;
    let quizResult: { questions: { question: string; options: string[]; answer: string; explanation: string; citation?: string }[] } | undefined;

    const githubKey = process.env.GITHUB_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    // 1. Primary: Try GitHub AI (GITHUB_API_KEY)
    // Master AI race: Bounded by 3.5 seconds total
    const aiPromise = (async () => {
      // 1. Primary: Try GitHub AI (GITHUB_API_KEY)
      if (githubKey) {
        try {
          const responseText = await callGithubAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], githubKey);

          const parsed = extractJSON(responseText);
          if (parsed) {
            const fcArray = parsed.flashcards || parsed.flash_cards || parsed.cards;
            if (Array.isArray(fcArray) && fcArray.length > 0) {
              flashcardsResult = {
                flashcards: fcArray.map((item: any) => ({
                  front: String(item.front || item.question || item.q || ''),
                  back: String(item.back || item.answer || item.a || '')
                }))
              };
            }
            const qArray = parsed.questions || parsed.quiz || parsed.quiz_questions;
            if (Array.isArray(qArray) && qArray.length > 0) {
              quizResult = {
                questions: qArray.map((item: any) => ({
                  question: String(item.question || item.q || ''),
                  options: Array.isArray(item.options) ? item.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
                  answer: String(item.answer || item.a || item.correct_answer || ''),
                  explanation: String(item.explanation || item.exp || item.reason || ''),
                  citation: item.citation ? String(item.citation) : undefined
                }))
              };
            }
          }
        } catch (githubErr) {
          console.warn('GitHub AI attempt warning:', githubErr);
        }
      }

      // 2. Pollinations AI (free, no API key required)
      if (!flashcardsResult || !quizResult) {
        try {
          const responseText = await callPollinationsAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ]);
          const parsed = extractJSON(responseText);
          if (parsed) {
            const fcArray = parsed.flashcards || parsed.flash_cards || parsed.cards;
            if (Array.isArray(fcArray) && fcArray.length > 0) {
              flashcardsResult = {
                flashcards: fcArray.map((item: any) => ({
                  front: String(item.front || item.question || item.q || ''),
                  back: String(item.back || item.answer || item.a || '')
                }))
              };
            }
            const qArray = parsed.questions || parsed.quiz || parsed.quiz_questions;
            if (Array.isArray(qArray) && qArray.length > 0) {
              quizResult = {
                questions: qArray.map((item: any) => ({
                  question: String(item.question || item.q || ''),
                  options: Array.isArray(item.options) ? item.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
                  answer: String(item.answer || item.a || item.correct_answer || ''),
                  explanation: String(item.explanation || item.exp || item.reason || ''),
                  citation: item.citation ? String(item.citation) : undefined
                }))
              };
            }
          }
        } catch (pollErr) {
          console.warn('Pollinations attempt warning:', pollErr);
        }
      }

      // 3. Gemini API fallback if key provided
      if ((!flashcardsResult || !quizResult) && geminiKey) {
        try {
          const responseText = await callGeminiAPI(systemPrompt, userPrompt, geminiKey);
          const parsed = extractJSON(responseText);
          if (parsed) {
            const fcArray = parsed.flashcards || parsed.flash_cards || parsed.cards;
            if (Array.isArray(fcArray) && fcArray.length > 0) {
              flashcardsResult = {
                flashcards: fcArray.map((item: any) => ({
                  front: String(item.front || item.question || item.q || ''),
                  back: String(item.back || item.answer || item.a || '')
                }))
              };
            }
            const qArray = parsed.questions || parsed.quiz || parsed.quiz_questions;
            if (Array.isArray(qArray) && qArray.length > 0) {
              quizResult = {
                questions: qArray.map((item: any) => ({
                  question: String(item.question || item.q || ''),
                  options: Array.isArray(item.options) ? item.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
                  answer: String(item.answer || item.a || item.correct_answer || ''),
                  explanation: String(item.explanation || item.exp || item.reason || ''),
                  citation: item.citation ? String(item.citation) : undefined
                }))
              };
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini API attempt warning:', geminiErr);
        }
      }

      // 4. NVIDIA NIM fallback if key provided
      if ((!flashcardsResult || !quizResult) && nvidiaKey) {
        try {
          const responseText = await callNvidiaAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ], nvidiaKey);

          const parsed = extractJSON(responseText);
          if (parsed) {
            const fcArray = parsed.flashcards || parsed.flash_cards || parsed.cards;
            if (Array.isArray(fcArray) && fcArray.length > 0) {
              flashcardsResult = {
                flashcards: fcArray.map((item: any) => ({
                  front: String(item.front || item.question || item.q || ''),
                  back: String(item.back || item.answer || item.a || '')
                }))
              };
            }
            const qArray = parsed.questions || parsed.quiz || parsed.quiz_questions;
            if (Array.isArray(qArray) && qArray.length > 0) {
              quizResult = {
                questions: qArray.map((item: any) => ({
                  question: String(item.question || item.q || ''),
                  options: Array.isArray(item.options) ? item.options.map(String) : ['Option A', 'Option B', 'Option C', 'Option D'],
                  answer: String(item.answer || item.a || item.correct_answer || ''),
                  explanation: String(item.explanation || item.exp || item.reason || ''),
                  citation: item.citation ? String(item.citation) : undefined
                }))
              };
            }
          }
        } catch (aiError) {
          console.warn('NVIDIA API attempt warning:', aiError);
        }
      }
    })();

    await Promise.race([
      aiPromise,
      new Promise(resolve => setTimeout(resolve, 3500))
    ]);

    // High-yield academic concept extraction fallback (runs in 5ms)
    if (!flashcardsResult || !quizResult) {
      console.log('Using high-speed academic study set generator');
      const fallback = generateAcademicStudySet(cleanedContent, titleOrTopic, requestedFlashcards, requestedQuestions);
      flashcardsResult = { flashcards: fallback.flashcards };
      quizResult = { questions: fallback.questions };
    }

    flashcardsResult.flashcards = flashcardsResult.flashcards.slice(0, requestedFlashcards);
    quizResult.questions = quizResult.questions.slice(0, requestedQuestions);

    // Fast batch save to DB with bounded race timeout to prevent serverless invocation timeout
    if (document && typeof document.id === 'string' && !document.id.startsWith('doc-')) {
      const docId = document.id;
      try {
        let uId = document.userId;
        if (!uId || uId === 'demo-user-id') {
          const dbDoc = await prisma.document.findUnique({
            where: { id: docId },
            select: { userId: true },
          });
          if (dbDoc?.userId) {
            uId = dbDoc.userId;
          } else {
            const user = await prisma.user.findFirst();
            uId = user ? user.id : 'demo-user-id';
          }
        }

        await Promise.race([
          Promise.all([
            prisma.flashcard.createMany({
              data: flashcardsResult.flashcards.map(fc => ({
                documentId: docId,
                userId: uId,
                front: fc.front,
                back: fc.back,
                nextReviewDate: new Date(),
              }))
            }),
            prisma.quizQuestion.createMany({
              data: quizResult.questions.map(q => ({
                documentId: docId,
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.answer,
                explanation: q.explanation,
                citation: q.citation,
              }))
            })
          ]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB batch save timed out')), 1200))
        ]);
      } catch (dbErr) {
        console.warn('DB batch save warning (non-blocking):', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      flashcardsCount: flashcardsResult.flashcards.length,
      questionsCount: quizResult.questions.length,
      flashcards: flashcardsResult.flashcards,
      questions: quizResult.questions,
    });
  } catch (error: unknown) {
    console.error('Generation Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate: ${msg}` }, { status: 500 });
  }
}


