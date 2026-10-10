const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyLine = env.split('\n').find(l => l.startsWith('NVIDIA_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim().replace(/^"|"$/g, '') : '';
const m = 'meta/llama-3.2-11b-vision-instruct';
const largeText = 'A'.repeat(80000); 

async function run() {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model: m, messages: [{role: 'system', content: 'You are an AI.'}, {role: 'user', content: largeText}], temperature: 0.2, max_tokens: 4096 })
  });
  const text = await response.text();
  console.log(`Status: ${response.status}`, text.substring(0, 300));
}
run();
