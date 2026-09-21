-- Migration: Links Hub redesign fields
-- Adds category, description, featured and active to the Link model so the
-- public links page can be grouped by category, show featured destinations,
-- and allow per-link activation.

DO $$ BEGIN
  ALTER TABLE "Link" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Link" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Other';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Link" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Link" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "Link_category_idx" ON "Link"("category");
CREATE INDEX IF NOT EXISTS "Link_featured_idx" ON "Link"("featured");
CREATE INDEX IF NOT EXISTS "Link_active_idx" ON "Link"("active");
