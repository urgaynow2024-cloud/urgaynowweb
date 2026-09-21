"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useSeasonalTheme } from "@/components/ThemeProvider";
import { THEME_REGISTRY } from "@/lib/themes";

export function ThemeStatus() {
  const { theme: colourMode } = useTheme();
  const { seasonalTheme } = useSeasonalTheme();
  const seasonalName = THEME_REGISTRY[seasonalTheme]?.name ?? "Default";
  return (
    <span className="capitalize">
      {seasonalName}
      <span className="text-ink-400 dark:text-ink-500 text-xs ml-1.5">({colourMode})</span>
    </span>
  );
}
