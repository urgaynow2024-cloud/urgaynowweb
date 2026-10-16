/**
 * Compatibility shim.
 *
 * The theme engine now lives in `lib/theme-engine/`. This module re-exports the
 * pieces the rest of the app still imports from `@/lib/themes`, so no consumer
 * has to change in the same commit that the engine landed.
 *
 * New code should import from `@/lib/theme-engine` directly.
 */

export {
  THEME_REGISTRY,
  THEME_ORDER,
  getThemeDefinition,
  getAllThemes,
} from "./theme-engine/registry";

export type { ThemeDefinition, DecorationSpec } from "./theme-engine/resolve";

export {
  resolveActiveTheme,
  isScheduleActive,
  isThemeId,
  DEFAULT_THEME_ID,
} from "./theme-engine/scheduler";

export type { ThemeConfig, ThemeResolution } from "./theme-engine/scheduler";

export { resolveTokens, normalizeTriplet } from "./theme-engine/resolve";
export { tokensToCssVars, tokensToCss } from "./theme-engine/css";
export { resolvePreviewThemeId, getDevThemePreview, selectThemeId, PREVIEW_COOKIE } from "./theme-engine/preview";
export { validateRegistry, assertValidRegistry } from "./theme-engine/validate";

/**
 * `ThemeSchedule` is unchanged between the old module and the engine, so this
 * is a straight re-export rather than a redefinition.
 */
export type { ThemeSchedule } from "./theme-engine/scheduler";

/**
 * Removed with the engine: the `--theme-*` custom-property block that the old
 * registry used was dead (11 of its 13 variables were read by nothing). Its
 * replacement is the token contract in `lib/theme-engine/tokens.ts`.
 */
export type ThemeMode = "manual" | "automatic";
