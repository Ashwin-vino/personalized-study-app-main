const systemPrompt = `You are an expert study tutor and exam content extractor.
Respond ONLY with a valid JSON object in this exact structure:
{"flashcards":[{"front":"Extracted Question","back":"Correct Answer / Solution"}],"questions":[{"question":"Extracted Question","options":["Option A","Option B","Option C","Option D"],"answer":"Correct Option","explanation":"Detailed Explanation","citation":"Exact text / question from file"}]}`;

const userPrompt = `DOCUMENT FILE CONTENT: This is some dummy text for a study file. Task: Generate exactly 5 flashcards and 5 quiz questions.`;

fetch('https://text.pollinations.ai/', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ 
    messages: [
      { role: 'system', content: systemPrompt }, 
      { role: 'user', content: userPrompt }
    ], 
    model: 'openai', 
    jsonMode: true 
  }) 
}).then(r => r.text()).then(console.log).catch(console.error);
