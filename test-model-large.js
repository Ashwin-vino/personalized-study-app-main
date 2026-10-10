const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyLine = env.split('\n').find(l => l.startsWith('NVIDIA_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim().replace(/^"|"$/g, '') : '';
const m = 'meta/llama-3.2-11b-vision-instruct';

const largeText = 'A'.repeat(20000); // 20k characters

fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
  body: JSON.stringify({ model: m, messages: [{role: 'system', content: 'You are an AI.'}, {role: 'user', content: largeText}], temperature: 0.2, max_tokens: 4096 })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
