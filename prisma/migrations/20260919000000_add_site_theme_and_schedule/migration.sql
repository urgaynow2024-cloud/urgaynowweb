-- Migration: SiteTheme and ThemeSchedule tables
-- Adds the site-wide seasonal theme configuration and automatic scheduling tables.

CREATE TYPE IF NOT EXISTS "ThemeMode" AS ENUM ('MANUAL', 'AUTOMATIC');

CREATE TABLE IF NOT EXISTS "SiteTheme" (
    "id" TEXT NOT NULL,
    "mode" "ThemeMode" NOT NULL DEFAULT 'MANUAL',
    "manualThemeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ThemeSchedule" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "siteThemeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThemeSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ThemeSchedule_themeId_idx" ON "ThemeSchedule"("themeId");
CREATE INDEX IF NOT EXISTS "ThemeSchedule_start_end_idx" ON "ThemeSchedule"("start", "end");
