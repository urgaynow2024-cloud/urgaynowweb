-- Real, stored monitoring samples used by the live status metrics charts.
-- Idempotent so it can be re-run safely. Apply with `prisma migrate deploy`
-- or `prisma db push`.

CREATE TABLE IF NOT EXISTS "StatusMetric" (
    "id"          TEXT NOT NULL,
    "key"         TEXT NOT NULL,
    "label"       TEXT NOT NULL,
    "unit"        TEXT NOT NULL DEFAULT '',
    "kind"        TEXT NOT NULL DEFAULT 'gauge',
    "value"       DOUBLE PRECISION NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'operational',
    "detail"      TEXT NOT NULL DEFAULT '',
    "serviceId"   TEXT,
    "recordedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StatusMetric_key_recordedAt_idx" ON "StatusMetric"("key", "recordedAt");
CREATE INDEX IF NOT EXISTS "StatusMetric_recordedAt_idx" ON "StatusMetric"("recordedAt");
