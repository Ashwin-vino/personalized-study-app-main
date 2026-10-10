import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

async function callGithubAI(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  const candidateModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'meta-llama-3.1-8b-instruct',
    'mistral-large',
  ];

  const endpoints = [
    'https://models.github.ai/inference/chat/completions',
    'https://models.inference.ai.azure.com/chat/completions',
  ];

  let lastError = '';

  for (const endpoint of endpoints) {
    for (const model of candidateModels) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'PersonalizedStudyAssistant',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2048,
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
          if (text && text.trim().length > 5 && !text.startsWith('OK')) {
            return text;
          }
        }
        const errText = await response.text().catch(() => '');
        lastError = `GitHub AI Chat ${response.status} (${model}): ${errText.slice(0, 100)}`;
      } catch (err: unknown) {
        clearTimeout(timeout);
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  throw new Error(lastError || 'Failed to chat with GitHub AI API');
}

async function callGeminiAPI(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastErr: unknown;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${userMessage}`);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim()) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini Chat API] Model ${modelName} failed, trying next:`, err);
    }
  }
  throw lastErr || new Error('All Gemini chat models failed');
}

async function callNvidiaAPI(messages: { role: string; content: string }[], apiKey: string): Promise<string> {
  const candidateModels = [
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'meta/llama-3.2-90b-vision-instruct',
    'mistralai/mistral-large-2-instruct',
  ];

  let lastError = '';

  for (const modelName of candidateModels) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
          temperature: 0.7,
          max_tokens: 2048,
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

  throw new Error(lastError || 'Failed to generate response with NVIDIA NIM API');
}

async function callPollinationsAPI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      messages,
      model: 'openai',
    }),
  });
  if (!response.ok) throw new Error('Pollinations Chat API failed');
  return response.text();
}

export async function POST(req: Request) {
  try {
    const { documentId, documentContent: clientContent, documentTitle: clientTitle, messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    let documentContent = clientContent ? String(clientContent).slice(0, 15000) : "";
    
    if (!documentContent && documentId && !documentId.startsWith('doc-')) {
      try {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });
        if (document) {
          documentContent = document.content.slice(0, 15000);
        }
      } catch (dbErr) {
        console.warn('DB Document fetch warning for chat:', dbErr);
      }
    }

    const githubKey = process.env.GITHUB_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    const systemPrompt = documentContent 
      ? `You are an expert AI study tutor. Answer the user's questions clearly, accurately, and concisely based primarily on the following context from their study document${clientTitle ? ` ("${clientTitle}")` : ''}:\n\n<context>\n${documentContent}\n</context>`
      : `You are a helpful AI study assistant. Answer general study questions clearly and concisely.`;

    const userLastMessage = messages[messages.length - 1]?.content || "Can you explain this material?";

    // 1. Primary: Try GitHub AI (GITHUB_API_KEY)
    if (githubKey) {
      try {
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }))
        ];
        const aiResponse = await callGithubAI(formattedMessages, githubKey);
        if (aiResponse && aiResponse.trim()) {
          return NextResponse.json({ role: "assistant", content: aiResponse });
        }
      } catch (ghErr) {
        console.warn('GitHub AI chat warning:', ghErr);
      }
    }

    // 2. Try Gemini API
    if (geminiKey) {
      try {
        const aiResponse = await callGeminiAPI(systemPrompt, userLastMessage, geminiKey);
        if (aiResponse && aiResponse.trim()) {
          return NextResponse.json({ role: "assistant", content: aiResponse });
        }
      } catch (gErr) {
        console.warn('Gemini chat error:', gErr);
      }
    }

    // 2. Try NVIDIA API
    if (nvidiaKey) {
      try {
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }))
        ];
        const aiResponse = await callNvidiaAPI(formattedMessages, nvidiaKey);
        if (aiResponse && aiResponse.trim()) {
          return NextResponse.json({ role: "assistant", content: aiResponse });
        }
      } catch (nErr) {
        console.warn('NVIDIA chat error:', nErr);
      }
    }

    // 3. Try Free Pollinations AI API
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }))
      ];
      const aiResponse = await callPollinationsAPI(formattedMessages);
      if (aiResponse && aiResponse.trim()) {
        return NextResponse.json({ role: "assistant", content: aiResponse.trim() });
      }
    } catch (pErr) {
      console.warn('Pollinations AI chat error:', pErr);
    }

    // 4. Smart Fallback response based on document content or query
    let fallbackReply = "";
    if (documentContent) {
      const match = documentContent.slice(0, 500);
      fallbackReply = `Based on your study document: "${match.replace(/\s+/g, ' ')}...". Let me know if you would like me to summarize specific concepts or test you with more questions!`;
    } else {
      fallbackReply = `I'm here to help you study! Ask me any concept from your uploaded material or study topic, and I will break it down clearly for you.`;
    }

    return NextResponse.json({ 
      role: "assistant", 
      content: fallbackReply
    });

  } catch (error: unknown) {
    console.error('Chat Error:', error);
    return NextResponse.json({ 
      role: "assistant", 
      content: "I'm ready to assist with your study questions! Feel free to upload a document or ask about any study topic." 
    });
  }
}


