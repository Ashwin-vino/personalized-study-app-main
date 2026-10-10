import { DocumentItem, Flashcard, QuizQuestion, StudySessionRecord, UserProfile } from '@/types';

const DOCUMENTS_KEY = 'nexora_documents';
const FLASHCARDS_KEY = 'nexora_flashcards';
const QUIZZES_KEY = 'nexora_quizzes';
const SESSIONS_KEY = 'nexora_sessions';
const PROFILE_KEY = 'nexora_profile';
const ACTIVE_DOC_KEY = 'nexora_active_doc';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Vance',
  email: 'alex.vance@nexora.ai',
  dailyGoalMinutes: 25,
  streakDays: 6,
  totalCardsReviewed: 142,
  totalQuizzesTaken: 18,
  masteryPercentage: 78,
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-demo-1',
    title: 'Introduction to Spaced Repetition & Cognitive Load',
    fileType: 'pdf',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    flashcardsCount: 8,
    questionsCount: 5,
    progress: 85,
    lastStudied: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    lastQuizScore: 92,
    bestQuizScore: 92,
  },
  {
    id: 'doc-demo-2',
    title: 'Neural Networks Architecture & Optimization',
    fileType: 'txt',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
    flashcardsCount: 10,
    questionsCount: 6,
    progress: 60,
    lastStudied: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    lastQuizScore: 75,
    bestQuizScore: 75,
  },
  {
    id: 'doc-demo-3',
    title: 'Cellular Respiration & ATP Synthesis',
    fileType: 'topic',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
    flashcardsCount: 6,
    questionsCount: 4,
    progress: 40,
    lastStudied: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    lastQuizScore: 80,
    bestQuizScore: 80,
  }
];

export const INITIAL_FLASHCARDS: Record<string, Flashcard[]> = {
  'doc-demo-1': [
    {
      front: 'What is the primary objective of the SuperMemo-2 (SM-2) algorithm?',
      back: 'To optimize the interval between reviews based on user recall difficulty, minimizing forgetting while reducing unnecessary reviews.',
      easeFactor: 2.5,
      repetitions: 3,
      nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString()
    },
    {
      front: 'What happens to the Ease Factor when a card response is rated as difficult (Rating 3)?',
      back: 'The Ease Factor decreases, shortening future interval jumps so the card is tested more frequently.',
      easeFactor: 2.36,
      repetitions: 2,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      front: 'Define Cognitive Load Theory in the context of personalized learning.',
      back: 'Cognitive Load Theory posits that human working memory has limited capacity; micro-chunking materials prevents mental overload.',
      easeFactor: 2.6,
      repetitions: 4,
      nextReviewDate: new Date(Date.now() + 86400000 * 4).toISOString()
    },
    {
      front: 'What is the role of active recall in long-term memory consolidation?',
      back: 'Retrieving information from memory strengthens neural pathways far more effectively than passive re-reading.',
      easeFactor: 2.5,
      repetitions: 1,
      nextReviewDate: new Date().toISOString()
    },
    {
      front: 'How does interval spacing impact the forgetting curve according to Ebbinghaus?',
      back: 'Spacing reviews right before predicted memory decay flattens the forgetting curve over time.',
      easeFactor: 2.4,
      repetitions: 2,
      nextReviewDate: new Date().toISOString()
    }
  ],
  'doc-demo-2': [
    {
      front: 'What is the main advantage of Residual Networks (ResNets)?',
      back: 'Skip connections allow gradients to flow directly through deep architectures, solving the vanishing gradient problem.',
      easeFactor: 2.5,
      repetitions: 2,
      nextReviewDate: new Date().toISOString()
    },
    {
      front: 'How does Adam optimizer differ from Standard SGD with Momentum?',
      back: 'Adam maintains individual adaptive learning rates for each parameter based on first and second moment estimates of gradients.',
      easeFactor: 2.5,
      repetitions: 1,
      nextReviewDate: new Date().toISOString()
    }
  ]
};

export const INITIAL_QUIZZES: Record<string, QuizQuestion[]> = {
  'doc-demo-1': [
    {
      question: 'According to Spaced Repetition principles, when is the optimal time to review a flashcard?',
      options: [
        'Immediately after learning it for the first time',
        'Right before the predicted point of memory decay',
        'Every 24 hours regardless of difficulty',
        'Only when a user fails a comprehensive exam'
      ],
      answer: 'Right before the predicted point of memory decay',
      explanation: 'Retrieval practice immediately before memory decay yields the strongest neuroplastic reinforcement.',
      citation: 'Section 2.1 - Memory Decay & Optimal Spacing'
    },
    {
      question: 'Which factor directly determines the next review interval in SM-2 algorithms?',
      options: [
        'Total number of words in the flashcard',
        'The current Ease Factor and previous interval length',
        'The user profile registration date',
        'The document PDF file size'
      ],
      answer: 'The current Ease Factor and previous interval length',
      explanation: 'Interval = Previous Interval * Ease Factor when rated successfully.',
      citation: 'Section 3.4 - Spaced Repetition Formulae'
    },
    {
      question: 'What is the main limitation of passive re-reading compared to active retrieval?',
      options: [
        'Passive reading takes twice as long as writing notes',
        'It creates an illusion of competence without building strong neural recall pathways',
        'It requires specialized AI hardware',
        'It is prohibited by cognitive scientists'
      ],
      answer: 'It creates an illusion of competence without building strong neural recall pathways',
      explanation: 'Passive reading feels effortless, leading students to falsely believe they have mastered content they cannot recall independently.',
      citation: 'Section 1.3 - Illusion of Mastery'
    }
  ]
};

export const INITIAL_SESSIONS: StudySessionRecord[] = [
  {
    id: 'session-1',
    title: 'Spaced Repetition & Learning Review',
    date: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    score: 92,
    totalQuestions: 5,
    flashcardsReviewed: 12,
    weakTopics: ['Ease Factor Calculation'],
    durationMinutes: 15,
  },
  {
    id: 'session-2',
    title: 'Neural Networks & Optimization Quiz',
    date: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    score: 75,
    totalQuestions: 6,
    flashcardsReviewed: 8,
    weakTopics: ['Adam Optimizer Moments', 'Vanishing Gradients'],
    durationMinutes: 20,
  }
];

export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
  } catch (err) {
    console.warn('Failed to save documents to localStorage:', err);
  }
}

export function getStoredFlashcards(docId?: string): Flashcard[] {
  if (typeof window === 'undefined') return INITIAL_FLASHCARDS['doc-demo-1'] || [];
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    const map = raw ? JSON.parse(raw) : INITIAL_FLASHCARDS;
    if (docId) return map[docId] || [];
    // Flatten all cards if no docId
    return Object.values(map).flat() as Flashcard[];
  } catch {
    return INITIAL_FLASHCARDS['doc-demo-1'] || [];
  }
}

export function saveStoredFlashcards(docId: string, cards: Flashcard[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    const map = raw ? JSON.parse(raw) : { ...INITIAL_FLASHCARDS };
    map[docId] = cards;
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save flashcards:', err);
  }
}

export function getStoredQuizzes(docId?: string): QuizQuestion[] {
  if (typeof window === 'undefined') return INITIAL_QUIZZES['doc-demo-1'] || [];
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    const map = raw ? JSON.parse(raw) : INITIAL_QUIZZES;
    if (docId) return map[docId] || [];
    return Object.values(map).flat() as QuizQuestion[];
  } catch {
    return INITIAL_QUIZZES['doc-demo-1'] || [];
  }
}

export function saveStoredQuizzes(docId: string, questions: QuizQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    const map = raw ? JSON.parse(raw) : { ...INITIAL_QUIZZES };
    map[docId] = questions;
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save quizzes:', err);
  }
}

export function getStoredSessions(): StudySessionRecord[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SESSIONS;
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function addStoredSession(session: StudySessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const sessions = getStoredSessions();
    const updated = [session, ...sessions];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to add session:', err);
  }
}

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile:', err);
  }
}

export function getActiveDocumentId(): string | null {
  if (typeof window === 'undefined') return 'doc-demo-1';
  try {
    return localStorage.getItem(ACTIVE_DOC_KEY) || 'doc-demo-1';
  } catch {
    return 'doc-demo-1';
  }
}

export function setActiveDocumentId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) localStorage.setItem(ACTIVE_DOC_KEY, id);
    else localStorage.removeItem(ACTIVE_DOC_KEY);
  } catch (err) {
    console.warn('Failed to save active doc id:', err);
  }
}
