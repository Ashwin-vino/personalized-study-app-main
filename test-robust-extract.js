const raw = `{"flashcards":[{"front":"What is an operating system (OS)?","back":"System software that manages computer hardware, software resources, and provides common services for computer programs."},{"front":"What is the primary function of an operating system (OS)?","back":"To manage computer hardware, software resources, and provide common services for computer programs."}], "questions":[{"question":"What is an operating system (OS)?","options":["System software that manages computer hardware, software resources, and provides common services for computer programs.","Application software that provides common services for computer programs.","System hardware that manages computer resources.","System software that provides common services for computer programs."],"answer":"System software that manages computer hardware, software resources, and provides common services for computer programs.","explanation":"An operating system is a type of system software that manages computer hardware and software resources, and provides common services for computer programs. It acts as an intermediary between computer hardware and software applications, allowing them to communicate with each other efficiently.","citation":"An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs."},{"question":"What is the primary function of an operating system (OS)?","options":["To manage computer hardware, software resources, and provide common services for computer programs.","To provide common services for computer programs only.","To manage computer hardware only.","To manage software resources only."],"answer":"To manage computer hardware, software resources, and provide common services for computer programs.","explanation":"The primary function of an operating system is to manage computer hardware, software resources, and provide common services for computer programs. This includes tasks such as process scheduling, memory management, and file system management.","citation":"An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs."}]`;

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
  
  const fixes = [
    cleaned,
    cleaned + '}',
    cleaned + ']}',
    cleaned + '"]}'
  ];
  
  for (const f of fixes) {
    try {
      return JSON.parse(f);
    } catch (e) {
      try {
        const sanitized = f
          .replace(/,\s*([\]}])/g, '$1')
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\r\n]/g, ' ');
        return JSON.parse(sanitized);
      } catch (e2) {}
    }
  }
  
  const end = cleaned.lastIndexOf('}');
  if (end !== -1) {
    const sub = cleaned.substring(0, end + 1);
    try {
      return JSON.parse(sub);
    } catch (e) {}
  }
  
  return null;
}

const parsed = extractJSON(raw);
console.log(parsed ? "SUCCESS! Parsed questions: " + parsed.questions.length : "FAILED");
