-- Add new columns to GalleryImage
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing GalleryImages with slugs
UPDATE "GalleryImage" SET "slug" = lower(regexp_replace("title", '[^a-z0-9]+', '-', 'g')) || '-' || substr("id", 1, 8) WHERE "slug" IS NULL;

-- Make slug NOT NULL
ALTER TABLE "GalleryImage" ALTER COLUMN "slug" SET NOT NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "GalleryImage_slug_key" ON "GalleryImage"("slug");

-- Create index on published
CREATE INDEX IF NOT EXISTS "GalleryImage_published_createdAt_idx" ON "GalleryImage"("published", "createdAt");

-- Add trigger for updatedAt
DROP TRIGGER IF EXISTS "update_GalleryImage_updatedAt" ON "GalleryImage";
CREATE TRIGGER "update_GalleryImage_updatedAt" BEFORE UPDATE ON "GalleryImage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();