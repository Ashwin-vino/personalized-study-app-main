-- ==============================================================================
-- SUPABASE SQL EDITOR SCRIPT: PERSONALIZED STUDY ASSISTANT
-- 100% Compatible with Prisma ORM and Supabase Studio
-- Safe & Idempotent: Can be run multiple times with 0 Errors & 0 Issues
-- ==============================================================================

-- 1. Enable pgcrypto extension for automatic UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure public schema exists
CREATE SCHEMA IF NOT EXISTS "public";

-- ------------------------------------------------------------------------------
-- Table 1: "User"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Unique index for User email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- ------------------------------------------------------------------------------
-- Table 2: "Document"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- ------------------------------------------------------------------------------
-- Table 3: "DocumentChunk"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- ------------------------------------------------------------------------------
-- Table 4: "Flashcard"
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Table 5: "QuizQuestion"
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Table 6: "StudySession"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "StudySession" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "weakTopics" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- ------------------------------------------------------------------------------
-- Foreign Key Constraints (Idempotent: Safe to run repeatedly)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Document -> User
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Document_userId_fkey') THEN
        ALTER TABLE "Document" 
        ADD CONSTRAINT "Document_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- DocumentChunk -> Document
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentChunk_documentId_fkey') THEN
        ALTER TABLE "DocumentChunk" 
        ADD CONSTRAINT "DocumentChunk_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "Document"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Flashcard -> Document
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Flashcard_documentId_fkey') THEN
        ALTER TABLE "Flashcard" 
        ADD CONSTRAINT "Flashcard_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "Document"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Flashcard -> User
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Flashcard_userId_fkey') THEN
        ALTER TABLE "Flashcard" 
        ADD CONSTRAINT "Flashcard_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- QuizQuestion -> Document
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuizQuestion_documentId_fkey') THEN
        ALTER TABLE "QuizQuestion" 
        ADD CONSTRAINT "QuizQuestion_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "Document"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- StudySession -> User
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StudySession_userId_fkey') THEN
        ALTER TABLE "StudySession" 
        ADD CONSTRAINT "StudySession_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Foreign Key Performance Indexes (Eliminates Supabase Linter Warnings)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
CREATE INDEX IF NOT EXISTS "Flashcard_documentId_idx" ON "Flashcard"("documentId");
CREATE INDEX IF NOT EXISTS "Flashcard_userId_idx" ON "Flashcard"("userId");
CREATE INDEX IF NOT EXISTS "QuizQuestion_documentId_idx" ON "QuizQuestion"("documentId");
CREATE INDEX IF NOT EXISTS "StudySession_userId_idx" ON "StudySession"("userId");

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) & Permissive Access Policies
-- (Zero Permission Errors across Supabase Client & Prisma Server queries)
-- ------------------------------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flashcard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Policy for User
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'Allow all access to User') THEN
        CREATE POLICY "Allow all access to User" ON "User" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Policy for Document
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Document' AND policyname = 'Allow all access to Document') THEN
        CREATE POLICY "Allow all access to Document" ON "Document" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Policy for DocumentChunk
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'DocumentChunk' AND policyname = 'Allow all access to DocumentChunk') THEN
        CREATE POLICY "Allow all access to DocumentChunk" ON "DocumentChunk" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Policy for Flashcard
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Flashcard' AND policyname = 'Allow all access to Flashcard') THEN
        CREATE POLICY "Allow all access to Flashcard" ON "Flashcard" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Policy for QuizQuestion
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'QuizQuestion' AND policyname = 'Allow all access to QuizQuestion') THEN
        CREATE POLICY "Allow all access to QuizQuestion" ON "QuizQuestion" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Policy for StudySession
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'StudySession' AND policyname = 'Allow all access to StudySession') THEN
        CREATE POLICY "Allow all access to StudySession" ON "StudySession" FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Seed Default Demo Student User
-- Guarantees that fallback operations on 'demo-user-id' succeed immediately!
-- ------------------------------------------------------------------------------
INSERT INTO "User" ("id", "email", "name", "createdAt", "updatedAt")
SELECT 'demo-user-id', 'demo.student@example.com', 'Demo Student', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE "id" = 'demo-user-id' OR "email" = 'demo.student@example.com'
);
