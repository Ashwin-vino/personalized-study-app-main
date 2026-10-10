"use client";

import React, { useState, useEffect } from 'react';
import { NavTab, DocumentItem, Flashcard, QuizQuestion, StudySessionRecord, UserProfile } from '@/types';
import { 
  getStoredDocuments, 
  saveStoredDocuments, 
  getStoredFlashcards, 
  saveStoredFlashcards, 
  getStoredQuizzes, 
  saveStoredQuizzes, 
  getStoredSessions, 
  addStoredSession, 
  getStoredProfile, 
  saveStoredProfile, 
  getActiveDocumentId, 
  setActiveDocumentId,
  DEFAULT_PROFILE,
  INITIAL_DOCUMENTS,
  INITIAL_SESSIONS
} from '@/lib/storage';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { DocumentsView } from '@/components/documents/DocumentsView';
import { FlashcardsView } from '@/components/flashcards/FlashcardsView';
import { QuizView } from '@/components/quiz/QuizView';
import { StudySessionView } from '@/components/session/StudySessionView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { HelpView } from '@/components/help/HelpView';
import { AuthModal } from '@/components/auth/AuthModal';
import { AIChatFloating } from '@/components/chat/AIChatFloating';

export default function Page() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Core Data States - Initialized with deterministic defaults for clean SSR hydration
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [activeDocId, setActiveDocIdState] = useState<string | null>('doc-demo-1');
  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILE);
  const [sessions, setSessions] = useState<StudySessionRecord[]>(INITIAL_SESSIONS);

  useEffect(() => {
    // Load persisted localStorage state after client hydration
    const docs = getStoredDocuments();
    setDocuments(docs);
    
    const initialDocId = getActiveDocumentId() || (docs[0]?.id || 'doc-demo-1');
    setActiveDocIdState(initialDocId);

    const loadedSessions = getStoredSessions();
    setSessions(loadedSessions);

    const loadedProfile = getStoredProfile();
    setUser(loadedProfile);
  }, []);

  const handleSelectDoc = (id: string) => {
    setActiveDocIdState(id);
    setActiveDocumentId(id);
  };

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0] || null;

  // Retrieve flashcards & quizzes for active doc
  const currentFlashcards = activeDoc ? getStoredFlashcards(activeDoc.id) : getStoredFlashcards();
  const currentQuizzes = activeDoc ? getStoredQuizzes(activeDoc.id) : getStoredQuizzes();

  const handleAddDocument = (newDoc: DocumentItem, cards: Flashcard[], questions: QuizQuestion[]) => {
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);

    saveStoredFlashcards(newDoc.id, cards);
    saveStoredQuizzes(newDoc.id, questions);

    handleSelectDoc(newDoc.id);
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
    if (activeDocId === id) {
      const nextId = updatedDocs[0]?.id || null;
      handleSelectDoc(nextId || '');
    }
  };

  const handleUpdateFlashcardSRS = (cardIndex: number, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeDoc) return;
    const cards = [...currentFlashcards];
    if (!cards[cardIndex]) return;

    const card = { ...cards[cardIndex] };
    const currentEase = card.easeFactor || 2.5;
    const currentReps = card.repetitions || 0;

    let newEase = currentEase;
    let newInterval = 1;

    if (rating === 'again') {
      newEase = Math.max(1.3, currentEase - 0.2);
      newInterval = 1;
    } else if (rating === 'hard') {
      newEase = Math.max(1.3, currentEase - 0.15);
      newInterval = 2;
    } else if (rating === 'good') {
      newInterval = Math.round((currentReps + 1) * currentEase * 1.5);
    } else if (rating === 'easy') {
      newEase = currentEase + 0.15;
      newInterval = Math.round((currentReps + 1) * currentEase * 2.5);
    }

    card.easeFactor = Number(newEase.toFixed(2));
    card.repetitions = currentReps + 1;
    card.nextReviewDate = new Date(Date.now() + 86400000 * Math.max(1, newInterval)).toISOString();

    cards[cardIndex] = card;
    saveStoredFlashcards(activeDoc.id, cards);

    // Update user stats
    const updatedUser = { ...user, totalCardsReviewed: user.totalCardsReviewed + 1 };
    setUser(updatedUser);
    saveStoredProfile(updatedUser);
  };

  const handleFinishQuiz = (score: number, weakTopics: string[]) => {
    const record: StudySessionRecord = {
      id: `session-${Date.now()}`,
      title: activeDoc ? activeDoc.title : 'Quick Quiz Session',
      date: new Date().toISOString(),
      score: score,
      totalQuestions: currentQuizzes.length,
      flashcardsReviewed: 0,
      weakTopics: weakTopics,
      durationMinutes: 10
    };
    const updatedSessions = [record, ...sessions];
    setSessions(updatedSessions);
    addStoredSession(record);

    // Update active document with quiz scores & progress
    if (activeDoc) {
      const updatedDocs = documents.map(d => {
        if (d.id === activeDoc.id) {
          const newBest = Math.max(d.bestQuizScore || 0, score);
          const newProgress = Math.max(d.progress, score);
          return {
            ...d,
            lastQuizScore: score,
            bestQuizScore: newBest,
            progress: newProgress,
            lastStudied: new Date().toISOString(),
          };
        }
        return d;
      });
      setDocuments(updatedDocs);
      saveStoredDocuments(updatedDocs);
    }

    const updatedUser = {
      ...user,
      totalQuizzesTaken: user.totalQuizzesTaken + 1,
      masteryPercentage: Math.round((user.masteryPercentage * 3 + score) / 4)
    };
    setUser(updatedUser);
    saveStoredProfile(updatedUser);
  };

  const handleAddSessionRecord = (record: StudySessionRecord) => {
    const updatedSessions = [record, ...sessions];
    setSessions(updatedSessions);
    addStoredSession(record);

    const updatedUser = {
      ...user,
      totalQuizzesTaken: user.totalQuizzesTaken + 1,
      totalCardsReviewed: user.totalCardsReviewed + record.flashcardsReviewed,
      masteryPercentage: Math.round((user.masteryPercentage * 3 + (record.score || 80)) / 4)
    };
    setUser(updatedUser);
    saveStoredProfile(updatedUser);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...user, ...updated };
    setUser(newProfile);
    saveStoredProfile(newProfile);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          user={user}
          activeDoc={activeDoc}
          documents={documents}
          onSelectDoc={handleSelectDoc}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onQuickUpload={() => setActiveTab('documents')}
        />

        {/* Dynamic Page Tab View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              activeDoc={activeDoc}
              documents={documents}
              flashcards={currentFlashcards}
              quizzes={currentQuizzes}
              sessions={sessions}
              onNavigate={setActiveTab}
              onStartReview={() => setActiveTab('flashcards')}
              onStartQuiz={() => setActiveTab('quizzes')}
              onStartSession={() => setActiveTab('session')}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              activeDoc={activeDoc}
              onSelectDoc={handleSelectDoc}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onStartStudyDoc={(doc) => {
                handleSelectDoc(doc.id);
                setActiveTab('flashcards');
              }}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              flashcards={currentFlashcards}
              activeDoc={activeDoc}
              onUpdateFlashcardSRS={handleUpdateFlashcardSRS}
              onFinishReview={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizView
              questions={currentQuizzes}
              activeDoc={activeDoc}
              onFinishQuiz={handleFinishQuiz}
            />
          )}

          {activeTab === 'session' && (
            <StudySessionView
              documents={documents}
              activeDoc={activeDoc}
              flashcards={currentFlashcards}
              quizzes={currentQuizzes}
              onAddSessionRecord={handleAddSessionRecord}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              user={user}
              sessions={sessions}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'help' && (
            <HelpView />
          )}
        </main>
      </div>

      {/* Floating Tutor AI Assistant */}
      <AIChatFloating activeDoc={activeDoc} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLoginSuccess={(updatedUser) => {
          handleUpdateProfile(updatedUser);
          setActiveTab('dashboard');
        }}
      />

    </div>
  );
}
