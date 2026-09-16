-- Combined migration: Discord webhooks + Polls + ErrorLog
-- Run with: npx prisma migrate deploy
-- Safe to run on an existing database — all statements are idempotent
-- (ADD COLUMN / CREATE TABLE / CREATE TYPE / CREATE INDEX).

-- ============================================================================
-- 1. Discord webhook delivery fields on Event and Announcement
-- ============================================================================

-- Event: Discord webhook delivery status
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPosted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPostedAt" TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPostStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordRoleIds" TEXT[] DEFAULT '{}';

-- Announcement: Discord webhook delivery status (discordPosted already exists)
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordPostedAt" TIMESTAMP;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordPostStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordRoleIds" TEXT[] DEFAULT '{}';

-- ============================================================================
-- 2. Poll / PollOption / PollVote models for community voting
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PollType') THEN
    CREATE TYPE "PollType" AS ENUM ('SINGLE', 'MULTIPLE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PollResultsVisibility') THEN
    CREATE TYPE "PollResultsVisibility" AS ENUM ('LIVE', 'AFTER_CLOSE', 'HIDDEN');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Poll" (
    "id"                   TEXT NOT NULL,
    "title"                TEXT NOT NULL,
    "slug"                 TEXT NOT NULL UNIQUE,
    "description"          TEXT NOT NULL DEFAULT '',
    "type"                 "PollType" NOT NULL DEFAULT 'SINGLE',
    "allowAnonymous"       BOOLEAN NOT NULL DEFAULT false,
    "startAt"              TIMESTAMP,
    "endAt"                TIMESTAMP,
    "voteLimit"            INTEGER NOT NULL DEFAULT 0,
    "resultsVisibility"    "PollResultsVisibility" NOT NULL DEFAULT 'AFTER_CLOSE',
    "closed"               BOOLEAN NOT NULL DEFAULT false,
    "published"            BOOLEAN NOT NULL DEFAULT true,
    "publishedAt"          TIMESTAMP,
    "discordPosted"        BOOLEAN NOT NULL DEFAULT false,
    "discordPostedAt"      TIMESTAMP,
    "discordPostStatus"    TEXT NOT NULL DEFAULT 'pending',
    "discordRoleIds"       TEXT[] DEFAULT '{}',
    "createdAt"            TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"            TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Poll_published_createdAt_idx" ON "Poll" ("published", "createdAt");
CREATE INDEX IF NOT EXISTS "Poll_slug_idx" ON "Poll" ("slug");

CREATE TABLE IF NOT EXISTS "PollOption" (
    "id"        TEXT NOT NULL,
    "pollId"    TEXT NOT NULL,
    "label"     TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id"),
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PollOption_pollId_idx" ON "PollOption" ("pollId");

CREATE TABLE IF NOT EXISTS "PollVote" (
    "id"        TEXT NOT NULL,
    "pollId"    TEXT NOT NULL,
    "optionId"  TEXT NOT NULL,
    "userId"    TEXT,
    "anonId"    TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote" ("pollId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_anonId_key" ON "PollVote" ("pollId", "anonId");
CREATE INDEX IF NOT EXISTS "PollVote_pollId_createdAt_idx" ON "PollVote" ("pollId", "createdAt");

-- ============================================================================
-- 3. ErrorLog model for staff debugging of client-side errors
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ErrorLog" (
    "id"         TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "digest"     TEXT,
    "path"       TEXT,
    "userAgent"  TEXT,
    "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ErrorLog_createdAt_idx" ON "ErrorLog" ("createdAt");
CREATE INDEX IF NOT EXISTS "ErrorLog_digest_idx" ON "ErrorLog" ("digest");