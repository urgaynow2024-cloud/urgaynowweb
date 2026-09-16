-- Migration: Backfill nulls for non-nullable Prisma fields
-- Run this against your Supabase/PostgreSQL database

-- Event: backfill null slug, title, summary, description, coverImage, timezone, hostName, location, vrchatWorldUrl, category, tags, rules, status, published
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

-- ShopDesign: backfill null description, creator, category, imageAlt, galleryUrls, featured, published, sortOrder
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

-- Announcement: backfill any nulls
UPDATE "Announcement" SET
  "slug" = COALESCE("slug", 'announcement-' || id),
  "title" = COALESCE("title", 'Untitled'),
  "excerpt" = COALESCE("excerpt", ''),
  "content" = COALESCE("content", ''),
  "coverImage" = COALESCE("coverImage", ''),
  "state" = COALESCE("state", 'DRAFT'),
  "publishedAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP),
  "scheduledAt" = COALESCE("scheduledAt", NULL),
  "authorId" = COALESCE("authorId", NULL),
  "categoryId" = COALESCE("categoryId", NULL),
  "pinned" = COALESCE("pinned", false),
  "discordMessageId" = COALESCE("discordMessageId", NULL),
  "discordPosted" = COALESCE("discordPosted", false),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "slug" IS NULL
   OR "title" IS NULL
   OR "excerpt" IS NULL
   OR "content" IS NULL
   OR "coverImage" IS NULL
   OR "state" IS NULL
   OR "publishedAt" IS NULL
   OR "pinned" IS NULL
   OR "discordPosted" IS NULL
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
  "category" = COALESCE("category", 'General'),
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
  "sortOrder" = COALESCE("sortOrder", 0)
WHERE "label" IS NULL
   OR "url" IS NULL
   OR "icon" IS NULL
   OR "sortOrder" IS NULL;

-- CommunitySubmissionReport status is reconciled via the Prisma migration
-- prisma/migrations/20260914124000_reconcile_report_status/migration.sql
-- (report_status enum + legacy value normalisation + column retype).

-- After backfill, verify no nulls remain in required columns
-- (Run these to confirm - should return 0 rows each)
-- SELECT count(*) FROM "Event" WHERE "slug" IS NULL;
-- SELECT count(*) FROM "ShopDesign" WHERE "description" IS NULL;
-- SELECT count(*) FROM "Announcement" WHERE "slug" IS NULL;