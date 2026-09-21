-- Migration: add_update_category_featured
-- Adds a `category` and `featured` column to the "Update" changelog table.
--
-- category: classified changelog category (New | Improvement | Fix | Security |
--           Performance | Maintenance | Community | Moderation | Support)
-- featured: marks an update as a highlighted / pinned changelog entry
--
-- Safe & idempotent: only adds columns if they do not already exist.

ALTER TABLE IF EXISTS "Update"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT '';

ALTER TABLE IF EXISTS "Update"
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "Update_category_idx" ON "Update"("category");
CREATE INDEX IF NOT EXISTS "Update_featured_publishedAt_idx" ON "Update"("featured", "publishedAt");

-- Trigger refresh for updated_at (PostgreSQL) — ensure updated_at is maintained
DROP TRIGGER IF EXISTS "update_Update_updatedAt" ON "Update";
DO $$ BEGIN
  CREATE TRIGGER "update_Update_updatedAt" BEFORE UPDATE ON "Update"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
