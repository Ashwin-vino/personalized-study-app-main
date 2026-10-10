const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.NVIDIA_API_KEY;

async function test() {
  const systemPrompt = `You are an expert study tutor and exam content extractor.

Respond ONLY with a valid JSON object in this exact structure:
{"flashcards":[{"front":"Extracted Question","back":"Correct Answer / Solution"}],"questions":[{"question":"Extracted Question","options":["Option A","Option B","Option C","Option D"],"answer":"Correct Option","explanation":"Detailed Explanation","citation":"Exact text / question from file"}]}`;

  const userPrompt = `DOCUMENT FILE CONTENT:
An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs.
Task: Generate exactly 2 flashcards and 2 quiz questions strictly derived from the file text above.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages,
        temperature: 0.2,
        max_tokens: 4096,
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("SUCCESS NVIDIA JSON:");
      console.log(data.choices[0].message.content);
    } else {
      console.log("FAIL NVIDIA:", await response.text());
    }
  } catch(e) {
    console.log("ERR:", e.message);
  }
}
test();
