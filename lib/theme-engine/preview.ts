import { THEME_REGISTRY } from "./registry";
import { DEFAULT_THEME_ID } from "./scheduler";

/**
 * UGN Theme Engine — preview isolation.
 *
 * Preview and the public active theme are two different things and this module
 * keeps them apart:
 *
 *   - `resolvePreviewThemeId()` answers "what should the ADMIN be looking at?"
 *     It is scoped to that one browser session and can never influence what a
 *     visitor sees, because a preview is carried in an HTTP-only cookie rather
 *     than in the site-wide configuration.
 *   - The public active theme is resolved by `resolveActiveTheme()` from the
 *     database and is never influenced by anything in this file.
 *
 * The two hard guarantees:
 *   1. There is no public/visitor-facing switch. A preview requires an
 *      authenticated staff session AND a per-browser cookie; a member of the
 *      public cannot set one, and if they somehow did, it would only change
 *      their own view.
 *   2. A missing or unrecognised value resolves to `default`, never to a
 *      seasonal theme.
 */

export const PREVIEW_COOKIE = "ugn-theme-preview";

function isValidThemeId(value: string | null | undefined): value is string {
  return typeof value === "string" && value !== "" && Object.prototype.hasOwnProperty.call(THEME_REGISTRY, value);
}

/**
 * Resolves a preview theme id from a raw cookie value.
 *
 * Returns `null` when there is no valid preview, which the caller must treat as
 * "render the public active theme".
 */
export function resolvePreviewThemeId(raw: string | null | undefined): string | null {
  return isValidThemeId(raw) ? raw : null;
}

/**
 * Development-only theme override (`UGN_THEME_PREVIEW`).
 *
 * This is a convenience for working on the theme engine locally; it never
 * touches the database and never writes a schedule. It is compiled out of
 * production: the `NODE_ENV` check runs before the variable is read, so
 * `undefined -> christmas` is not a possible production fallback even if the
 * variable is present in the environment.
 *
 * This is NOT the admin preview. For previewing a theme across the real
 * website, use the cookie-based admin preview above.
 */
export function getDevThemePreview(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  return resolvePreviewThemeId(process.env.UGN_THEME_PREVIEW);
}

/**
 * Combines the public active theme with an optional admin preview.
 *
 * `preview` always wins for the current viewer only. When it is `null` — the
 * case for every visitor, and for an admin who is not previewing — the public
 * active theme is returned untouched.
 */
export function selectThemeId(publicThemeId: string, preview: string | null | undefined): string {
  if (isValidThemeId(preview)) return preview;
  return isValidThemeId(publicThemeId) ? publicThemeId : DEFAULT_THEME_ID;
}
