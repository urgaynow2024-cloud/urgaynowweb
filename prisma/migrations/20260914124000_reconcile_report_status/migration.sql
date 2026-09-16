-- Reconcile CommunitySubmissionReport.status to the canonical report_status taxonomy
-- (see docs/UrGayNow_Feature_Specs_MD/12-Report-Tracking.md, referenced by 10-Staff-Moderation-Dashboard).
-- Prior migration created `status` as TEXT with DEFAULT 'PENDING'.

-- 1. Enum type
DO $$ BEGIN
    CREATE TYPE "report_status" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Normalise legacy values before retyping (idempotent)
UPDATE "CommunitySubmissionReport"
  SET "status" = CASE
    WHEN "status" = 'PENDING' THEN 'RECEIVED'
    WHEN "status" IN ('REVIEWING', 'REVIEWED') THEN 'UNDER_REVIEW'
    WHEN "status" IN ('DONE', 'COMPLETE') THEN 'RESOLVED'
    WHEN "status" = 'DISMISS' THEN 'DISMISSED'
    WHEN "status" IN ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED') THEN "status"
    ELSE 'RECEIVED'
  END;

-- 3. Retype. The legacy default 'PENDING' is not a valid enum member and cannot be
--    auto-cast, so drop the default (and temporarily the dependent index) first.
ALTER TABLE "CommunitySubmissionReport"
  ALTER COLUMN "status" DROP DEFAULT;

DROP INDEX IF EXISTS "CommunitySubmissionReport_status_createdAt_idx";

ALTER TABLE "CommunitySubmissionReport"
  ALTER COLUMN "status" TYPE "report_status" USING "status"::"report_status";

-- 4. Restore the index on (status, createdAt) and set the canonical default.
CREATE INDEX IF NOT EXISTS "CommunitySubmissionReport_status_createdAt_idx"
  ON "CommunitySubmissionReport" ("status", "createdAt");

ALTER TABLE "CommunitySubmissionReport"
  ALTER COLUMN "status" SET DEFAULT 'RECEIVED'::"report_status";
