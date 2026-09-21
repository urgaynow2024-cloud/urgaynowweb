-- First remove default
ALTER TABLE "CommunitySubmissionReport" ALTER COLUMN "status" DROP DEFAULT;

-- Change the column to text temporarily
ALTER TABLE "CommunitySubmissionReport" ALTER COLUMN "status" TYPE TEXT;

-- Now drop the old type
DROP TYPE IF EXISTS "report_status" CASCADE;

-- Create the new type with correct name
CREATE TYPE "ReportStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED');

-- Update the column to use the new type
ALTER TABLE "CommunitySubmissionReport" ALTER COLUMN "status" TYPE "ReportStatus" USING "status"::"ReportStatus";

-- Set default
ALTER TABLE "CommunitySubmissionReport" ALTER COLUMN "status" SET DEFAULT 'RECEIVED'::"ReportStatus";