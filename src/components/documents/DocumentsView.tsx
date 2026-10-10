"use client";

import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  BrainCircuit, 
  Trash2, 
  Play, 
  Plus,
  BookOpen
} from 'lucide-react';
import { DocumentItem, Flashcard, QuizQuestion } from '@/types';
import { generateAcademicStudySet } from '@/lib/study-generator';

interface DocumentsViewProps {
  documents: DocumentItem[];
  activeDoc: DocumentItem | null;
  onSelectDoc: (id: string) => void;
  onAddDocument: (doc: DocumentItem, flashcards: Flashcard[], questions: QuizQuestion[]) => void;
  onDeleteDocument: (id: string) => void;
  onStartStudyDoc: (doc: DocumentItem) => void;
}

export function DocumentsView({
  documents,
  activeDoc,
  onSelectDoc,
  onAddDocument,
  onDeleteDocument,
  onStartStudyDoc
}: DocumentsViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorText('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorText('');
    }
  };

  const handleUploadAndGenerate = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorText('');
    setStatusText('Uploading & parsing document...');

    try {
      // 1. Call /api/upload
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let uploadData;
      const uploadText = await uploadRes.text();
      try {
        uploadData = JSON.parse(uploadText);
      } catch {
        throw new Error(`Upload API returned invalid response: ${uploadText.slice(0, 100)}`);
      }

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const docId = uploadData.documentId || `doc-${Date.now()}`;
      setStatusText('Analyzing content & generating study set with AI...');

      let generateData: { flashcards: Flashcard[]; questions: QuizQuestion[]; flashcardsCount?: number; questionsCount?: number } | null = null;

      try {
        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: docId,
            content: uploadData.content,
            title: file.name,
            numFlashcards,
            numQuestions,
          }),
          signal: AbortSignal.timeout(8000),
        });

        const generateText = await generateRes.text();
        const parsed = JSON.parse(generateText);
        if (generateRes.ok && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
          generateData = parsed;
        }
      } catch (genErr) {
        console.warn('Server generation timed out or failed, using client-side generator:', genErr);
      }

      // If server timed out or failed, instantly generate on client
      if (!generateData || !generateData.flashcards || generateData.flashcards.length === 0) {
        const localSet = generateAcademicStudySet(uploadData.content || '', file.name, numFlashcards, numQuestions);
        generateData = {
          flashcards: localSet.flashcards as unknown as Flashcard[],
          questions: localSet.questions as unknown as QuizQuestion[],
          flashcardsCount: localSet.flashcards.length,
          questionsCount: localSet.questions.length,
        };
      }

      const newDoc: DocumentItem = {
        id: docId,
        title: file.name,
        fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.md') ? 'md' : 'txt',
        createdAt: new Date().toISOString(),
        flashcardsCount: generateData.flashcardsCount || (generateData.flashcards?.length || 0),
        questionsCount: generateData.questionsCount || (generateData.questions?.length || 0),
        progress: 0,
        lastStudied: new Date().toISOString(),
      };

      onAddDocument(newDoc, generateData.flashcards || [], generateData.questions || []);
      setFile(null);
      setStatusText('Successfully created study set!');
      setTimeout(() => setStatusText(''), 3000);
    } catch (err: unknown) {
      console.error(err);
      setErrorText(err instanceof Error ? err.message : 'An error occurred during processing');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateTopic = async () => {
    if (!topic.trim()) return;
    setIsUploading(true);
    setErrorText('');
    setStatusText(`Generating study set for "${topic}"...`);

    try {
      let generateData: { flashcards: Flashcard[]; questions: QuizQuestion[]; flashcardsCount?: number; questionsCount?: number; documentId?: string } | null = null;

      try {
        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, numFlashcards, numQuestions }),
          signal: AbortSignal.timeout(8000),
        });

        const generateText = await generateRes.text();
        const parsed = JSON.parse(generateText);
        if (generateRes.ok && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
          generateData = parsed;
        }
      } catch (genErr) {
        console.warn('Server generation timed out or failed, using client-side generator:', genErr);
      }

      if (!generateData || !generateData.flashcards || generateData.flashcards.length === 0) {
        const localSet = generateAcademicStudySet('', topic, numFlashcards, numQuestions);
        generateData = {
          documentId: `topic-${Date.now()}`,
          flashcards: localSet.flashcards as unknown as Flashcard[],
          questions: localSet.questions as unknown as QuizQuestion[],
          flashcardsCount: localSet.flashcards.length,
          questionsCount: localSet.questions.length,
        };
      }

      const docId = generateData.documentId || `topic-${Date.now()}`;
      const newDoc: DocumentItem = {
        id: docId,
        title: topic,
        fileType: 'topic',
        createdAt: new Date().toISOString(),
        flashcardsCount: generateData.flashcardsCount || (generateData.flashcards?.length || 0),
        questionsCount: generateData.questionsCount || (generateData.questions?.length || 0),
        progress: 0,
        lastStudied: new Date().toISOString(),
      };

      onAddDocument(newDoc, generateData.flashcards || [], generateData.questions || []);
      setTopic('');
      setStatusText('Successfully generated topic study set!');
      setTimeout(() => setStatusText(''), 3000);
    } catch (err: unknown) {
      console.error(err);
      setErrorText(err instanceof Error ? err.message : 'An error occurred during topic generation');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Upper Grid: File Dropzone & Topic Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* File Upload Box */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                Upload Educational Material
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">PDF, TXT, MD</span>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-950/50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-400 mb-3">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">{(file.size / 1024).toFixed(1)} KB • Ready to extract</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  Drag & drop your study file here
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">Or click to select PDF, Text or Markdown document</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUploadAndGenerate}
            disabled={!file || isUploading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUploading && file ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Process & Generate Study Set</span>
          </button>
        </div>

        {/* Topic AI Generator Box */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/90 p-6 border border-slate-200 dark:border-zinc-800/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                Generate by Topic
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No document? Enter any subject name to automatically generate flashcards and practice quizzes.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Mechanics, Photosynthesis, Data Structures"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Flashcards Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numFlashcards}
                  onChange={(e) => setNumFlashcards(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Quiz Questions Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateTopic}
            disabled={!topic.trim() || isUploading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUploading && !file ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            <span>Generate Topic Materials</span>
          </button>
        </div>

      </div>

      {/* Processing Banner / Error Banner */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-sm">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>{statusText || 'Processing document with Nexora AI...'}</span>
        </div>
      )}

      {errorText && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Document Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
            Document Library ({documents.length})
          </h3>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {doc.lastQuizScore !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.lastQuizScore >= 80
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : doc.lastQuizScore >= 60
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          }`}>
                            Score: {doc.lastQuizScore}%
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                          {doc.fileType}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                        Added {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {doc.flashcardsCount} Cards
                      </span>
                      <span className="flex items-center gap-1">
                        <BrainCircuit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        {doc.questionsCount} Quizzes
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onStartStudyDoc(doc); }}
                        className="flex-1 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Study Now</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Document"
                        aria-label="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-500 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-semibold text-slate-600 dark:text-zinc-400">No documents in library yet</p>
            <p className="text-xs">Upload a file or generate a topic above to create your first study set.</p>
          </div>
        )}
      </div>
    </div>
  );
}

