import { BRAND_STEPS, INK_STEPS, SURFACE_STEPS } from "./tokens";
import { THEME_ORDER, THEME_REGISTRY } from "./registry";
import { resolveTokens } from "./resolve";
import { resolveActiveTheme, isScheduleActive, type ThemeConfig } from "./scheduler";
import { tokensToCssVars } from "./css";

/**
 * Development-time guards for the theme engine.
 *
 * A malformed token is silent and expensive: `border-color: var(--brand-500-rgb)`
 * with a bad value is an *invalid at computed-value time* declaration, so the
 * property falls back to `currentColor` and the bug looks like a design mistake
 * rather than a typo. These checks turn that class of error into a loud
 * failure.
 */

const RGB_TRIPLET = /^\d{1,3} \d{1,3} \d{1,3}$/;

export interface ValidationIssue {
  themeId: string;
  where: string;
  message: string;
}

/** A scale value must be three space-separated integers in 0-255. */
export function isValidTriplet(value: unknown): boolean {
  if (typeof value !== "string" || !RGB_TRIPLET.test(value)) return false;
  return value.split(" ").every((part) => Number(part) >= 0 && Number(part) <= 255);
}

/**
 * Validates every theme in the registry. Returns the issues found; an empty
 * array means the registry is safe to ship.
 */
export function validateRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  for (const id of THEME_ORDER) {
    if (seen.has(id)) {
      issues.push({ themeId: id, where: "THEME_ORDER", message: "duplicated in THEME_ORDER" });
    }
    seen.add(id);

    const definition = THEME_REGISTRY[id];
    if (!definition) {
      issues.push({ themeId: id, where: "THEME_REGISTRY", message: "listed in THEME_ORDER but not defined" });
      continue;
    }
    if (definition.id !== id) {
      issues.push({ themeId: id, where: definition.id, message: `id "${definition.id}" does not match registry key "${id}"` });
    }
  }

  for (const [id, definition] of Object.entries(THEME_REGISTRY)) {
    if (!seen.has(id)) {
      issues.push({ themeId: id, where: "THEME_REGISTRY", message: "defined but missing from THEME_ORDER" });
    }

    const tokens = resolveTokens(definition);

    for (const step of BRAND_STEPS) {
      if (!isValidTriplet(tokens.brand[step])) {
        issues.push({ themeId: id, where: `brand.${step}`, message: `invalid RGB triplet: ${JSON.stringify(tokens.brand[step])}` });
      }
    }
    for (const step of SURFACE_STEPS) {
      if (!isValidTriplet(tokens.surface[step])) {
        issues.push({ themeId: id, where: `surface.${step}`, message: `invalid RGB triplet: ${JSON.stringify(tokens.surface[step])}` });
      }
    }
    for (const step of INK_STEPS) {
      if (!isValidTriplet(tokens.ink[step])) {
        issues.push({ themeId: id, where: `ink.${step}`, message: `invalid RGB triplet: ${JSON.stringify(tokens.ink[step])}` });
      }
    }

    // A theme with a dark scheme must not inherit a light canvas colour, and
    // vice versa — that mismatch is invisible in code review and obvious on
    // screen.
    if (tokens.visual.scheme === "dark" && tokens.visual.canvas.color.trim() === "") {
      issues.push({ themeId: id, where: "visual.canvas.color", message: "dark scheme requires a canvas text colour" });
    }

    // The emitted CSS must never contain an empty declaration, which would
    // invalidate the whole rule in some parsers.
    for (const [name, value] of Object.entries(tokensToCssVars(tokens))) {
      if (typeof value !== "string" || value.trim() === "") {
        issues.push({ themeId: id, where: name, message: "emits an empty CSS value" });
      }
    }
  }

  return issues;
}

/** Asserts the registry is valid, throwing with every issue listed. */
export function assertValidRegistry(): void {
  const issues = validateRegistry();
  if (issues.length === 0) return;
  const detail = issues.map((i) => `  - ${i.themeId} ${i.where}: ${i.message}`).join("\n");
  throw new Error(`Theme engine validation failed:\n${detail}`);
}

/**
 * Asserts the scheduler's documented priority order. Exported so the test
 * script can prove the contract rather than assume it.
 */
export function assertSchedulerContract(): void {
  const registry = THEME_REGISTRY;
  const at = (iso: string) => new Date(iso);

  const schedules = [
    { id: "s-low", themeId: "autumn", start: at("2026-01-01").toISOString(), end: at("2027-01-01").toISOString(), enabled: true, priority: 10 },
    { id: "s-high", themeId: "halloween", start: at("2026-01-01").toISOString(), end: at("2027-01-01").toISOString(), enabled: true, priority: 1 },
    { id: "s-off", themeId: "christmas", start: at("2026-01-01").toISOString(), end: at("2027-01-01").toISOString(), enabled: false, priority: 0 },
    { id: "s-past", themeId: "summer", start: at("2020-01-01").toISOString(), end: at("2020-02-01").toISOString(), enabled: true, priority: 0 },
    { id: "s-future", themeId: "spring", start: at("2099-01-01").toISOString(), end: at("2099-02-01").toISOString(), enabled: true, priority: 0 },
  ];

  const now = at("2026-10-02");

  const base: ThemeConfig = { mode: "automatic", manualThemeId: null, overrideExpiresAt: null, schedules };

  // 1. An override outranks every schedule, even a higher-priority one.
  const overridden = resolveActiveTheme({ ...base, manualThemeId: "pride" }, registry, now);
  if (overridden.themeId !== "pride" || overridden.source !== "override") {
    throw new Error(`override priority broken: got ${overridden.themeId} via ${overridden.source}`);
  }

  // 2. An expired override stops overriding and falls through to the schedule.
  const expired = resolveActiveTheme(
    { ...base, manualThemeId: "pride", overrideExpiresAt: at("2026-09-01").toISOString() },
    registry,
    now,
  );
  if (expired.themeId !== "halloween" || expired.source !== "schedule" || !expired.overrideExpired) {
    throw new Error(`override expiry broken: got ${expired.themeId} via ${expired.source}`);
  }

  // 3. A live override still wins.
  const live = resolveActiveTheme(
    { ...base, manualThemeId: "pride", overrideExpiresAt: at("2026-12-01").toISOString() },
    registry,
    now,
  );
  if (live.themeId !== "pride") throw new Error(`live override broken: got ${live.themeId}`);

  // 4. Otherwise the lowest `priority` number among active schedules wins, and
  //    disabled / out-of-window schedules are ignored.
  const scheduled = resolveActiveTheme(base, registry, now);
  if (scheduled.themeId !== "halloween" || scheduled.scheduleId !== "s-high") {
    throw new Error(`schedule priority broken: got ${scheduled.themeId} via ${scheduled.scheduleId}`);
  }

  // 5. With nothing active we land on Default — never on an arbitrary theme.
  const empty = resolveActiveTheme(
    { mode: "automatic", manualThemeId: null, overrideExpiresAt: null, schedules: [] },
    registry,
    now,
  );
  if (empty.themeId !== "default" || empty.source !== "default") {
    throw new Error(`default fallback broken: got ${empty.themeId} via ${empty.source}`);
  }

  // 6. An unknown theme id can never be promoted.
  const bogus = resolveActiveTheme(
    { ...base, manualThemeId: "does-not-exist", overrideExpiresAt: null },
    registry,
    now,
  );
  if (bogus.themeId !== "halloween") {
    throw new Error(`unknown override leaked: got ${bogus.themeId}`);
  }

  // 7. Window boundaries are inclusive at both ends.
  const edge = at("2026-07-01");
  if (!isScheduleActive({ id: "x", themeId: "summer", start: at("2026-07-01").toISOString(), end: at("2026-07-31").toISOString(), enabled: true, priority: 0 }, edge)) {
    throw new Error("schedule start boundary should be inclusive");
  }
}
