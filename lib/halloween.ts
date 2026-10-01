/**
 * Halloween 2026 theme constants.
 *
 * Palette is fixed by the MMD ("Ur Gay Now, but it's Halloween") and must stay
 * in sync with `app/globals.css` and the `halloween` entry in `lib/themes.ts`.
 */

export const HALLOWEEN_THEME_ID = "halloween";

/** Official UGN Halloween palette (MMD). */
export const HALLOWEEN_PALETTE = {
  nearBlack: "#0D0A12",
  charcoal: "#15111C",
  darkPurple: "#1A1026",
  deepPurple: "#2A123D",
  ugnPurple: "#6D28D9",
  darkRed: "#8F1D2C",
  halloweenRed: "#B42335",
  warmOrange: "#F97316",
  pumpkinOrange: "#FF8A1F",
  ghostWhite: "#F5F1F7",
  mutedGrey: "#A8A0AD",
} as const;

/**
 * Path to the supplied official UGN Halloween icon.
 *
 * The icon is used exactly as provided — never regenerated or redrawn. Drop the
 * asset at `public/brand/halloween-icon.png` (or point this variable at another
 * public path). If the asset is missing, `HalloweenIcon` renders a neutral
 * decorative placeholder instead of a broken image.
 */
export const HALLOWEEN_ICON_PATH =
  process.env.NEXT_PUBLIC_HALLOWEEN_ICON_PATH || "/brand/halloween-icon.png";

export const HALLOWEEN_SEASON = {
  name: "Halloween 2026",
  start: "2026-10-01T00:00:00.000Z",
  end: "2026-11-02T23:59:59.000Z",
  tagline: "Ur Gay Now, but it's Halloween.",
} as const;

/** True when the given date falls inside the Halloween season. */
export function isHalloweenSeason(now: Date = new Date()): boolean {
  const time = now.getTime();
  return (
    time >= new Date(HALLOWEEN_SEASON.start).getTime() &&
    time <= new Date(HALLOWEEN_SEASON.end).getTime()
  );
}