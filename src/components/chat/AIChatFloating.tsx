"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Loader2, Bot, Sparkles } from 'lucide-react';
import { DocumentItem } from '@/types';
import PromptBar from '@/components/ui/PromptBar';
import { useTheme } from '@/components/theme-provider';

interface AIChatFloatingProps {
  activeDoc: DocumentItem | null;
}

export function AIChatFloating({ activeDoc }: AIChatFloatingProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hello! I'm your Nexora AI study assistant. Ask me anything about your documents or study topics!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string, options?: { attachments?: string[]; model?: any; effort?: string }) => {
    if (!text.trim() || isLoading) return;

    const newMsg = { role: 'user' as const, content: text };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: activeDoc?.id,
          documentTitle: activeDoc?.title,
          documentContent: activeDoc?.content,
          messages: updated
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat API error');

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an issue processing your query. Please try asking again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptPills = [
    'Summarize core concepts',
    'What are the key terms?',
    'Explain the hardest part'
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 group cursor-pointer"
        title="Nexora Tutor AI Chat"
        aria-label="Toggle AI Tutor Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
          </div>
        )}
      </button>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[440px] h-[560px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-6 fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 dark:bg-zinc-950/90 text-white flex items-center justify-between border-b border-slate-800 dark:border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                  Nexora Tutor AI
                </h3>
                <p className="text-[10px] text-zinc-400 truncate max-w-[220px]">
                  {activeDoc ? `Context: ${activeDoc.title}` : 'General Tutor Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close AI Tutor Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-zinc-950/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Pills */}
          {messages.length < 3 && (
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {promptPills.map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(pill)}
                  className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* Integrated PromptBar */}
          <div className="p-2.5 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800/80 shrink-0">
            <PromptBar
              placeholder="Ask anything or type / for commands..."
              busy={isLoading}
              onSend={(text, opts) => handleSend(text, opts)}
              onStop={() => setIsLoading(false)}
              width={420}
              background={isDark ? "#18181b" : "#f8fafc"}
              color={isDark ? "#f4f4f5" : "#0f172a"}
              menuBackground={isDark ? "#27272a" : "#ffffff"}
              sparkColor="#818cf8"
              models={[
                { key: 'gemini-flash', name: 'Gemini 1.5 Flash', tag: 'Fast' },
                { key: 'llama-3', name: 'Llama 3.1 70B', tag: 'Smart' }
              ]}
              efforts={['Low', 'Medium', 'High', 'Max']}
            />
          </div>

        </div>
      )}
    </>
  );
}
