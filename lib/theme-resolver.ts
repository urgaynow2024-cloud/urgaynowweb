import { prisma } from "./db";
import { resolveActiveTheme, type ThemeSchedule } from "./themes";

export interface ThemeConfig {
  themeId: string;
  mode: "manual" | "automatic";
  manualThemeId: string | null;
  schedules: ThemeSchedule[];
}

const CACHE_KEY = "site-theme-config";
const CACHE_TTL = 60 * 1000; // 1 minute

let memoryCache: { config: ThemeConfig; expires: number } | null = null;

export async function getThemeConfig(): Promise<ThemeConfig> {
  const now = Date.now();
  if (memoryCache && memoryCache.expires > now) {
    return memoryCache.config;
  }

  const siteTheme = await prisma.siteTheme.findFirst({
    include: { schedules: true },
  });

  const config: ThemeConfig = {
    themeId: "default",
    mode: (siteTheme?.mode?.toLowerCase() as "manual" | "automatic") ?? "manual",
    manualThemeId: siteTheme?.manualThemeId ?? null,
    schedules: (siteTheme?.schedules ?? []).map((s) => ({
      id: s.id,
      themeId: s.themeId,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      enabled: s.enabled,
      priority: s.priority,
    })),
  };

  memoryCache = { config, expires: now + CACHE_TTL };
  return config;
}

export function invalidateThemeCache() {
  memoryCache = null;
}

export async function getActiveThemeId(): Promise<string> {
  const config = await getThemeConfig();
  return resolveActiveTheme(config.mode, config.manualThemeId, config.schedules);
}

export async function getActiveThemeCSSVariables(): Promise<Record<string, string>> {
  const themeId = await getActiveThemeId();
  const { THEME_REGISTRY } = await import("./themes");
  const theme = THEME_REGISTRY[themeId] ?? THEME_REGISTRY.default;

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const vars = { ...theme.variables, ...(isDark ? theme.dark : theme.light) };

  const cssVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    cssVars[`--theme-${key}`] = value;
  }

  return cssVars;
}