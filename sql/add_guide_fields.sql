-- Add new columns to Guide table
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing guides with slugs
UPDATE "Guide" SET "slug" = lower(regexp_replace("question", '[^a-z0-9]+', '-', 'g')) || '-' || substr("id", 1, 8) WHERE "slug" IS NULL;

-- Make slug NOT NULL
ALTER TABLE "Guide" ALTER COLUMN "slug" SET NOT NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");

-- Create index on updatedAt
CREATE INDEX IF NOT EXISTS "Guide_updatedAt_idx" ON "Guide"("updatedAt");

-- Add trigger for updatedAt
DROP TRIGGER IF EXISTS "update_Guide_updatedAt" ON "Guide";
CREATE TRIGGER "update_Guide_updatedAt" BEFORE UPDATE ON "Guide" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();