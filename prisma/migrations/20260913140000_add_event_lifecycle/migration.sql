ALTER TABLE "Event"
ADD COLUMN "slug" TEXT,
ADD COLUMN "summary" TEXT NOT NULL DEFAULT '',
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN "hostId" TEXT,
ADD COLUMN "hostName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "rules" TEXT NOT NULL DEFAULT '',
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "archivedAt" TIMESTAMP(3);

WITH normalized AS (
    SELECT
        "id",
        COALESCE(
            NULLIF(regexp_replace(lower(trim("title")), '[^a-z0-9]+', '-', 'g'), ''),
            'event'
        ) AS base_slug
    FROM "Event"
), numbered AS (
    SELECT
        "id",
        base_slug,
        row_number() OVER (PARTITION BY base_slug ORDER BY "createdAt", "id") AS slug_suffix
    FROM normalized
)
UPDATE "Event" AS event
SET "slug" = numbered.base_slug || CASE WHEN numbered.slug_suffix > 1 THEN '-' || numbered.slug_suffix::TEXT ELSE '' END
FROM numbered
WHERE event."id" = numbered."id";

ALTER TABLE "Event" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE INDEX "Event_published_archivedAt_idx" ON "Event"("published", "archivedAt");
CREATE INDEX "Event_category_idx" ON "Event"("category");
CREATE INDEX "Event_tags_idx" ON "Event" USING GIN ("tags");
