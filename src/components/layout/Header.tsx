"use client";

import React from 'react';
import { Menu, Search, Moon, Sun, Bell, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { NavTab, UserProfile, DocumentItem } from '@/types';
import { useTheme } from '@/components/theme-provider';

interface HeaderProps {
  activeTab: NavTab;
  user: UserProfile;
  activeDoc: DocumentItem | null;
  documents: DocumentItem[];
  onSelectDoc: (id: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenAuth: () => void;
  onQuickUpload: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'What should I study right now?' },
  documents: { title: 'Document Library', subtitle: 'Manage your study materials and AI extractions' },
  flashcards: { title: 'Flashcard Study', subtitle: 'Distraction-free spaced repetition reviews' },
  quizzes: { title: 'Knowledge Quizzes', subtitle: 'Test recall with AI-generated multiple choice questions' },
  session: { title: 'Study Session', subtitle: 'Guided learning path & session assessment' },
  analytics: { title: 'Learning Analytics', subtitle: 'Track retention, mastery curves, and weak topics' },
  settings: { title: 'Settings', subtitle: 'Manage profile, preferences, and theme' },
  help: { title: 'Help & Guide', subtitle: 'Learn how to maximize your Nexora AI study experience' },
};

export function Header({
  activeTab,
  user,
  activeDoc,
  documents,
  onSelectDoc,
  onOpenMobileSidebar,
  onOpenAuth,
  onQuickUpload
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const info = TAB_TITLES[activeTab] || { title: 'Nexora', subtitle: 'AI Study Assistant' };

  return (
    <header className="sticky top-0 z-20 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800/60 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="md:hidden w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            {info.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
            {info.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Document Quick Switcher */}
        {documents.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Active Material:</span>
            <select
              value={activeDoc?.id || ''}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-transparent text-xs font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-white text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
                  {doc.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <Flame className="w-4 h-4 fill-amber-400 stroke-amber-500" />
          <span>{user.streakDays}d Streak</span>
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenAuth}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] cursor-pointer hover:scale-105 transition-transform"
          title={`${user.name} - Settings`}
        >
          <div className="w-full h-full rounded-full bg-slate-900 dark:bg-zinc-950 flex items-center justify-center text-white text-xs font-extrabold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
        </button>
      </div>
    </header>
  );
}

