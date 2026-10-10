"use client";

import React from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  BookOpen, 
  Keyboard,
  CheckCircle2
} from 'lucide-react';

export function HelpView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Nexora Platform Guide</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            How Nexora Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Nexora uses artificial intelligence to convert educational documents into active recall study materials and adaptive practice quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-extrabold">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Upload Material</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Upload PDF, Text, or Markdown files, or generate by topic name directly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center font-extrabold">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Spaced Repetition</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Review AI flashcards rated on difficulty (Again, Hard, Good, Easy) to schedule dynamic review intervals.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-extrabold">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Practice Quizzes</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Evaluate mastery with multiple choice questions, explanations, and source citations.
            </p>
          </div>
        </div>

        {/* Keyboard Shortcuts Table */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Flashcard Keyboard Shortcuts</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-center">
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-[11px]">Space</kbd>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 text-[11px]">Flip Card</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-center">
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-[11px]">1 - 4</kbd>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 text-[11px]">SRS Rating</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-center">
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-[11px]">← / →</kbd>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 text-[11px]">Prev / Next Card</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-center">
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-[11px]">Esc</kbd>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 text-[11px]">Close Modal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
