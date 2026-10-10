const raw = `{"flashcards":[{"front":"What is OS?","back":"Operating Sys`;

function extractJSON(raw) {
  if (!raw) return null;
  let cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  cleaned = cleaned.substring(start);
  
  // brute force truncation fix
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
      chopped + '"]}]}'
    ];
    
    for (const f of fixes) {
      try {
        const parsed = JSON.parse(f);
        if (parsed.flashcards || parsed.questions || parsed.quiz) {
          return parsed;
        }
      } catch (e) {}
    }
    chopped = chopped.slice(0, -1);
  }
  
  return null;
}

console.time("BruteForceParse");
const parsed = extractJSON(raw);
console.timeEnd("BruteForceParse");
console.log(parsed ? "SUCCESS! Flashcards: " + parsed.flashcards.length : "FAILED");
