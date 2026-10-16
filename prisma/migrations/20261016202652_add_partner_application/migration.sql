-- Migration: Add PartnerApplication model for partnership application workflow

-- 1. Create the enum type
DO $$ BEGIN
    CREATE TYPE "PartnerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create the PartnerApplication table
CREATE TABLE "PartnerApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discord" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT,
    "dedupeHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY ("id")
);

-- 3. Add foreign key for reviewedBy -> Staff.id
ALTER TABLE "PartnerApplication"
  ADD CONSTRAINT "PartnerApplication_reviewedBy_fkey"
  FOREIGN KEY ("reviewedBy") REFERENCES "Staff"("id") ON DELETE SET NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS "PartnerApplication_status_createdAt_idx" ON "PartnerApplication"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "PartnerApplication_email_idx" ON "PartnerApplication"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "PartnerApplication_idempotencyKey_key" ON "PartnerApplication"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "PartnerApplication_dedupeHash_createdAt_idx" ON "PartnerApplication"("dedupeHash", "createdAt");
