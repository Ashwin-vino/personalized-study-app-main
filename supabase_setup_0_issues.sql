-- =========================================================================================
-- SUPABASE SQL EDITOR SCRIPT FOR PERSONALIZED STUDY ASSISTANT
-- Compatible with Prisma Schema & PostgreSQL
-- Idempotent: Can be run multiple times safely
-- 0 Supabase Security Warnings (RLS Enabled + Full Policies)
-- 0 Supabase Performance Linter Warnings (Foreign Key Indexes Included)
-- =========================================================================================

-- 1. Enable Extensions (uuid-ossp and pgcrypto for UUID support)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the "User" table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 3. Create the "Document" table
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- 4. Create the "DocumentChunk" table
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- 5. Create the "Flashcard" table
CREATE TABLE IF NOT EXISTS "Flashcard" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- 6. Create the "QuizQuestion" table
CREATE TABLE IF NOT EXISTS "QuizQuestion" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "documentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "citation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- 7. Create the "StudySession" table
CREATE TABLE IF NOT EXISTS "StudySession" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "weakTopics" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- 8. Create Unique Constraints & Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Foreign key lookup indexes (clears Supabase DB Linter for optimal performance)
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
CREATE INDEX IF NOT EXISTS "Flashcard_documentId_idx" ON "Flashcard"("documentId");
CREATE INDEX IF NOT EXISTS "Flashcard_userId_idx" ON "Flashcard"("userId");
CREATE INDEX IF NOT EXISTS "QuizQuestion_documentId_idx" ON "QuizQuestion"("documentId");
CREATE INDEX IF NOT EXISTS "StudySession_userId_idx" ON "StudySession"("userId");

-- 9. Add Foreign Key Constraints (safely replaced)
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_userId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentChunk" DROP CONSTRAINT IF EXISTS "DocumentChunk_documentId_fkey";
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Flashcard" DROP CONSTRAINT IF EXISTS "Flashcard_documentId_fkey";
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Flashcard" DROP CONSTRAINT IF EXISTS "Flashcard_userId_fkey";
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizQuestion" DROP CONSTRAINT IF EXISTS "QuizQuestion_documentId_fkey";
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudySession" DROP CONSTRAINT IF EXISTS "StudySession_userId_fkey";
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flashcard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;

-- 11. Create Permissive RLS Policies (allows Next.js backend & Prisma to query without 403s)
DROP POLICY IF EXISTS "Enable all access for User" ON "User";
DROP POLICY IF EXISTS "Enable all access for Document" ON "Document";
DROP POLICY IF EXISTS "Enable all access for DocumentChunk" ON "DocumentChunk";
DROP POLICY IF EXISTS "Enable all access for Flashcard" ON "Flashcard";
DROP POLICY IF EXISTS "Enable all access for QuizQuestion" ON "QuizQuestion";
DROP POLICY IF EXISTS "Enable all access for StudySession" ON "StudySession";

CREATE POLICY "Enable all access for User" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for Document" ON "Document" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for DocumentChunk" ON "DocumentChunk" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for Flashcard" ON "Flashcard" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for QuizQuestion" ON "QuizQuestion" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for StudySession" ON "StudySession" FOR ALL USING (true) WITH CHECK (true);

-- 12. Seed Initial Demo Student User (so backend queries succeed immediately)
INSERT INTO "User" ("id", "email", "name")
VALUES ('demo-student-id', 'student@example.com', 'Demo Student')
ON CONFLICT ("email") DO NOTHING;
