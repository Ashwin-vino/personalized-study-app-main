"use client";

import React, { useState } from 'react';
import { Sparkles, X, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  onLoginSuccess
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        ...user,
        name: name || 'Demo Student',
        email: email || 'student@nexora.ai',
      });
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-8 space-y-6 relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-2.5 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <img 
              src="/logo.png" 
              alt="Nexora Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-wider">
            NEXORA
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            {isRegister ? 'Create your AI learning account' : 'Welcome back! Sign in to continue learning'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.vance@nexora.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 pt-3"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-zinc-800/60">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Create one'}
          </button>
        </div>

      </div>
    </div>
  );
}
