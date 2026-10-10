"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  BookOpen, 
  Sparkles,
  Flame,
  Zap,
  Trophy,
  Check,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { QuizQuestion, DocumentItem } from '@/types';

interface QuizViewProps {
  questions: QuizQuestion[];
  activeDoc: DocumentItem | null;
  onFinishQuiz: (score: number, weakTopics: string[]) => void;
}

export function QuizView({
  questions,
  activeDoc,
  onFinishQuiz
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentQuestion = questions[currentIndex];

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-300 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-500 space-y-4 animate-in fade-in">
        <BrainCircuit className="w-12 h-12 mx-auto opacity-30 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">No Quiz Questions Available</h3>
        <p className="text-sm">Upload a document or select a topic to generate quiz questions.</p>
      </div>
    );
  }

  // Robust answer matching helper
  const isAnswerMatch = (option: string, answer: string, optionIndex: number): boolean => {
    if (!option || !answer) return false;
    const cleanOpt = option.trim().toLowerCase();
    const cleanAns = answer.trim().toLowerCase();

    // 1. Exact equality
    if (cleanOpt === cleanAns) return true;

    // 2. Letter match (e.g. answer is "A", "Option A", "A)", "1")
    const letter = String.fromCharCode(65 + optionIndex).toLowerCase();
    if (
      cleanAns === letter || 
      cleanAns === `option ${letter}` || 
      cleanAns === `${letter})` || 
      cleanAns === `option ${optionIndex + 1}` || 
      cleanAns === String(optionIndex + 1)
    ) {
      return true;
    }

    // 3. Strip prefix e.g. "A) Photosynthesis" vs "Photosynthesis"
    const optTextWithoutPrefix = cleanOpt.replace(/^[a-d][\s\).:-]+/i, '').trim();
    const ansTextWithoutPrefix = cleanAns.replace(/^[a-d][\s\).:-]+/i, '').trim();
    if (optTextWithoutPrefix === ansTextWithoutPrefix) return true;

    // 4. Substring inclusion
    if (cleanAns.length > 4 && (cleanOpt.includes(cleanAns) || cleanAns.includes(cleanOpt))) {
      return true;
    }

    return false;
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Compute live score metrics
  const answeredIndices = Object.keys(selectedAnswers).map(Number);
  const answeredCount = answeredIndices.length;

  let currentStreak = 0;
  let maxStreak = 0;
  let runningCorrect = 0;

  for (let i = 0; i <= currentIndex; i++) {
    const selected = selectedAnswers[i];
    if (selected) {
      const isCorrect = questions[i].options.some((opt, j) => selected === opt && isAnswerMatch(opt, questions[i].answer, j));
      if (isCorrect) {
        runningCorrect++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }
  }

  // Final score calculations
  const totalCorrect = questions.reduce((acc, q, idx) => {
    const selected = selectedAnswers[idx];
    if (!selected) return acc;
    const isCorrect = q.options.some((opt, j) => selected === opt && isAnswerMatch(opt, q.answer, j));
    return isCorrect ? acc + 1 : acc;
  }, 0);

  const scorePercentage = Math.round((totalCorrect / questions.length) * 100);
  const pointsEarned = totalCorrect * 100 + maxStreak * 25;

  const weakTopics = questions
    .filter((q, idx) => {
      const selected = selectedAnswers[idx];
      if (!selected) return true;
      return !q.options.some((opt, j) => selected === opt && isAnswerMatch(opt, q.answer, j));
    })
    .map(q => q.question.slice(0, 45) + '...');

  const getGradeInfo = (pct: number) => {
    if (pct === 100) return { grade: 'S', label: 'Mastery Achieved!', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (pct >= 90) return { grade: 'A+', label: 'Outstanding!', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 80) return { grade: 'A', label: 'Strong Knowledge!', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 70) return { grade: 'B', label: 'Good Recall', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' };
    if (pct >= 60) return { grade: 'C', label: 'Review Recommended', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { grade: 'D', label: 'Needs Practice', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const handleComplete = () => {
    setIsSaved(true);
    onFinishQuiz(scorePercentage, weakTopics);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setShowReview(false);
    setIsSaved(false);
  };

  // Completed Score Screen
  if (isCompleted) {
    const grade = getGradeInfo(scorePercentage);
    const prevBest = activeDoc?.bestQuizScore;
    const isNewBest = prevBest !== undefined && scorePercentage > prevBest;

    return (
      <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 space-y-7 animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Score Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Quiz Performance Summary</span>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${grade.color}`}>
              <span className="text-3xl leading-none">{grade.grade}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Grade</span>
            </div>
            <div className="text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {grade.label}
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                You achieved a final score of <span className="font-extrabold text-purple-600 dark:text-purple-400">{scorePercentage}%</span> on &quot;{activeDoc?.title || 'Study Material'}&quot;.
              </p>
              {isNewBest && (
                <span className="inline-block text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  🎉 New Personal High Score! (+{scorePercentage - prevBest}% gain)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Scores Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800">
          <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/60 space-y-0.5">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Final Score</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{scorePercentage}%</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/60 space-y-0.5">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Points Earned</p>
            <p className="text-2xl font-black text-amber-500 dark:text-amber-400">+{pointsEarned} XP</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/60 space-y-0.5">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Correct</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalCorrect}/{questions.length}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/60 space-y-0.5">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Best Streak</p>
            <p className="text-2xl font-black text-rose-500 dark:text-rose-400">🔥 {maxStreak}</p>
          </div>
        </div>

        {/* Weak Topics Section */}
        {weakTopics.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Recommended Topics for Review ({weakTopics.length})</span>
            </div>
            <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 list-disc list-inside">
              {weakTopics.map((t, idx) => (
                <li key={idx} className="truncate">{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Question-by-Question Review Accordion */}
        <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full p-4 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between text-sm font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Review All Questions & Answers ({questions.length})</span>
            </span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReview && (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800/80 p-4 space-y-4 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => {
                const userPick = selectedAnswers[idx];
                const isCorrect = q.options.some((opt, j) => userPick === opt && isAnswerMatch(opt, q.answer, j));
                return (
                  <div key={idx} className="pt-3 first:pt-0 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isCorrect ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{q.question}</p>
                    </div>
                    <div className="pl-7 space-y-1 text-xs">
                      <p className="text-slate-500 dark:text-zinc-400">
                        Your answer: <span className={isCorrect ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-bold text-rose-600 dark:text-rose-400'}>{userPick || 'Unanswered'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-slate-500 dark:text-zinc-400">
                          Correct answer: <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.answer}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-lg">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-sm border border-slate-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={handleComplete}
            disabled={isSaved}
            className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Score Saved! ✨</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Finish & Save Score ({scorePercentage}%)</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const selectedOpt = selectedAnswers[currentIndex];
  const hasAnswered = selectedOpt !== undefined;
  const isCurrentPickCorrect = hasAnswered && currentQuestion.options.some((opt, j) => selectedOpt === opt && isAnswerMatch(opt, currentQuestion.answer, j));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Quiz Live Score & Progress Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>

          {/* Live Score & Streak Pills */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Score: {runningCorrect}/{answeredCount > 0 ? answeredCount : 1} ({answeredCount > 0 ? Math.round((runningCorrect / answeredCount) * 100) : 0}%)</span>
            </span>

            {currentStreak > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs animate-bounce">
                <Flame className="w-3.5 h-3.5" />
                <span>{currentStreak} Streak</span>
              </span>
            )}

            {activeDoc?.bestQuizScore !== undefined && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <Trophy className="w-3 h-3" />
                <span>Best: {activeDoc.bestQuizScore}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Question Progress Pill Navigator */}
        <div className="flex items-center gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const pick = selectedAnswers[idx];
            const isAnswered = pick !== undefined;
            const isCorrect = isAnswered && q.options.some((opt, j) => pick === opt && isAnswerMatch(opt, q.answer, j));
            const isCurrent = idx === currentIndex;

            let pillStyle = 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500';
            if (isAnswered) {
              pillStyle = isCorrect
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-rose-500 text-white font-bold';
            } else if (isCurrent) {
              pillStyle = 'bg-purple-600 text-white font-bold ring-2 ring-purple-400/50';
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-1 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${pillStyle}`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Multiple Choice Question #{currentIndex + 1}
            </span>
            {hasAnswered && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isCurrentPickCorrect 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}>
                {isCurrentPickCorrect ? '+100 XP Correct!' : 'Incorrect'}
              </span>
            )}
          </div>
          <h3 className="text-lg md:text-xl font-bold leading-relaxed text-slate-900 dark:text-zinc-100">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, j) => {
            const isSelected = selectedOpt === opt;
            const isOptionCorrect = isAnswerMatch(opt, currentQuestion.answer, j);
            
            let btnStyle = 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 hover:border-purple-500/50';

            if (hasAnswered) {
              if (isOptionCorrect) {
                btnStyle = 'bg-emerald-500/15 border-emerald-500/80 text-emerald-800 dark:text-emerald-300 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-rose-500/15 border-rose-500/80 text-rose-800 dark:text-rose-300';
              } else {
                btnStyle = 'bg-slate-100 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800/40 text-slate-400 dark:text-zinc-500 opacity-60';
              }
            } else if (isSelected) {
              btnStyle = 'bg-purple-500/20 border-purple-500 text-purple-900 dark:text-purple-300';
            }

            return (
              <button
                key={j}
                onClick={() => handleSelectOption(opt)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded-xl border font-medium text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800/80 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-400 shrink-0">
                    {String.fromCharCode(65 + j)}
                  </span>
                  <span>{opt}</span>
                </div>
                {hasAnswered && isOptionCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                {hasAnswered && isSelected && !isOptionCorrect && <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation & Source Citation Card */}
        {hasAnswered && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explanation & Context</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.citation && (
              <div className="pt-2 text-[11px] text-slate-500 dark:text-zinc-500 font-mono italic border-t border-slate-200 dark:border-zinc-800/60">
                Source Excerpt: &quot;{currentQuestion.citation}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Question Control */}
      {hasAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 cursor-pointer"
        >
          <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Score & Results'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
