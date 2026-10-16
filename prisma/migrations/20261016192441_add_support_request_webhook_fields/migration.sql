-- Migration: Add webhook delivery fields and idempotency key to SupportRequest
-- Supports reliable Discord notifications and duplicate-prevention for retries.

-- 1. Add new columns to SupportRequest
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "reporterIpHash" TEXT NOT NULL DEFAULT '',
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "dedupeHash" TEXT NOT NULL DEFAULT '',
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "webhookStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "webhookError" TEXT NOT NULL DEFAULT '',
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "webhookAttempts" INTEGER NOT NULL DEFAULT 0,
ALTER TABLE "SupportRequest"
  ADD COLUMN IF NOT EXISTS "webhookSentAt" TIMESTAMP(3);

-- 2. Create unique index on idempotencyKey
CREATE UNIQUE INDEX IF NOT EXISTS "SupportRequest_idempotencyKey_key" ON "SupportRequest"("idempotencyKey");

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS "SupportRequest_dedupeHash_createdAt_idx" ON "SupportRequest"("dedupeHash", "createdAt");
CREATE INDEX IF NOT EXISTS "SupportRequest_webhookStatus_idx" ON "SupportRequest"("webhookStatus");
CREATE INDEX IF NOT EXISTS "SupportRequest_reporterIpHash_idx" ON "SupportRequest"("reporterIpHash");
