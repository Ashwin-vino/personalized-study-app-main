const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyLine = env.split('\n').find(l => l.startsWith('NVIDIA_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim().replace(/^"|"$/g, '') : '';
const candidateModels = [
    'meta/llama-3.2-11b-vision-instruct',
    'meta/llama-3.2-90b-vision-instruct',
    'meta/llama-3.1-8b-instruct',
    'mistralai/mistral-large-2-instruct'
];

const messages = [
  { role: 'system', content: 'You are an AI' },
  { role: 'user', content: 'test' }
];

async function run() {
  for (const modelName of candidateModels) {
    console.log(`Testing ${modelName}...`);
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
          max_tokens: 4096,
        })
      });
      const text = await response.text();
      console.log(`${modelName} returned ${response.status}: ${text.substring(0, 200)}`);
    } catch (e) {
      console.error(e);
    }
  }
}
run();
