-- Baseline schema for a fresh Supabase/PostgreSQL database.
-- Idempotent: safe to re-run. For production, run phases sequentially with no concurrent writes.
-- Phase 0: Types (no locks on existing tables)
-- Phase 1: CREATE TABLE (no locks on existing tables)
-- Phase 2: ALTER TABLE ADD COLUMN (consistent table order: Announcement, Event, ShopDesign, others)
-- Phase 3: CREATE INDEX CONCURRENTLY (for production, run outside transaction)
-- Phase 4: FOREIGN KEYS (VALIDATE later if needed)
-- Phase 5: TRIGGERS (consistent table order)

-- ============================================================
-- PHASE 0: ENUM TYPES (no locks on existing tables)
-- ============================================================
DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('UPCOMING', 'LIVE', 'ENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('Meetup', 'Workshop', 'Party', 'Game', 'Performance', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gallery_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE rule_category AS ENUM ('General', 'Behavior', 'Content', 'Voice', 'Safety');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE guide_category AS ENUM ('GETTING_STARTED', 'VRCHAT', 'EVENTS', 'COMMUNITY', 'REPORTS', 'ACCOUNTS', 'SAFETY', 'WEBSITE', 'ACCESSIBILITY', 'GENERAL', 'SUPPORT', 'STAFF', 'DISCORD_SERVER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE announcement_state AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE community_submission_type AS ENUM ('ARTWORK', 'AVATAR', 'SCREENSHOT', 'PHOTOGRAPHY', 'VRCHAT_WORLD', 'CREATOR_PROJECT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE community_submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUEST_CHANGES');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE update_type AS ENUM ('MAJOR', 'MINOR', 'PATCH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Poll enums (added in 20260915130000_combined)
DO $$ BEGIN
    CREATE TYPE poll_type AS ENUM ('SINGLE', 'MULTIPLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE poll_results_visibility AS ENUM ('LIVE', 'AFTER_CLOSE', 'HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PHASE 1: CREATE TABLE (idempotent, no locks on existing)
-- ============================================================
CREATE TABLE IF NOT EXISTS "EventCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'brand',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventCategory_slug_key" ON "EventCategory"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "EventCategory_name_key" ON "EventCategory"("name");

CREATE TABLE IF NOT EXISTS "EventTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'ink',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventTag_slug_key" ON "EventTag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "EventTag_name_key" ON "EventTag"("name");

CREATE TABLE IF NOT EXISTS "AnnouncementCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'brand',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementCategory_slug_key" ON "AnnouncementCategory"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementCategory_name_key" ON "AnnouncementCategory"("name");

CREATE TABLE IF NOT EXISTS "AnnouncementTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'ink',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementTag_slug_key" ON "AnnouncementTag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementTag_name_key" ON "AnnouncementTag"("name");

CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vrchatUsername" TEXT NOT NULL,
    "rank" TEXT NOT NULL DEFAULT 'Member',
    "bio" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "socials" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "state" announcement_state NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "authorId" TEXT,
    "categoryId" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "discordMessageId" TEXT,
    "discordPosted" BOOLEAN NOT NULL DEFAULT false,
    "discordPostedAt" TIMESTAMP(3),
    "discordPostStatus" TEXT NOT NULL DEFAULT 'pending',
    "discordRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "links" TEXT NOT NULL DEFAULT '[]',
    "tag" TEXT NOT NULL DEFAULT 'Partner',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "hostId" TEXT,
    "hostName" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "vrchatWorldUrl" TEXT NOT NULL DEFAULT '',
    "category" event_category NOT NULL DEFAULT 'Other',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "rules" TEXT NOT NULL DEFAULT '',
    "status" event_status NOT NULL DEFAULT 'UPCOMING',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "discordPosted" BOOLEAN NOT NULL DEFAULT false,
    "discordPostedAt" TIMESTAMP(3),
    "discordPostStatus" TEXT NOT NULL DEFAULT 'pending',
    "discordRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Rule" (
    "id" TEXT NOT NULL,
    "category" rule_category NOT NULL DEFAULT 'General',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Guide" (
    "id" TEXT NOT NULL,
    "category" guide_category NOT NULL DEFAULT 'GENERAL',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Link" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'link',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Other',
    "featured" BOOLEAN NOT NULL DEFAULT FALSE,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Link_category_idx" ON "Link"("category");
CREATE INDEX IF NOT EXISTS "Link_featured_idx" ON "Link"("featured");
CREATE INDEX IF NOT EXISTS "Link_active_idx" ON "Link"("active");

CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "status" gallery_status NOT NULL DEFAULT 'PENDING',
    "submitterName" TEXT NOT NULL DEFAULT '',
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMP(3),
    "slug" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT FALSE,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupPhoto" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "bannerUrl" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Update" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" update_type NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "whatsNew" TEXT NOT NULL DEFAULT '',
    "improvements" TEXT NOT NULL DEFAULT '',
    "bugFixes" TEXT NOT NULL DEFAULT '',
    "securityNotes" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "authorId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT FALSE,
    "publishedAt" TIMESTAMP(3),
    "discordPostedAt" TIMESTAMP(3),
    "discordPostStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommunitySubmission" (
    "id" TEXT NOT NULL,
    "type" community_submission_type NOT NULL,
    "status" community_submission_status NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL DEFAULT '',
    "submitterEmail" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "changeRequestNote" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunitySubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommunitySubmissionReport" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "reporterName" TEXT NOT NULL DEFAULT '',
    "reporterEmail" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT FALSE,
    "reportToken" TEXT NOT NULL,
    "status" report_status NOT NULL DEFAULT 'RECEIVED',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunitySubmissionReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommunitySubmissionModerationLog" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunitySubmissionModerationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Report" (
    "id"              TEXT NOT NULL,
    "reportToken"     TEXT NOT NULL,
    "contentType"     TEXT NOT NULL,
    "contentId"       TEXT NOT NULL,
    "reporterId"      TEXT,
    "reporterName"    TEXT NOT NULL DEFAULT '',
    "reporterEmail"   TEXT,
    "anonymous"       BOOLEAN NOT NULL DEFAULT FALSE,
    "reportedUserId"  TEXT,
    "reportedUsername" TEXT,
    "reason"          TEXT NOT NULL,
    "description"     TEXT NOT NULL,
    "evidence"        TEXT NOT NULL DEFAULT '[]',
    "status"          TEXT NOT NULL DEFAULT 'OPEN',
    "priority"        TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId"    TEXT,
    "resolvedById"    TEXT,
    "resolution"      TEXT NOT NULL DEFAULT '',
    "resolvedAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Report_reportToken_key" ON "Report"("reportToken");

CREATE TABLE IF NOT EXISTS "ReportAuditLog" (
    "id"        TEXT NOT NULL,
    "reportId"  TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "actorId"   TEXT,
    "actorName" TEXT NOT NULL DEFAULT '',
    "detail"    TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ShopDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "creator" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL DEFAULT '',
    "galleryUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShopDesign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HealthCheck" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "error" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- Poll models (added in 20260915130000_combined)
CREATE TABLE IF NOT EXISTS "Poll" (
    "id"                   TEXT NOT NULL,
    "title"                TEXT NOT NULL,
    "slug"                 TEXT NOT NULL UNIQUE,
    "description"          TEXT NOT NULL DEFAULT '',
    "type"                 poll_type NOT NULL DEFAULT 'SINGLE',
    "allowAnonymous"       BOOLEAN NOT NULL DEFAULT false,
    "startAt"              TIMESTAMP(3),
    "endAt"                TIMESTAMP(3),
    "voteLimit"            INTEGER NOT NULL DEFAULT 0,
    "resultsVisibility"    poll_results_visibility NOT NULL DEFAULT 'AFTER_CLOSE',
    "closed"               BOOLEAN NOT NULL DEFAULT false,
    "published"            BOOLEAN NOT NULL DEFAULT true,
    "publishedAt"          TIMESTAMP(3),
    "discordPosted"        BOOLEAN NOT NULL DEFAULT false,
    "discordPostedAt"      TIMESTAMP(3),
    "discordPostStatus"    TEXT NOT NULL DEFAULT 'pending',
    "discordRoleIds"       TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Poll_slug_key" ON "Poll"("slug");
CREATE INDEX IF NOT EXISTS "Poll_published_createdAt_idx" ON "Poll"("published", "createdAt");

CREATE TABLE IF NOT EXISTS "PollOption" (
    "id"        TEXT NOT NULL,
    "pollId"    TEXT NOT NULL,
    "label"     TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PollOption_pollId_idx" ON "PollOption"("pollId");

CREATE TABLE IF NOT EXISTS "PollVote" (
    "id"        TEXT NOT NULL,
    "pollId"    TEXT NOT NULL,
    "optionId"  TEXT NOT NULL,
    "userId"    TEXT,
    "anonId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_anonId_key" ON "PollVote"("pollId", "anonId");
CREATE INDEX IF NOT EXISTS "PollVote_pollId_createdAt_idx" ON "PollVote"("pollId", "createdAt");

-- ErrorLog model (added in 20260915130000_combined)
CREATE TABLE IF NOT EXISTS "ErrorLog" (
    "id"         TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "digest"     TEXT,
    "path"       TEXT,
    "userAgent"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ErrorLog_digest_idx" ON "ErrorLog"("digest");

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "vrchatUsername" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EventReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventReminder_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EventReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventReminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventReminder_user_event_remindAt_unique" UNIQUE ("userId", "eventId", "remindAt")
);

-- ============================================================
-- PHASE 2: ALTER TABLE ADD COLUMN (consistent order: Announcement, Event, ShopDesign, then others)
-- Run each table's ALTERs together, tables in alphabetical order to prevent deadlocks
-- ============================================================

-- Announcement
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordMessageId" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "excerpt" TEXT DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "content" TEXT DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "coverImage" TEXT DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT true;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "state" TEXT DEFAULT 'DRAFT';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN DEFAULT false;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordPosted" BOOLEAN DEFAULT false;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordPostedAt" TIMESTAMP(3);
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordPostStatus" TEXT DEFAULT 'pending';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "discordRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "summary" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverImage" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "startDateTime" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "endDateTime" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "hostId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "hostName" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "location" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "vrchatWorldUrl" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Other';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "rules" TEXT DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'UPCOMING';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT true;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPosted" BOOLEAN DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPostedAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordPostStatus" TEXT DEFAULT 'pending';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "discordRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- ShopDesign
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "creator" TEXT DEFAULT '';
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT '';
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "imageAlt" TEXT DEFAULT '';
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT false;
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT true;
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ShopDesign" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- PHASE 3: INDEXES (use CONCURRENTLY in production, run outside transaction)
-- Consistent order: table alphabetical, then index name alphabetical
-- ============================================================

-- Announcement indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Announcement_slug_key" ON "Announcement"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Announcement_discordMessageId_key" ON "Announcement"("discordMessageId");
CREATE INDEX IF NOT EXISTS "Announcement_state_publishedAt_idx" ON "Announcement"("state", "publishedAt");
CREATE INDEX IF NOT EXISTS "Announcement_pinned_state_idx" ON "Announcement"("pinned", "state");
CREATE INDEX IF NOT EXISTS "Announcement_authorId_idx" ON "Announcement"("authorId");
CREATE INDEX IF NOT EXISTS "Announcement_categoryId_idx" ON "Announcement"("categoryId");
CREATE INDEX IF NOT EXISTS "Announcement_scheduledAt_idx" ON "Announcement"("scheduledAt") WHERE "scheduledAt" IS NOT NULL;

-- Event indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");
CREATE INDEX IF NOT EXISTS "Event_published_startDateTime_idx" ON "Event"("published", "startDateTime");
CREATE INDEX IF NOT EXISTS "Event_published_archivedAt_idx" ON "Event"("published", "archivedAt");
CREATE INDEX IF NOT EXISTS "Event_status_published_idx" ON "Event"("status", "published");
CREATE INDEX IF NOT EXISTS "Event_category_idx" ON "Event"("category");
CREATE INDEX IF NOT EXISTS "Event_tags_idx" ON "Event" USING GIN ("tags");

-- GalleryImage indexes
CREATE INDEX IF NOT EXISTS "GalleryImage_status_createdAt_idx" ON "GalleryImage"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "GalleryImage_published_createdAt_idx" ON "GalleryImage"("published", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "GalleryImage_slug_key" ON "GalleryImage"("slug");

-- ErrorLog indexes
CREATE INDEX IF NOT EXISTS "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ErrorLog_digest_idx" ON "ErrorLog"("digest");

-- Report indexes
CREATE INDEX IF NOT EXISTS "Report_contentType_contentId_idx" ON "Report"("contentType", "contentId");
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_status_priority_createdAt_idx" ON "Report"("status", "priority", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_assignedToId_idx" ON "Report"("assignedToId");
CREATE INDEX IF NOT EXISTS "Report_reportToken_key" ON "Report"("reportToken");

-- ReportAuditLog indexes
CREATE INDEX IF NOT EXISTS "ReportAuditLog_reportId_createdAt_idx" ON "ReportAuditLog"("reportId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReportAuditLog_actorId_idx" ON "ReportAuditLog"("actorId");

-- GroupPhoto indexes
CREATE INDEX IF NOT EXISTS "GroupPhoto_createdAt_idx" ON "GroupPhoto"("createdAt");

-- Update indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Update_slug_key" ON "Update"("slug");
CREATE INDEX IF NOT EXISTS "Update_publishedAt_idx" ON "Update"("publishedAt");
CREATE INDEX IF NOT EXISTS "Update_version_idx" ON "Update"("version");
CREATE INDEX IF NOT EXISTS "Update_category_idx" ON "Update"("category");
CREATE INDEX IF NOT EXISTS "Update_featured_publishedAt_idx" ON "Update"("featured", "publishedAt");

-- CommunitySubmission indexes
CREATE INDEX IF NOT EXISTS "CommunitySubmission_status_createdAt_idx" ON "CommunitySubmission"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "CommunitySubmission_type_idx" ON "CommunitySubmission"("type");
CREATE INDEX IF NOT EXISTS "CommunitySubmission_published_idx" ON "CommunitySubmission"("published");
CREATE INDEX IF NOT EXISTS "CommunitySubmission_reviewedBy_idx" ON "CommunitySubmission"("reviewedBy");

-- CommunitySubmissionReport indexes
CREATE INDEX IF NOT EXISTS "CommunitySubmissionReport_submissionId_idx" ON "CommunitySubmissionReport"("submissionId");
CREATE INDEX IF NOT EXISTS "CommunitySubmissionReport_status_createdAt_idx" ON "CommunitySubmissionReport"("status", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CommunitySubmissionReport_reportToken_key" ON "CommunitySubmissionReport"("reportToken");

-- CommunitySubmissionModerationLog indexes
CREATE INDEX IF NOT EXISTS "CommunitySubmissionModerationLog_submissionId_idx" ON "CommunitySubmissionModerationLog"("submissionId");
CREATE INDEX IF NOT EXISTS "CommunitySubmissionModerationLog_performedAt_idx" ON "CommunitySubmissionModerationLog"("performedAt");

-- HealthCheck indexes
CREATE INDEX IF NOT EXISTS "HealthCheck_serviceId_checkedAt_idx" ON "HealthCheck"("serviceId", "checkedAt");

-- Poll indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Poll_slug_key" ON "Poll"("slug");
CREATE INDEX IF NOT EXISTS "Poll_published_createdAt_idx" ON "Poll"("published", "createdAt");
CREATE INDEX IF NOT EXISTS "PollOption_pollId_idx" ON "PollOption"("pollId");
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_anonId_key" ON "PollVote"("pollId", "anonId");
CREATE INDEX IF NOT EXISTS "PollVote_pollId_createdAt_idx" ON "PollVote"("pollId", "createdAt");

-- Partner indexes
CREATE INDEX IF NOT EXISTS "Partner_sortOrder_name_idx" ON "Partner"("sortOrder", "name");

-- Rule indexes
CREATE INDEX IF NOT EXISTS "Rule_sortOrder_category_idx" ON "Rule"("sortOrder", "category");

-- Guide indexes
CREATE INDEX IF NOT EXISTS "Guide_sortOrder_category_idx" ON "Guide"("sortOrder", "category");
CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX IF NOT EXISTS "Guide_updatedAt_idx" ON "Guide"("updatedAt");

-- ShopDesign indexes
CREATE INDEX IF NOT EXISTS "ShopDesign_published_idx" ON "ShopDesign"("published");
CREATE INDEX IF NOT EXISTS "ShopDesign_featured_idx" ON "ShopDesign"("featured");
CREATE INDEX IF NOT EXISTS "ShopDesign_category_published_idx" ON "ShopDesign"("category", "published");

-- Staff indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Staff_vrchatUsername_key" ON "Staff"("vrchatUsername");
CREATE INDEX IF NOT EXISTS "Staff_rank_idx" ON "Staff"("rank");
CREATE INDEX IF NOT EXISTS "Staff_sortOrder_idx" ON "Staff"("sortOrder");

-- User indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_vrchatUsername_idx" ON "User"("vrchatUsername");

-- EventReminder indexes
CREATE INDEX IF NOT EXISTS "EventReminder_remindAt_sentAt_idx" ON "EventReminder"("remindAt", "sentAt");
CREATE INDEX IF NOT EXISTS "EventReminder_userId_idx" ON "EventReminder"("userId");
CREATE INDEX IF NOT EXISTS "EventReminder_eventId_idx" ON "EventReminder"("eventId");

-- AnnouncementCategory indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementCategory_slug_key" ON "AnnouncementCategory"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementCategory_name_key" ON "AnnouncementCategory"("name");

-- AnnouncementTag indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementTag_slug_key" ON "AnnouncementTag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementTag_name_key" ON "AnnouncementTag"("name");

-- ============================================================
-- PHASE 4: FOREIGN KEYS (consistent table order)
-- Note: NOT VALID to avoid long locks, validate separately if needed
-- ============================================================
DO $$ BEGIN
    ALTER TABLE "Event"
        ADD CONSTRAINT "Event_hostId_fkey"
        FOREIGN KEY ("hostId") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CommunitySubmission"
        ADD CONSTRAINT "CommunitySubmission_reviewedBy_fkey"
        FOREIGN KEY ("reviewedBy") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CommunitySubmissionReport"
        ADD CONSTRAINT "CommunitySubmissionReport_submissionId_fkey"
        FOREIGN KEY ("submissionId") REFERENCES "CommunitySubmission"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CommunitySubmissionModerationLog"
        ADD CONSTRAINT "CommunitySubmissionModerationLog_submissionId_fkey"
        FOREIGN KEY ("submissionId") REFERENCES "CommunitySubmission"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CommunitySubmissionModerationLog"
        ADD CONSTRAINT "CommunitySubmissionModerationLog_performedBy_fkey"
        FOREIGN KEY ("performedBy") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Report"
        ADD CONSTRAINT "Report_assignedToId_fkey"
        FOREIGN KEY ("assignedToId") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Report"
        ADD CONSTRAINT "Report_resolvedById_fkey"
        FOREIGN KEY ("resolvedById") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ReportAuditLog"
        ADD CONSTRAINT "ReportAuditLog_reportId_fkey"
        FOREIGN KEY ("reportId") REFERENCES "Report"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ReportAuditLog"
        ADD CONSTRAINT "ReportAuditLog_actorId_fkey"
        FOREIGN KEY ("actorId") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS "update_Announcement_updatedAt" ON "Announcement";
CREATE TRIGGER "update_Announcement_updatedAt" BEFORE UPDATE ON "Announcement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Event_updatedAt" ON "Event";
CREATE TRIGGER "update_Event_updatedAt" BEFORE UPDATE ON "Event" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_GroupPhoto_updatedAt" ON "GroupPhoto";
CREATE TRIGGER "update_GroupPhoto_updatedAt" BEFORE UPDATE ON "GroupPhoto" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Partner_updatedAt" ON "Partner";
CREATE TRIGGER "update_Partner_updatedAt" BEFORE UPDATE ON "Partner" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Setting_updatedAt" ON "Setting";
CREATE TRIGGER "update_Setting_updatedAt" BEFORE UPDATE ON "Setting" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_ShopDesign_updatedAt" ON "ShopDesign";
CREATE TRIGGER "update_ShopDesign_updatedAt" BEFORE UPDATE ON "ShopDesign" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Staff_updatedAt" ON "Staff";
CREATE TRIGGER "update_Staff_updatedAt" BEFORE UPDATE ON "Staff" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_User_updatedAt" ON "User";
CREATE TRIGGER "update_User_updatedAt" BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_EventCategory_updatedAt" ON "EventCategory";
CREATE TRIGGER "update_EventCategory_updatedAt" BEFORE UPDATE ON "EventCategory" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_EventTag_updatedAt" ON "EventTag";
CREATE TRIGGER "update_EventTag_updatedAt" BEFORE UPDATE ON "EventTag" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_AnnouncementCategory_updatedAt" ON "AnnouncementCategory";
CREATE TRIGGER "update_AnnouncementCategory_updatedAt" BEFORE UPDATE ON "AnnouncementCategory" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_AnnouncementTag_updatedAt" ON "AnnouncementTag";
CREATE TRIGGER "update_AnnouncementTag_updatedAt" BEFORE UPDATE ON "AnnouncementTag" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_CommunitySubmission_updatedAt" ON "CommunitySubmission";
CREATE TRIGGER "update_CommunitySubmission_updatedAt" BEFORE UPDATE ON "CommunitySubmission" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_CommunitySubmissionReport_updatedAt" ON "CommunitySubmissionReport";
CREATE TRIGGER "update_CommunitySubmissionReport_updatedAt" BEFORE UPDATE ON "CommunitySubmissionReport" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Report_updatedAt" ON "Report";
CREATE TRIGGER "update_Report_updatedAt" BEFORE UPDATE ON "Report" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Guide_updatedAt" ON "Guide";
CREATE TRIGGER "update_Guide_updatedAt" BEFORE UPDATE ON "Guide" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_GalleryImage_updatedAt" ON "GalleryImage";
CREATE TRIGGER "update_GalleryImage_updatedAt" BEFORE UPDATE ON "GalleryImage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Update_updatedAt" ON "Update";
CREATE TRIGGER "update_Update_updatedAt" BEFORE UPDATE ON "Update" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "update_Poll_updatedAt" ON "Poll";
CREATE TRIGGER "update_Poll_updatedAt" BEFORE UPDATE ON "Poll" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PHASE 7: SEED DEFAULT CATEGORIES & TAGS
-- ============================================================
INSERT INTO "EventCategory" ("id", "name", "slug", "description", "color", "sortOrder") VALUES
  (gen_random_uuid()::text, 'Community', 'community', 'Community gatherings and meetups', 'brand', 1),
  (gen_random_uuid()::text, 'VRChat', 'vrchat', 'VRChat-specific events and world hops', 'violet', 2),
  (gen_random_uuid()::text, 'Gaming', 'gaming', 'Game nights and tournaments', 'emerald', 3),
  (gen_random_uuid()::text, 'Social', 'social', 'Casual hangouts and socializing', 'pink', 4),
  (gen_random_uuid()::text, 'Contest', 'contest', 'Competitions with prizes', 'amber', 5),
  (gen_random_uuid()::text, 'Creator', 'creator', 'Creator showcases and workshops', 'cyan', 6),
  (gen_random_uuid()::text, 'Support', 'support', 'Support groups and safe spaces', 'rose', 7),
  (gen_random_uuid()::text, 'Workshop', 'workshop', 'Educational sessions and tutorials', 'indigo', 8),
  (gen_random_uuid()::text, 'Party', 'party', 'Dance parties and celebrations', 'fuchsia', 9),
  (gen_random_uuid()::text, 'Other', 'other', 'Uncategorized events', 'ink', 99)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "EventTag" ("id", "name", "slug", "description", "color") VALUES
  (gen_random_uuid()::text, 'LGBTQ+', 'lgbtq', 'LGBTQ+ focused events', 'pink'),
  (gen_random_uuid()::text, 'Furry', 'furry', 'Furry community events', 'amber'),
  (gen_random_uuid()::text, 'VRC', 'vrc', 'VRChat related', 'violet'),
  (gen_random_uuid()::text, 'Newcomers', 'newcomers', 'Newcomer-friendly events', 'emerald'),
  (gen_random_uuid()::text, 'Adults', 'adults', '18+ only events', 'red'),
  (gen_random_uuid()::text, 'Contest', 'contest-tag', 'Competitive events', 'amber'),
  (gen_random_uuid()::text, 'Music', 'music', 'Music and DJ events', 'cyan')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "AnnouncementCategory" ("id", "name", "slug", "description", "color", "sortOrder", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'News', 'news', 'General community news', 'brand', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Update', 'update', 'Platform and feature updates', 'cyan', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Event', 'event-announcement', 'Event-related announcements', 'violet', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Community', 'community', 'Community spotlights and stories', 'pink', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Maintenance', 'maintenance', 'Scheduled maintenance notices', 'amber', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Safety', 'safety', 'Safety and moderation updates', 'red', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "AnnouncementTag" ("id", "name", "slug", "description", "color", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Important', 'important', 'High priority announcements', 'red', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Feature', 'feature', 'New feature announcements', 'cyan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Schedule', 'schedule', 'Schedule changes', 'amber', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Welcome', 'welcome', 'New member welcomes', 'emerald', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Reminder', 'reminder', 'Reminders and follow-ups', 'violet', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================
-- PHASE 8: TAG NORMALIZATION FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION normalize_event_tags(tags TEXT[])
RETURNS TEXT[] LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY(
    SELECT DISTINCT lower(trim(both from tag))
    FROM unnest(tags) AS tag
    WHERE tag IS NOT NULL AND trim(both from tag) <> ''
    ORDER BY 1
  );
$$;

-- Trigger to auto-normalize tags on Event insert/update
CREATE OR REPLACE FUNCTION normalize_event_tags_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.tags := normalize_event_tags(NEW.tags);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "normalize_event_tags" ON "Event";
CREATE TRIGGER "normalize_event_tags"
  BEFORE INSERT OR UPDATE ON "Event"
  FOR EACH ROW EXECUTE FUNCTION normalize_event_tags_trigger();

-- ============================================================
-- PHASE 6: BACKFILL NULLS FOR EXISTING DATA
-- Run after all tables/columns exist to satisfy Prisma non-nullable fields
-- ============================================================

-- Event: backfill nulls for non-nullable Prisma fields
UPDATE "Event" SET
  "slug" = COALESCE("slug", 'event-' || id),
  "title" = COALESCE("title", 'Untitled Event'),
  "summary" = COALESCE("summary", ''),
  "description" = COALESCE("description", ''),
  "coverImage" = COALESCE("coverImage", ''),
  "timezone" = COALESCE("timezone", 'UTC'),
  "hostName" = COALESCE("hostName", ''),
  "location" = COALESCE("location", ''),
  "vrchatWorldUrl" = COALESCE("vrchatWorldUrl", ''),
  "category" = COALESCE("category", 'Other'),
  "tags" = COALESCE("tags", ARRAY[]::TEXT[]),
  "rules" = COALESCE("rules", ''),
  "status" = COALESCE("status", 'UPCOMING'),
  "published" = COALESCE("published", true),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "slug" IS NULL
   OR "title" IS NULL
   OR "summary" IS NULL
   OR "description" IS NULL
   OR "coverImage" IS NULL
   OR "timezone" IS NULL
   OR "hostName" IS NULL
   OR "location" IS NULL
   OR "vrchatWorldUrl" IS NULL
   OR "category" IS NULL
   OR "tags" IS NULL
   OR "rules" IS NULL
   OR "status" IS NULL
   OR "published" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- ShopDesign: backfill nulls
UPDATE "ShopDesign" SET
  "description" = COALESCE("description", ''),
  "creator" = COALESCE("creator", ''),
  "category" = COALESCE("category", ''),
  "imageAlt" = COALESCE("imageAlt", ''),
  "galleryUrls" = COALESCE("galleryUrls", ARRAY[]::TEXT[]),
  "featured" = COALESCE("featured", false),
  "published" = COALESCE("published", true),
  "sortOrder" = COALESCE("sortOrder", 0),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "description" IS NULL
   OR "creator" IS NULL
   OR "category" IS NULL
   OR "imageAlt" IS NULL
   OR "galleryUrls" IS NULL
   OR "featured" IS NULL
   OR "published" IS NULL
   OR "sortOrder" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- Announcement: backfill nulls
UPDATE "Announcement" SET
  "slug" = COALESCE("slug", 'announcement-' || id),
  "title" = COALESCE("title", 'Untitled'),
  "excerpt" = COALESCE("excerpt", ''),
  "content" = COALESCE("content", ''),
  "coverImage" = COALESCE("coverImage", ''),
  "published" = COALESCE("published", true),
  "publishedAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "slug" IS NULL
   OR "title" IS NULL
   OR "excerpt" IS NULL
   OR "content" IS NULL
   OR "coverImage" IS NULL
   OR "published" IS NULL
   OR "publishedAt" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- Staff: backfill nulls
UPDATE "Staff" SET
  "name" = COALESCE("name", 'Unknown'),
  "vrchatUsername" = COALESCE("vrchatUsername", 'user-' || id),
  "rank" = COALESCE("rank", 'Member'),
  "bio" = COALESCE("bio", ''),
  "photoUrl" = COALESCE("photoUrl", ''),
  "socials" = COALESCE("socials", '[]'),
  "sortOrder" = COALESCE("sortOrder", 0),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "name" IS NULL
   OR "vrchatUsername" IS NULL
   OR "rank" IS NULL
   OR "bio" IS NULL
   OR "photoUrl" IS NULL
   OR "socials" IS NULL
   OR "sortOrder" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- Partner: backfill nulls
UPDATE "Partner" SET
  "name" = COALESCE("name", 'Unnamed Partner'),
  "logoUrl" = COALESCE("logoUrl", ''),
  "description" = COALESCE("description", ''),
  "links" = COALESCE("links", '[]'),
  "tag" = COALESCE("tag", 'Partner'),
  "sortOrder" = COALESCE("sortOrder", 0),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "name" IS NULL
   OR "logoUrl" IS NULL
   OR "description" IS NULL
   OR "links" IS NULL
   OR "tag" IS NULL
   OR "sortOrder" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- GalleryImage: backfill nulls
UPDATE "GalleryImage" SET
  "title" = COALESCE("title", 'Untitled'),
  "description" = COALESCE("description", ''),
  "status" = COALESCE("status", 'APPROVED'),
  "submitterName" = COALESCE("submitterName", ''),
  "rejectionReason" = COALESCE("rejectionReason", ''),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
WHERE "title" IS NULL
   OR "description" IS NULL
   OR "status" IS NULL
   OR "submitterName" IS NULL
   OR "rejectionReason" IS NULL
   OR "createdAt" IS NULL;

-- GroupPhoto: backfill nulls
UPDATE "GroupPhoto" SET
  "title" = COALESCE("title", 'Untitled'),
  "description" = COALESCE("description", ''),
  "bannerUrl" = COALESCE("bannerUrl", ''),
  "rules" = COALESCE("rules", ''),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "title" IS NULL
   OR "description" IS NULL
   OR "bannerUrl" IS NULL
   OR "rules" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- Setting: backfill nulls
UPDATE "Setting" SET
  "value" = COALESCE("value", ''),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "value" IS NULL OR "updatedAt" IS NULL;

-- Rule: backfill nulls
UPDATE "Rule" SET
  "category" = COALESCE("category", 'General'),
  "title" = COALESCE("title", 'Untitled Rule'),
  "content" = COALESCE("content", ''),
  "sortOrder" = COALESCE("sortOrder", 0)
WHERE "category" IS NULL
   OR "title" IS NULL
   OR "content" IS NULL
   OR "sortOrder" IS NULL;

-- Guide: backfill nulls
UPDATE "Guide" SET
  "category" = COALESCE("category", 'GENERAL'),
  "question" = COALESCE("question", ''),
  "answer" = COALESCE("answer", ''),
  "sortOrder" = COALESCE("sortOrder", 0)
WHERE "category" IS NULL
   OR "question" IS NULL
   OR "answer" IS NULL
   OR "sortOrder" IS NULL;

-- Link: backfill nulls
UPDATE "Link" SET
  "label" = COALESCE("label", 'Link'),
  "url" = COALESCE("url", '#'),
  "icon" = COALESCE("icon", 'link'),
  "description" = COALESCE("description", ''),
  "category" = COALESCE("category", 'Other'),
  "featured" = COALESCE("featured", FALSE),
  "active" = COALESCE("active", TRUE),
  "sortOrder" = COALESCE("sortOrder", 0)
WHERE "label" IS NULL
   OR "url" IS NULL
   OR "icon" IS NULL
   OR "description" IS NULL
   OR "category" IS NULL
   OR "featured" IS NULL
   OR "active" IS NULL
   OR "sortOrder" IS NULL;

-- CommunitySubmission: backfill nulls
UPDATE "CommunitySubmission" SET
  "type" = COALESCE("type", 'OTHER'),
  "status" = COALESCE("status", 'PENDING'),
  "title" = COALESCE("title", 'Untitled submission'),
  "description" = COALESCE("description", ''),
  "submitterName" = COALESCE("submitterName", ''),
  "fileName" = COALESCE("fileName", ''),
  "fileSize" = COALESCE("fileSize", 0),
  "contentType" = COALESCE("contentType", 'application/octet-stream'),
  "rejectionReason" = COALESCE("rejectionReason", ''),
  "changeRequestNote" = COALESCE("changeRequestNote", ''),
  "published" = COALESCE("published", false),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "type" IS NULL
   OR "status" IS NULL
   OR "title" IS NULL
   OR "description" IS NULL
   OR "submitterName" IS NULL
   OR "fileName" IS NULL
   OR "fileSize" IS NULL
   OR "contentType" IS NULL
   OR "rejectionReason" IS NULL
   OR "changeRequestNote" IS NULL
   OR "published" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- CommunitySubmissionReport: backfill nulls
UPDATE "CommunitySubmissionReport" SET
  "reason" = COALESCE("reason", ''),
  "details" = COALESCE("details", ''),
  "reporterName" = COALESCE("reporterName", ''),
  "status" = COALESCE("status", 'RECEIVED'),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "reason" IS NULL
   OR "details" IS NULL
   OR "reporterName" IS NULL
   OR "status" IS NULL
   OR "createdAt" IS NULL
   OR "updatedAt" IS NULL;

-- CommunitySubmissionModerationLog: backfill nulls
UPDATE "CommunitySubmissionModerationLog" SET
  "action" = COALESCE("action", 'APPROVED'),
  "note" = COALESCE("note", ''),
  "performedAt" = COALESCE("performedAt", CURRENT_TIMESTAMP)
WHERE "action" IS NULL
   OR "note" IS NULL
   OR "performedAt" IS NULL;