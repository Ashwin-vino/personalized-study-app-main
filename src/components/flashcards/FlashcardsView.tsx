"use client";

import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Award,
} from 'lucide-react';
import { Flashcard, DocumentItem } from '@/types';
import FlipCard from '@/components/ui/FlipCard';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  activeDoc: DocumentItem | null;
  onUpdateFlashcardSRS: (cardIndex: number, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onFinishReview: () => void;
}

export function FlashcardsView({
  flashcards,
  activeDoc,
  onUpdateFlashcardSRS,
  onFinishReview
}: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || !currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight' && currentIndex < flashcards.length - 1) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, isCompleted, flashcards.length]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    onUpdateFlashcardSRS(currentIndex, rating);
    setReviewedCards(prev => new Set(prev).add(currentIndex));
    
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-300 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-500 space-y-4 animate-in fade-in">
        <Layers className="w-12 h-12 mx-auto opacity-30 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">No Flashcards Available</h3>
        <p className="text-sm">Select a document or upload study material to generate flashcards.</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl bg-white dark:bg-zinc-900/90 p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Review Session Complete!
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            You reviewed <span className="text-emerald-600 dark:text-emerald-400 font-bold">{flashcards.length} flashcards</span>. Your Spaced Repetition (SRS) parameters have been updated.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{flashcards.length}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Cards Mastered</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Session Progress</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { setCurrentIndex(0); setIsFlipped(false); setIsCompleted(false); setReviewedCards(new Set()); }}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-sm border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Review Again
          </button>
          <button
            onClick={onFinishReview}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Session Progress Bar & Controls */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          {activeDoc && (
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
              {activeDoc.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{progressPercentage}% Completed</span>
          <button
            onClick={() => setIsFlipped(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Flip Card (Space)"
            aria-label="Flip Card"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800/80 overflow-hidden">
        <div 
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 3D FlipCard Component from React Bits */}
      <div className="w-full flex justify-center py-2">
        <FlipCard
          flipped={isFlipped}
          onFlipChange={(flipped) => setIsFlipped(flipped)}
          front={
            <div className="w-full h-full p-8 flex flex-col justify-between select-none">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                <span className="uppercase tracking-wider text-[10px] font-bold text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Question (Front)
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  Click or Drag to Flip ↵
                </span>
              </div>

              <div className="my-auto py-4 space-y-4">
                <p className="text-xl md:text-2xl font-bold leading-relaxed text-center text-zinc-100">
                  {currentCard.front}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium pt-4 border-t border-zinc-800/80">
                <span>Press Space to Flip</span>
                <span>Drag sideways to turn</span>
              </div>
            </div>
          }
          back={
            <div className="w-full h-full p-8 flex flex-col justify-between select-none">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                <span className="uppercase tracking-wider text-[10px] font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Answer (Back)
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  Click or Drag to Flip back ↵
                </span>
              </div>

              <div 
                className="my-auto py-4 space-y-2 max-h-[250px] overflow-y-auto pr-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <p className="text-sm md:text-base font-normal leading-relaxed text-zinc-200 whitespace-pre-line text-left">
                  {currentCard.back}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium pt-4 border-t border-zinc-800/80">
                <span>Press 1-4 for SRS rating</span>
                <span>Card {currentIndex + 1} of {flashcards.length}</span>
              </div>
            </div>
          }
          axis="y"
          flipOnClick
          draggable
          dragDistance={0}
          tilt
          tiltMax={12}
          glare
          glareOpacity={0.25}
          hoverScale={1.02}
          perspective={1100}
          stiffness={180}
          damping={22}
          width={640}
          height={390}
          radius={24}
          background="#18181b"
          color="#f4f4f5"
          shadow
          shadowColor="#000000"
          shadowOpacity={0.5}
          className="w-full"
        />
      </div>

      {/* Action Buttons: Show Answer or SRS Rating Actions */}
      {!isFlipped ? (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCw className="w-5 h-5" />
          <span>Show Answer (Space)</span>
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-200">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            How well did you recall this answer?
          </p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleRating('again')}
              className="py-3 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>1. Again</span>
              <span className="text-[10px] font-normal text-rose-500 dark:text-rose-400/80">&lt; 1 min</span>
            </button>
            <button
              onClick={() => handleRating('hard')}
              className="py-3 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>2. Hard</span>
              <span className="text-[10px] font-normal text-amber-500 dark:text-amber-400/80">2 days</span>
            </button>
            <button
              onClick={() => handleRating('good')}
              className="py-3 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>3. Good</span>
              <span className="text-[10px] font-normal text-emerald-500 dark:text-emerald-400/80">4 days</span>
            </button>
            <button
              onClick={() => handleRating('easy')}
              className="py-3 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>4. Easy</span>
              <span className="text-[10px] font-normal text-indigo-500 dark:text-indigo-400/80">7 days</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 disabled:opacity-30 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-800 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-zinc-800 cursor-pointer"
        >
          <span>Skip / Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

