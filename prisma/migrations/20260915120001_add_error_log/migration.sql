-- Add the ErrorLog model for staff debugging of client-side errors.

CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "digest" TEXT,
    "path" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog" ("createdAt");
CREATE INDEX "ErrorLog_digest_idx" ON "ErrorLog" ("digest");