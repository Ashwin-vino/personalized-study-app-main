"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  HelpCircle, 
  Award, 
  Play, 
  BarChart3, 
  Settings, 
  BookOpen, 
  Sparkles,
  LogOut,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { NavTab, UserProfile } from '@/types';
import { useTheme } from '@/components/theme-provider';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserProfile;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAuth: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAuth
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const mainNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: 'Due' },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'session', label: 'Study Session', icon: Play },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const systemNavItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Guide', icon: HelpCircle },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border-r border-slate-200 dark:border-zinc-800/60">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleSelect('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-1.5 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:border-indigo-500/40 transition-all">
              <img 
                src="/logo.png" 
                alt="Nexora Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                NEXORA
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-zinc-500">AI Study Assistant</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpenMobile(false)}
            aria-label="Close Mobile Sidebar"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Group */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Study Core
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-zinc-800/90 dark:text-white dark:border-zinc-700/60 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Navigation Group */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Preferences
          </div>
          {systemNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-zinc-800/90 dark:text-white dark:border-zinc-700/60 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Profile Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        {/* Quick Theme Switcher */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/60">
          <span className="text-xs text-slate-700 dark:text-zinc-400 font-medium flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {theme === 'dark' ? 'Space Dark' : 'Clean Light'}
          </span>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-transparent transition-colors text-xs font-semibold px-2 py-1 cursor-pointer"
          >
            Switch
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/40 transition-colors group">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            title="Account / Sign Out"
            aria-label="Account / Sign Out"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30 select-none">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />
          <aside className="relative w-72 h-full z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

