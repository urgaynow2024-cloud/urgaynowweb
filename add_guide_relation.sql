-- Add relatedToId column for self-referential relation
ALTER TABLE "Guide" ADD COLUMN IF NOT EXISTS "relatedToId" TEXT;

-- Add foreign key
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "Guide"("id") ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS "Guide_relatedToId_idx" ON "Guide"("relatedToId");