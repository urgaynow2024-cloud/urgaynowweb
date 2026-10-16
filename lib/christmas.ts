/**
 * Christmas 2026 theme constants.
 *
 * Palette is fixed by the Christmas 2026 Preparation MMD and must stay in sync
 * with `app/globals.css` and the `christmas` entry in `lib/themes.ts`.
 *
 * Christmas is an always-dark winter-night theme: it keeps UGN purple and icy
 * blue as the important colours (so the site still feels like UGN) and uses
 * Christmas red / green / gold only as small atmospheric accents — never as the
 * dominant brand palette.
 *
 * This module only declares values. It is impossible to "enable" Christmas by
 * importing it — activation is still controlled entirely by the seasonal schedule
 * in `app/globals.css` / the database, which has no Christmas row in production.
 */

export const CHRISTMAS_THEME_ID = "christmas";

/** Official UGN Christmas 2026 palette (MMD). */
export const CHRISTMAS_PALETTE = {
  winterNight: "#0A0D18",
  deepBlue: "#111827",
  winterSlate: "#1E293B",
  deepPurple: "#312E81",
  ugnPurple: "#6D28D9",
  icyBlue: "#38BDF8",
  ice: "#E0F2FE",
  snow: "#F8FAFC",
  christmasRed: "#DC2626",
  christmasGreen: "#16A34A",
  warmLights: "#FACC15",
  frost: "#F0F9FF",
  mutedIcy: "#94A3B8",
  twilight: "#334158",
  cardWinter: "#142332",
} as const;

/**
 * Path to the supplied official UGN Christmas icon.
 *
 * The icon is used exactly as provided — never regenerated or redrawn. Drop the
 * asset at `public/brand/christmas-icon.png` (or point this variable at another
 * public path). If the asset is missing, `ChristmasIcon` renders a neutral
 * decorative placeholder instead of a broken image.
 */
export const CHRISTMAS_ICON_PATH =
  process.env.NEXT_PUBLIC_CHRISTMAS_ICON_PATH || "/brand/christmas-icon.png";

export const CHRISTMAS_SEASON = {
  name: "Christmas 2026",
  start: "2026-12-01T00:00:00.000Z",
  end: "2026-12-26T23:59:59.000Z",
  tagline: "Ur Gay Now, deck the halls.",
} as const;

/** True when the given date falls inside the Christmas season. */
export function isChristmasSeason(now: Date = new Date()): boolean {
  const time = now.getTime();
  return (
    time >= new Date(CHRISTMAS_SEASON.start).getTime() &&
    time <= new Date(CHRISTMAS_SEASON.end).getTime()
  );
}
