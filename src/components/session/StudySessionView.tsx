"use client";

import React, { useState } from 'react';
import { 
  PlayCircle, 
  Layers, 
  BrainCircuit, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { DocumentItem, Flashcard, QuizQuestion, StudySessionRecord } from '@/types';
import { FlashcardsView } from '@/components/flashcards/FlashcardsView';
import { QuizView } from '@/components/quiz/QuizView';

interface StudySessionViewProps {
  documents: DocumentItem[];
  activeDoc: DocumentItem | null;
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  onAddSessionRecord: (record: StudySessionRecord) => void;
}

type SessionStage = 'config' | 'flashcards' | 'quiz' | 'results';

export function StudySessionView({
  documents,
  activeDoc,
  flashcards,
  quizzes,
  onAddSessionRecord
}: StudySessionViewProps) {
  const [stage, setStage] = useState<SessionStage>('config');
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [sessionWeakTopics, setSessionWeakTopics] = useState<string[]>([]);
  const [sessionDuration] = useState(15);

  const currentDocTitle = activeDoc ? activeDoc.title : (documents[0]?.title || 'Study Subject');

  const handleStartSession = () => {
    if (flashcards.length > 0) {
      setStage('flashcards');
    } else if (quizzes.length > 0) {
      setStage('quiz');
    } else {
      setStage('results');
    }
  };

  const handleFinishFlashcards = () => {
    setCardsReviewedCount(flashcards.length);
    if (quizzes.length > 0) {
      setStage('quiz');
    } else {
      finalizeSession(100, []);
    }
  };

  const handleFinishQuiz = (score: number, weakTopics: string[]) => {
    setQuizScore(score);
    setSessionWeakTopics(weakTopics);
    finalizeSession(score, weakTopics);
  };

  const finalizeSession = (score: number, weakTopics: string[]) => {
    const record: StudySessionRecord = {
      id: `session-${Date.now()}`,
      title: currentDocTitle,
      date: new Date().toISOString(),
      score: score,
      totalQuestions: quizzes.length,
      flashcardsReviewed: cardsReviewedCount || flashcards.length,
      weakTopics: weakTopics,
      durationMinutes: sessionDuration
    };
    onAddSessionRecord(record);
    setStage('results');
  };

  // Config Stage
  if (stage === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Guided Learning Flow</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Start Guided Study Session
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              This session will guide you step-by-step through flashcard active recall and practice quiz evaluation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Target Material</h4>
            <div className="flex items-center justify-between text-sm text-slate-800 dark:text-zinc-200">
              <span className="font-bold">{currentDocTitle}</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{flashcards.length} Cards • {quizzes.length} Quizzes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white">Stage 1: Flashcards</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">SRS Active Recall</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white">Stage 2: Quiz</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Knowledge Evaluation</p>
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Begin Guided Session</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Flashcards Stage
  if (stage === 'flashcards') {
    return (
      <div className="space-y-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">STAGE 1: FLASHCARD REVIEW</span>
          <button 
            onClick={() => setStage('quiz')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip to Quiz Stage →
          </button>
        </div>
        <FlashcardsView
          flashcards={flashcards}
          activeDoc={activeDoc}
          onUpdateFlashcardSRS={() => {}}
          onFinishReview={handleFinishFlashcards}
        />
      </div>
    );
  }

  // Quiz Stage
  if (stage === 'quiz') {
    return (
      <div className="space-y-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <span className="text-purple-600 dark:text-purple-400 font-bold">STAGE 2: PRACTICE QUIZ EVALUATION</span>
        </div>
        <QuizView
          questions={quizzes}
          activeDoc={activeDoc}
          onFinishQuiz={handleFinishQuiz}
        />
      </div>
    );
  }

  // Results Stage
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Session Complete!
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Summary of your learning activity for <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentDocTitle}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-center">
          <div>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{cardsReviewedCount || flashcards.length}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Flashcards Reviewed</p>
          </div>
          <div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{quizScore !== null ? `${quizScore}%` : 'N/A'}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Quiz Performance</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{sessionDuration} m</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Duration</p>
          </div>
        </div>

        {sessionWeakTopics.length > 0 ? (
          <div className="text-left space-y-2 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Recommended Follow-up Topics:</span>
            </p>
            <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 list-disc list-inside">
              {sessionWeakTopics.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs text-left flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Outstanding retention! No weak topics identified in this session.</span>
          </div>
        )}

        <button
          onClick={() => setStage('config')}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Another Session</span>
        </button>
      </div>
    </div>
  );
}

