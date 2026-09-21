-- Migration: Add generalized Report and ReportAuditLog models
-- Extends the reporting system to cover all content types, not just
-- CommunitySubmissionReport.

-- Report table
CREATE TABLE IF NOT EXISTS "Report" (
    "id"              TEXT NOT NULL,
    "reportToken"     TEXT NOT NULL,
    "contentType"     TEXT NOT NULL,
    "contentId"       TEXT NOT NULL,
    "reporterId"      TEXT,
    "reporterName"    TEXT NOT NULL DEFAULT '',
    "reporterEmail"   TEXT,
    "anonymous"       BOOLEAN NOT NULL DEFAULT FALSE,
    "reportedUserId"  TEXT,
    "reportedUsername" TEXT,
    "reason"          TEXT NOT NULL,
    "description"     TEXT NOT NULL,
    "evidence"        TEXT NOT NULL DEFAULT '[]',
    "status"          TEXT NOT NULL DEFAULT 'OPEN',
    "priority"        TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId"    TEXT,
    "resolvedById"    TEXT,
    "resolution"      TEXT NOT NULL DEFAULT '',
    "resolvedAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Report_reportToken_key" ON "Report"("reportToken");
CREATE INDEX IF NOT EXISTS "Report_contentType_contentId_idx" ON "Report"("contentType", "contentId");
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_status_priority_createdAt_idx" ON "Report"("status", "priority", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_assignedToId_idx" ON "Report"("assignedToId");

-- ReportAuditLog table
CREATE TABLE IF NOT EXISTS "ReportAuditLog" (
    "id"        TEXT NOT NULL,
    "reportId"  TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "actorId"   TEXT,
    "actorName" TEXT NOT NULL DEFAULT '',
    "detail"    TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReportAuditLog_reportId_createdAt_idx" ON "ReportAuditLog"("reportId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReportAuditLog_actorId_idx" ON "ReportAuditLog"("actorId");

-- Foreign keys
DO $$ BEGIN
    ALTER TABLE "Report"
        ADD CONSTRAINT "Report_assignedToId_fkey"
        FOREIGN KEY ("assignedToId") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Report"
        ADD CONSTRAINT "Report_resolvedById_fkey"
        FOREIGN KEY ("resolvedById") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ReportAuditLog"
        ADD CONSTRAINT "ReportAuditLog_reportId_fkey"
        FOREIGN KEY ("reportId") REFERENCES "Report"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ReportAuditLog"
        ADD CONSTRAINT "ReportAuditLog_actorId_fkey"
        FOREIGN KEY ("actorId") REFERENCES "Staff"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
        NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Triggers for updatedAt
DROP TRIGGER IF EXISTS "update_Report_updatedAt" ON "Report";
CREATE TRIGGER "update_Report_updatedAt" BEFORE UPDATE ON "Report" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
