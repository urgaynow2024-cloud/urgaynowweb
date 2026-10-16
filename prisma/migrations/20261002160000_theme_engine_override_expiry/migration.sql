-- Migration: theme engine — administrator override expiration
--
-- Adds a single nullable column to "SiteTheme":
--   * "overrideExpiresAt" -> when an explicit administrator theme override
--     stops applying. NULL means "never expires", which is exactly the
--     behaviour that existed before this column, so every pre-existing row
--     keeps working unchanged and no row needs backfilling.
--
-- This is purely additive:
--   * no column is dropped, renamed or retyped
--   * no row is deleted or updated
--   * the column is nullable, so older application binaries that do not know
--     about it continue to work against the migrated table
--
-- Every statement is idempotent so it is safe to apply to an existing database.

ALTER TABLE "SiteTheme" ADD COLUMN IF NOT EXISTS "overrideExpiresAt" TIMESTAMP(3);
