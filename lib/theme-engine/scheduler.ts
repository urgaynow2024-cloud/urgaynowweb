/**
 * UGN Theme Engine — scheduler.
 *
 * Resolution priority, highest first:
 *
 *   1. Explicit administrator override  (and only while it has not expired)
 *   2. Active scheduled theme           (enabled, inside its window, lowest
 *                                        `priority` number wins)
 *   3. Default theme
 *
 * The fall-through is deliberate: an unknown, missing, disabled or expired
 * input can only ever reach `default`. There is no path by which a missing or
 * malformed configuration can promote an unexpected theme.
 */

export type ThemeMode = "manual" | "automatic";

export interface ThemeSchedule {
  id: string;
  themeId: string;
  /** ISO datetime. */
  start: string;
  /** ISO datetime. */
  end: string;
  enabled: boolean;
  /** Lower number = higher priority. */
  priority: number;
}

export interface ThemeConfig {
  mode: ThemeMode;
  /** The administrator's explicit choice, used when `mode` is `manual`. */
  manualThemeId: string | null;
  /** When the manual override stops applying. `null` = never expires. */
  overrideExpiresAt: string | null;
  schedules: ThemeSchedule[];
}

export interface ThemeResolution {
  themeId: string;
  /** Which rule produced this theme. Surfaced in the admin UI. */
  source: "override" | "schedule" | "default";
  /** The schedule that won, when `source === "schedule"`. */
  scheduleId: string | null;
  /**
   * True when the manual override is present but past its expiry. The admin UI
   * uses this to tell the operator their override lapsed, rather than silently
   * falling through.
   */
  overrideExpired: boolean;
}

export const DEFAULT_THEME_ID = "default";

/** `isThemeId` — guards every lookup so a typo can never become a theme id. */
export function isThemeId(id: string, registry: Readonly<Record<string, unknown>>): boolean {
  return Object.prototype.hasOwnProperty.call(registry, id);
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** True when the schedule is enabled and `now` falls inside `[start, end]`. */
export function isScheduleActive(schedule: ThemeSchedule, now: Date): boolean {
  if (!schedule.enabled) return false;
  const start = parseDate(schedule.start);
  const end = parseDate(schedule.end);
  if (start && start.getTime() > now.getTime()) return false;
  if (end && end.getTime() < now.getTime()) return false;
  return true;
}

/**
 * Resolves the active theme from configuration.
 *
 * `registry` is passed in rather than imported so this stays a pure function
 * that can be unit-tested without a database or a module cycle.
 */
export function resolveActiveTheme(
  config: ThemeConfig,
  registry: Readonly<Record<string, unknown>>,
  now: Date = new Date()
): ThemeResolution {
  const fallback = (overrideExpired = false): ThemeResolution => ({
    themeId: DEFAULT_THEME_ID,
    source: "default",
    scheduleId: null,
    overrideExpired,
  });

  const manualId = config.manualThemeId;
  const hasManual = typeof manualId === "string" && manualId !== "" && isThemeId(manualId, registry);

  // 1. Explicit administrator override.
  //
  // Applies in both `manual` and `automatic` mode: if an administrator has
  // deliberately pinned a theme, that decision outranks the schedule. The
  // expiry check is what stops a forgotten override from pinning the site
  // forever.
  if (hasManual) {
    const expiresAt = parseDate(config.overrideExpiresAt);
    if (!expiresAt || expiresAt.getTime() > now.getTime()) {
      return { themeId: manualId as string, source: "override", scheduleId: null, overrideExpired: false };
    }
  }

  const overrideExpired = hasManual;

  // 2. Active scheduled theme.
  //
  // Only consulted in `automatic` mode. In `manual` mode an absent or expired
  // override means the administrator asked for a specific theme and it is no
  // longer valid, so we fall through to Default rather than silently switching
  // the site to a seasonal theme.
  if (config.mode === "automatic") {
    const active = config.schedules
      .filter((schedule) => isScheduleActive(schedule, now) && isThemeId(schedule.themeId, registry))
      .sort((a, b) => a.priority - b.priority || parseDate(a.start)!.getTime() - parseDate(b.start)!.getTime());

    const winner = active[0];
    if (winner) {
      return { themeId: winner.themeId, source: "schedule", scheduleId: winner.id, overrideExpired };
    }
  }

  // 3. Default.
  return fallback(overrideExpired);
}
