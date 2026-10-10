export interface StudySetResult {
  flashcards: { front: string; back: string }[];
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    citation?: string;
  }[];
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

export function generateAcademicStudySet(
  text: string,
  topicOrTitle: string,
  requestedFlashcards = 5,
  requestedQuestions = 5
): StudySetResult {
  const cleanTitle = (topicOrTitle || 'Study Subject')
    .replace(/\.[^/.]+$/, '')
    .replace(/^Topic:\s*/i, '')
    .replace(/^Study Topic:\s*/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  const cleanedInput = (text || '')
    .replace(/^Topic:\s*/gi, '')
    .replace(/^Study Topic:\s*/gi, '')
    .trim();

  // Extract meaningful conceptual sentences
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
        ...allDistractors
      ];
      for (const cand of candidates) {
        if (!cand) continue;
        const formatted = cand.length > 120 ? cand.slice(0, 120) + '...' : cand;
        if (!uniqueOpts.includes(formatted)) {
          uniqueOpts.push(formatted);
        }
        if (uniqueOpts.length === 4) break;
      }
      const shuffled = uniqueOpts.sort(() => 0.5 - ((i * 3 + uniqueOpts.length) % 2));

      questions.push({
        question: `According to ${cleanTitle}, what key insight is established regarding "${keySubject}..."?`,
        options: shuffled,
        answer: correct,
        explanation: `Text reference: "${target}"`,
        citation: target
      });
    } else {
      const facet = TOPIC_FACETS[i % TOPIC_FACETS.length];
      const correct = facet.correctOption(cleanTitle);
      const shuffled = [correct, ...facet.distractors].sort(() => 0.5 - ((i * 3) % 2));

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
