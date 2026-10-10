"use client";

import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Layers, 
  BrainCircuit, 
  AlertTriangle, 
  Clock, 
  Award,
  Calendar
} from 'lucide-react';
import { UserProfile, StudySessionRecord } from '@/types';

interface AnalyticsViewProps {
  user: UserProfile;
  sessions: StudySessionRecord[];
}

export function AnalyticsView({ user, sessions }: AnalyticsViewProps) {
  // Weekly mock retention curve data
  const weeklyData = [
    { day: 'Mon', cards: 24, score: 85 },
    { day: 'Tue', cards: 18, score: 78 },
    { day: 'Wed', cards: 32, score: 92 },
    { day: 'Thu', cards: 28, score: 88 },
    { day: 'Fri', cards: 15, score: 70 },
    { day: 'Sat', cards: 40, score: 95 },
    { day: 'Sun', cards: 22, score: 82 },
  ];

  const maxCards = Math.max(...weeklyData.map(d => d.cards));

  const allWeakTopics = Array.from(
    new Set(sessions.flatMap(s => s.weakTopics))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Overall Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{user.masteryPercentage}%</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">↑ +4% from last week</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Cards Reviewed</span>
            <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{user.totalCardsReviewed}</p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Total active recall count</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Quizzes Completed</span>
            <BrainCircuit className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{user.totalQuizzesTaken}</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Average 84% accuracy</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{user.streakDays} Days</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Daily learning habit active</p>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Activity Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                Weekly Study Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Flashcards reviewed per day</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              7 Day View
            </span>
          </div>

          {/* Minimal SVG Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-200 dark:border-zinc-800">
            {weeklyData.map((d, i) => {
              const heightPercent = Math.round((d.cards / maxCards) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.cards}
                  </span>
                  <div 
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium pb-2">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1">
            <span>Peak Day: Saturday (40 cards)</span>
            <span>Weekly Goal: 150 cards (84% reached)</span>
          </div>
        </div>

        {/* Retention & Mastery Score Curve */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
              Memory Retention Curve
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Ebbinghaus forgetting curve estimation</p>
          </div>

          {/* Minimal SVG Line Curve */}
          <div className="relative h-36 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
              <path
                d="M 10 20 Q 60 40, 100 30 T 190 15"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">78%</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 text-center leading-relaxed">
            Your spaced repetition schedule is keeping retention 22% higher than standard cramming methods.
          </p>
        </div>

      </div>

      {/* Bottom Section: Weak Topics & Session Log Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Weak Topics Analysis */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
              Weak Topics Breakdown
            </h3>
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>

          <div className="space-y-3">
            {allWeakTopics.length > 0 ? (
              allWeakTopics.map((topic, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200">{topic}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500">Requires review focus</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                    Priority Review
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-500">
                No weak topics flagged currently!
              </div>
            )}
          </div>
        </div>

        {/* Study Sessions History */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
              Session History ({sessions.length})
            </h3>
            <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-200">{s.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    {new Date(s.date).toLocaleDateString()} • {s.durationMinutes} mins
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{s.score}% Score</span>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{s.flashcardsReviewed} cards</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
