import { prisma } from "./db";
import { resolveActiveTheme, type ThemeSchedule, type ThemeConfig as EngineThemeConfig, type ThemeResolution } from "./theme-engine/scheduler";
import { getDevThemePreview } from "./theme-engine/preview";
import { THEME_REGISTRY } from "./theme-engine/registry";

export interface ThemeConfig extends EngineThemeConfig {
  themeId: string;
}

const CACHE_KEY = "site-theme-config";
const CACHE_TTL = 60 * 1000; // 1 minute

let memoryCache: { config: ThemeConfig; expires: number } | null = null;

export async function getThemeConfig(): Promise<ThemeConfig> {
  const now = Date.now();
  if (memoryCache && memoryCache.expires > now) {
    return memoryCache.config;
  }

  // An explicit `select` — NOT `include`, which would return every column
  // including the not-yet-migrated `overrideExpiresAt` and throw. Keeping this
  // query pinned to the long-standing columns means it succeeds before and
  // after the migration.
  const siteTheme = await prisma.siteTheme.findFirst({
    select: {
      id: true,
      mode: true,
      manualThemeId: true,
      schedules: {
        select: {
          id: true,
          themeId: true,
          start: true,
          end: true,
          enabled: true,
          priority: true,
        },
      },
    },
  });

  const config: ThemeConfig = {
    themeId: "default",
    mode: (siteTheme?.mode?.toLowerCase() as "manual" | "automatic") ?? "manual",
    manualThemeId: siteTheme?.manualThemeId ?? null,
    overrideExpiresAt: siteTheme ? await readOverrideExpiry(siteTheme.id) : null,
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

/**
 * Reads `SiteTheme.overrideExpiresAt` defensively.
 *
 * The column is added by
 * `prisma/migrations/20261002160000_theme_engine_override_expiry`. Until that
 * migration is applied, selecting it makes the whole `siteTheme` query throw,
 * and because the layout resolves the theme through `safeQuery(..., "default")`
 * that would silently drop the live site from Halloween back to Default.
 *
 * Reading it separately, and treating any failure as "no expiry", means the code
 * is safe to deploy before the migration: the site renders the same theme it
 * did before, and override expiration simply stays inactive until the column
 * exists. A NULL here is exactly the pre-engine "never expires" behaviour.
 */
async function readOverrideExpiry(siteThemeId: string): Promise<string | null> {
  try {
    const row = await prisma.siteTheme.findUnique({
      where: { id: siteThemeId },
      select: { overrideExpiresAt: true },
    });
    return row?.overrideExpiresAt?.toISOString() ?? null;
  } catch {
    return null;
  }
}

export function invalidateThemeCache() {
  memoryCache = null;
}

/**
 * Development-only theme override (e.g. `UGN_THEME_PREVIEW=christmas`).
 *
 * Thin re-export of the engine rule, kept here because the layout and admin
 * surfaces already import it from this module. See
 * `lib/theme-engine/preview.ts` for the contract — the short version is that
 * it returns `null` in production before reading anything else, so it can never
 * promote a theme on the live site.
 */
export function getThemePreviewOverride(): string | null {
  return getDevThemePreview();
}

/** Full resolution detail: which rule won, and whether an override lapsed. */
export async function getThemeResolution(): Promise<ThemeResolution> {
  const config = await getThemeConfig();
  return resolveActiveTheme(config, THEME_REGISTRY);
}

export async function getActiveThemeId(): Promise<string> {
  const preview = getDevThemePreview();
  if (preview) return preview;

  const config = await getThemeConfig();
  return resolveActiveTheme(config, THEME_REGISTRY).themeId;
}

/**
 * Removed with the theme engine: `getActiveThemeCSSVariables()`.
 *
 * It was never called, and it emitted the old `--theme-*` variables, 11 of
 * which 13 were read by nothing. Its replacement is `tokensToCss()` in
 * `lib/theme-engine/css.ts`, which is applied server-side in `app/layout.tsx`
 * so the active theme is correct on the first painted frame.
 */