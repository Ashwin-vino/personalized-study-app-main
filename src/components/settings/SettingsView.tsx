"use client";

import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Sliders, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '@/types';
import { useTheme } from '@/components/theme-provider';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export function SettingsView({ user, onUpdateProfile }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalMinutes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      dailyGoalMinutes: Number(dailyGoal) || 25,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
              Profile & Account
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Goal Preferences */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
              Study Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Daily Study Target (Minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 25)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-zinc-500">Changes apply immediately to your active session.</span>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
}
