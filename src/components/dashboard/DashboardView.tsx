"use client";

import React from 'react';
import { 
  PlayCircle, 
  Layers, 
  Flame, 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { DocumentItem, Flashcard, QuizQuestion, StudySessionRecord, UserProfile, NavTab } from '@/types';
import BorderGlow from '@/components/ui/BorderGlow';

interface DashboardViewProps {
  user: UserProfile;
  activeDoc: DocumentItem | null;
  documents: DocumentItem[];
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  sessions: StudySessionRecord[];
  onNavigate: (tab: NavTab) => void;
  onStartReview: () => void;
  onStartQuiz: () => void;
  onStartSession: () => void;
}

export function DashboardView({
  user,
  activeDoc,
  documents,
  flashcards,
  quizzes,
  sessions,
  onNavigate,
  onStartReview,
  onStartQuiz,
  onStartSession,
}: DashboardViewProps) {
  const [greeting, setGreeting] = React.useState('Welcome back');

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const dueCardsCount = flashcards.length;
  const lastStudiedDoc = activeDoc || documents[0] || null;

  const weakTopicsList = Array.from(
    new Set(sessions.flatMap(s => s.weakTopics))
  ).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & AI Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/80 p-6 md:p-8 border border-slate-200 dark:border-zinc-800/80 shadow-lg text-white">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <img 
          src="/logo.png" 
          alt="" 
          aria-hidden="true" 
          className="absolute right-4 -bottom-6 w-48 h-48 opacity-[0.06] pointer-events-none object-contain select-none filter blur-[0.5px]" 
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <img src="/logo.png" alt="Nexora" className="w-3.5 h-3.5 object-contain" />
              <span>Nexora Intelligent Assist</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white" suppressHydrationWarning>
              {greeting}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-300 dark:text-zinc-400 leading-relaxed" suppressHydrationWarning>
              Ready to continue learning? You have <span className="text-amber-400 font-bold" suppressHydrationWarning>{dueCardsCount} flashcards</span> due for review today to maintain your memory retention curve.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={onStartReview}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Review</span>
            </button>
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Continue Learning + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continue Learning Prominent Card with BorderGlow */}
        <div className="lg:col-span-2">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="250 85% 70%"
            borderRadius={20}
            glowRadius={30}
            glowIntensity={0.9}
            coneSpread={25}
            colors={['#818cf8', '#c084fc', '#34d399']}
            className="w-full h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"
          >
            <div className="p-6 flex flex-col justify-between h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                    Continue Learning
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Active Module
                </span>
              </div>

              {lastStudiedDoc ? (
                <div className="space-y-5 bg-slate-50 dark:bg-zinc-950/60 p-5 rounded-xl border border-slate-200 dark:border-zinc-800/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                        {lastStudiedDoc.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          {lastStudiedDoc.flashcardsCount} Flashcards
                        </span>
                        <span className="flex items-center gap-1">
                          <BrainCircuit className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                          {lastStudiedDoc.questionsCount} Quiz Questions
                        </span>
                        {lastStudiedDoc.lastQuizScore !== undefined && (
                          <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Quiz Score: {lastStudiedDoc.lastQuizScore}%
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                          Recently Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-zinc-400">Material Mastery</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{lastStudiedDoc.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${lastStudiedDoc.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-500">
                  <p>No document selected. Upload a document to start studying!</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onStartSession}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group cursor-pointer"
                >
                  <span>Launch Guided Study Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  View All Materials ({documents.length})
                </button>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* Quick Statistics Stack */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Due Flashcards</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{dueCardsCount}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Ready for spaced review</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Study Streak</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{user.streakDays} Days</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Top 5% learning consistency</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Mastery Score</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{user.masteryPercentage}%</p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Based on recent quizzes</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Second Row: Today's Review + Weak Topics + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Today's Review Card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Today&apos;s Review</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">SRS Scheduled</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Optimal spaced repetition memory window</p>
          </div>

          <div className="py-4 text-center bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800/60 space-y-1">
            <span className="text-4xl font-black text-amber-500 dark:text-amber-400">{dueCardsCount}</span>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Flashcards ready ~ 10 mins</p>
          </div>

          <button
            onClick={onStartReview}
            className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold text-sm border border-amber-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Review Session</span>
          </button>
        </div>

        {/* Identified Weak Topics Card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Weak Topics</h3>
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Identified from session performance</p>
          </div>

          <div className="space-y-3">
            {weakTopicsList.length > 0 ? (
              weakTopicsList.map((topic, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[170px]">{topic}</span>
                    <span className="text-rose-600 dark:text-rose-400">{45 + i * 10}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                      style={{ width: `${45 + i * 10}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 dark:text-zinc-500 py-4 text-center">
                No weak topics flagged yet. Take a quiz to generate data!
              </div>
            )}
          </div>

          <button
            onClick={onStartQuiz}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Practice Weak Topics
          </button>
        </div>

        {/* Recent Session Activity */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Your completed study sessions</p>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 2).map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{s.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">{new Date(s.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{s.score}% Score</span>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{s.flashcardsReviewed} cards</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            View Complete Analytics
          </button>
        </div>

      </div>
    </div>
  );
}

