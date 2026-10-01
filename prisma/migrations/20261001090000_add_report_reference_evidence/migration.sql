-- Migration: Report reference IDs, protected evidence uploads, webhook delivery state
-- Adds:
--   * "reference" / "referenceSeq"  -> human-facing UGN-000123 report IDs
--   * "ReportCounter"               -> atomic counter used to mint references
--   * "ReportEvidence"              -> evidence stored as bytes, no public URL
--   * webhook delivery state + community report fields (source, incident, links, ...)
--   * duplicate-submission protection fields (idempotencyKey, dedupeHash, reporterIpHash)
--
-- Every statement is idempotent so this can be applied to an existing database
-- that already contains reports.

-- ---------------------------------------------------------------------------
-- Report table additions
-- ---------------------------------------------------------------------------
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "referenceSeq" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'CONTENT';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "contentId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reporterIpHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "dedupeHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reportedPerson" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reportedDiscord" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "incidentAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "links" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "webhookStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "webhookError" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "webhookAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "webhookSentAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP(3);

-- Older rows can no longer use the "no content" default, so give them a value.
UPDATE "Report" SET "contentId" = '' WHERE "contentId" IS NULL;

-- Unique reference index (partial: legacy rows may be NULL until backfilled).
CREATE UNIQUE INDEX IF NOT EXISTS "Report_reference_key" ON "Report"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Report_idempotencyKey_key" ON "Report"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "Report_referenceSeq_idx" ON "Report"("referenceSeq");
CREATE INDEX IF NOT EXISTS "Report_source_createdAt_idx" ON "Report"("source", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_webhookStatus_idx" ON "Report"("webhookStatus");
CREATE INDEX IF NOT EXISTS "Report_dedupeHash_createdAt_idx" ON "Report"("dedupeHash", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_reporterIpHash_idx" ON "Report"("reporterIpHash");

-- ---------------------------------------------------------------------------
-- ReportCounter — one shared row, incremented atomically to mint references
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReportCounter" (
    "id"        TEXT NOT NULL DEFAULT 'reports',
    "value"     INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportCounter_pkey" PRIMARY KEY ("id")
);
INSERT INTO "ReportCounter" ("id", "value")
VALUES ('reports', 0)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- ReportEvidence — evidence bytes, readable only through authorized staff routes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReportEvidence" (
    "id"            TEXT NOT NULL,
    "reportId"      TEXT,
    "uploaderToken" TEXT NOT NULL DEFAULT '',
    "fileName"      TEXT NOT NULL,
    "contentType"   TEXT NOT NULL DEFAULT 'application/octet-stream',
    "size"          INTEGER NOT NULL DEFAULT 0,
    "sha256"        TEXT NOT NULL DEFAULT '',
    "data"          BYTEA NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportEvidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReportEvidence_reportId_idx" ON "ReportEvidence"("reportId");
CREATE INDEX IF NOT EXISTS "ReportEvidence_uploaderToken_idx" ON "ReportEvidence"("uploaderToken");
CREATE INDEX IF NOT EXISTS "ReportEvidence_createdAt_idx" ON "ReportEvidence"("createdAt");

DO $$ BEGIN
    ALTER TABLE "ReportEvidence"
        ADD CONSTRAINT "ReportEvidence_reportId_fkey"
        FOREIGN KEY ("reportId") REFERENCES "Report"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Backfill references for reports created before this migration
-- ---------------------------------------------------------------------------
WITH numbered AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS seq
    FROM "Report"
    WHERE "reference" IS NULL
)
UPDATE "Report" r
SET "reference" = 'UGN-' || LPAD(n.seq::TEXT, 6, '0'),
    "referenceSeq" = n.seq
FROM numbered n
WHERE r."id" = n."id";

-- Keep the counter ahead of any backfilled reference.
UPDATE "ReportCounter"
SET "value" = GREATEST("value", COALESCE((SELECT MAX("referenceSeq") FROM "Report"), 0))
WHERE "id" = 'reports';

-- ---------------------------------------------------------------------------
-- Halloween 2026 automatic seasonal schedule (Oct 1 - Nov 2 2026)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    site_id TEXT;
    existing_id TEXT;
BEGIN
    SELECT "id" INTO site_id FROM "SiteTheme" ORDER BY "createdAt" ASC LIMIT 1;

    IF site_id IS NULL THEN
        INSERT INTO "SiteTheme" ("id", "mode", "manualThemeId", "createdAt", "updatedAt")
        VALUES (COALESCE(('site_' || substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 16)), 'site_halloween_2026'),
                'AUTOMATIC', 'default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        SELECT "id" INTO site_id FROM "SiteTheme" ORDER BY "createdAt" ASC LIMIT 1;
    END IF;

    UPDATE "SiteTheme" SET "mode" = 'AUTOMATIC', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = site_id;

    SELECT "id" INTO existing_id
    FROM "ThemeSchedule"
    WHERE "siteThemeId" = site_id AND "themeId" = 'halloween'
      AND "start" = TIMESTAMP '2026-10-01 00:00:00';

    IF existing_id IS NULL THEN
        INSERT INTO "ThemeSchedule" ("id", "themeId", "start", "end", "enabled", "priority", "siteThemeId", "createdAt", "updatedAt")
        VALUES (COALESCE(('sched_' || substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 16)), 'sched_halloween_2026'),
                'halloween', TIMESTAMP '2026-10-01 00:00:00', TIMESTAMP '2026-11-02 23:59:59', TRUE, 0,
                site_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;
END $$;