fetch('https://text.pollinations.ai/', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ 
    messages: [
      { role: 'system', content: 'You are a bot. Return JSON: {"a": 1}' }, 
      { role: 'user', content: 'hi' }
    ], 
    model: 'openai', 
    jsonMode: true 
  }) 
}).then(r => r.text()).then(console.log).catch(console.error);
