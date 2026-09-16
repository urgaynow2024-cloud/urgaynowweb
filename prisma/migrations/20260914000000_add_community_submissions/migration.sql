-- CreateEnum
DO $$ BEGIN
    CREATE TYPE community_submission_type AS ENUM ('ARTWORK', 'AVATAR', 'SCREENSHOT', 'PHOTOGRAPHY', 'VRCHAT_WORLD', 'CREATOR_PROJECT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE community_submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUEST_CHANGES');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "type" community_submission_type NOT NULL DEFAULT 'OTHER';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "status" community_submission_status NOT NULL DEFAULT 'PENDING';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "submitterName" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "submitterEmail" TEXT;
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "fileName" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER DEFAULT 0;
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "contentType" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "changeRequestNote" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT false;
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CommunitySubmission" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "submissionId" TEXT;
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "reason" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "details" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "reporterName" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "reporterEmail" TEXT;
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING';
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CommunitySubmissionReport" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CommunitySubmissionModerationLog" ADD COLUMN IF NOT EXISTS "submissionId" TEXT;
ALTER TABLE "CommunitySubmissionModerationLog" ADD COLUMN IF NOT EXISTS "action" TEXT DEFAULT 'APPROVED';
ALTER TABLE "CommunitySubmissionModerationLog" ADD COLUMN IF NOT EXISTS "note" TEXT DEFAULT '';
ALTER TABLE "CommunitySubmissionModerationLog" ADD COLUMN IF NOT EXISTS "performedBy" TEXT;
ALTER TABLE "CommunitySubmissionModerationLog" ADD COLUMN IF NOT EXISTS "performedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;