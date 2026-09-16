-- Add Discord webhook delivery fields to Event and Announcement,
-- and add the Poll / PollOption / PollVote models for community voting.

-- Event: Discord webhook delivery status
ALTER TABLE "Event" ADD COLUMN "discordPosted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "discordPostedAt" TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN "discordPostStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Event" ADD COLUMN "discordRoleIds" TEXT[] DEFAULT '{}';

-- Announcement: Discord webhook delivery status (discordPosted already exists)
ALTER TABLE "Announcement" ADD COLUMN "discordPostedAt" TIMESTAMP;
ALTER TABLE "Announcement" ADD COLUMN "discordPostStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Announcement" ADD COLUMN "discordRoleIds" TEXT[] DEFAULT '{}';

-- Poll models
CREATE TYPE "PollType" AS VALUES ('SINGLE', 'MULTIPLE');
CREATE TYPE "PollResultsVisibility" AS VALUES ('LIVE', 'AFTER_CLOSE', 'HIDDEN');

CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "PollType" NOT NULL DEFAULT 'SINGLE',
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "startAt" TIMESTAMP,
    "endAt" TIMESTAMP,
    "voteLimit" INTEGER NOT NULL DEFAULT 0,
    "resultsVisibility" "PollResultsVisibility" NOT NULL DEFAULT 'AFTER_CLOSE',
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP,
    "discordPosted" BOOLEAN NOT NULL DEFAULT false,
    "discordPostedAt" TIMESTAMP,
    "discordPostStatus" TEXT NOT NULL DEFAULT 'pending',
    "discordRoleIds" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
CREATE INDEX "Poll_published_createdAt_idx" ON "Poll" ("published", "createdAt");
CREATE INDEX "Poll_slug_idx" ON "Poll" ("slug");

CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id"),
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PollOption_pollId_idx" ON "PollOption" ("pollId");

CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PollVote_pollId_userId_key" ON "PollVote" ("pollId", "userId");
CREATE UNIQUE INDEX "PollVote_pollId_anonId_key" ON "PollVote" ("pollId", "anonId");
CREATE INDEX "PollVote_pollId_createdAt_idx" ON "PollVote" ("pollId", "createdAt");