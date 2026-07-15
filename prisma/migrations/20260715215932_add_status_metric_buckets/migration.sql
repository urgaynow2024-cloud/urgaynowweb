-- Enhance StatusMetric with source/environment metadata and add bucketed
-- aggregation table for high-volume API metrics.
-- Idempotent: safe to re-run. Apply with `prisma migrate deploy` or `prisma db push`.

-- StatusMetric additions
ALTER TABLE "StatusMetric" ADD COLUMN IF NOT EXISTS "metadata" TEXT DEFAULT '';
ALTER TABLE "StatusMetric" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT '';
ALTER TABLE "StatusMetric" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "StatusMetric" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'production';

CREATE INDEX IF NOT EXISTS "StatusMetric_environment_recordedAt_idx" ON "StatusMetric"("environment", "recordedAt");

-- Bucketed metrics table
CREATE TABLE IF NOT EXISTS "StatusMetricBucket" (
    "id"           TEXT NOT NULL,
    "metricKey"    TEXT NOT NULL,
    "bucketStart"  TIMESTAMP(3) NOT NULL,
    "bucketSize"   INTEGER NOT NULL,
    "count"        INTEGER NOT NULL DEFAULT 0,
    "sum"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min"          DOUBLE PRECISION,
    "max"          DOUBLE PRECISION,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "p50"          DOUBLE PRECISION,
    "p75"          DOUBLE PRECISION,
    "p95"          DOUBLE PRECISION,
    "p99"          DOUBLE PRECISION,
    "unit"         TEXT NOT NULL DEFAULT '',
    "source"       TEXT NOT NULL DEFAULT '',
    "region"       TEXT,
    "environment"  TEXT NOT NULL DEFAULT 'production',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusMetricBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_metric_bucket" ON "StatusMetricBucket"("metricKey", "bucketStart", "bucketSize", "environment", "source", "region");
CREATE INDEX IF NOT EXISTS "StatusMetricBucket_metricKey_bucketStart_idx" ON "StatusMetricBucket"("metricKey", "bucketStart");
CREATE INDEX IF NOT EXISTS "StatusMetricBucket_environment_bucketStart_idx" ON "StatusMetricBucket"("environment", "bucketStart");
CREATE INDEX IF NOT EXISTS "StatusMetricBucket_source_bucketStart_idx" ON "StatusMetricBucket"("source", "bucketStart");
