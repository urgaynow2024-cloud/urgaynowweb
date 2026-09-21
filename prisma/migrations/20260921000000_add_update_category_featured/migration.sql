-- Migration: add_update_category_featured
-- Adds `category` and `featured` columns to the "Update" changelog table.

ALTER TABLE IF EXISTS "Update"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT '';

ALTER TABLE IF EXISTS "Update"
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "Update_category_idx" ON "Update"("category");
CREATE INDEX IF NOT EXISTS "Update_featured_publishedAt_idx" ON "Update"("featured", "publishedAt");

DROP TRIGGER IF EXISTS "update_Update_updatedAt" ON "Update";
DO $$ BEGIN
  CREATE TRIGGER "update_Update_updatedAt" BEFORE UPDATE ON "Update"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
