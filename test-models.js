const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyLine = env.split('\n').find(l => l.startsWith('NVIDIA_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim().replace(/^"|"$/g, '') : '';
const models = [
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-90b-vision-instruct',
  'meta/llama2-70b',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'nvidia/llama3-chatqa-1.5-70b',
  'mistralai/mistral-large-2-instruct',
  'google/gemma-3-12b-it'
];
Promise.all(models.map(m =>
  fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ model: m, messages: [{role: 'user', content: 'test'}] })
  })
  .then(r => r.json())
  .then(j => console.log(m, j.status || 200, j.title || 'OK'))
));
