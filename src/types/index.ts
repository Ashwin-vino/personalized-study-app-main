export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  nextReviewDate?: string;
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  citation?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content?: string;
  fileType: 'pdf' | 'txt' | 'md' | 'topic';
  createdAt: string;
  flashcardsCount: number;
  questionsCount: number;
  progress: number;
  lastStudied?: string;
  lastQuizScore?: number;
  bestQuizScore?: number;
}

export interface StudySessionRecord {
  id: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
  flashcardsReviewed: number;
  weakTopics: string[];
  durationMinutes: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  dailyGoalMinutes: number;
  streakDays: number;
  totalCardsReviewed: number;
  totalQuizzesTaken: number;
  masteryPercentage: number;
}

export type NavTab = 
  | 'dashboard'
  | 'documents'
  | 'flashcards'
  | 'quizzes'
  | 'session'
  | 'analytics'
  | 'settings'
  | 'help';
