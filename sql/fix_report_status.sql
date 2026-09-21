-- Create report_status enum if not exists
DO $$ BEGIN
    CREATE TYPE "report_status" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add anonymous and reportToken columns to CommunitySubmissionReport if not exist
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "anonymous" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "reportToken" TEXT;

-- Create unique index on reportToken
CREATE UNIQUE INDEX IF NOT EXISTS "CommunitySubmissionReport_reportToken_key" ON "CommunitySubmissionReport"("reportToken");

-- Update existing reports with a default reportToken
UPDATE "CommunitySubmissionReport" SET "reportToken" = gen_random_uuid()::text WHERE "reportToken" IS NULL;

-- Make reportToken NOT NULL
ALTER TABLE "CommunitySubmissionReport" ALTER COLUMN "reportToken" SET NOT NULL;