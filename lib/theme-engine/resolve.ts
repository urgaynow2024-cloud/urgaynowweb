import {
  BRAND_STEPS,
  INK_STEPS,
  SURFACE_STEPS,
  DEFAULT_TOKENS,
  type InkStep,
  type BrandStep,
  type Rgb,
  type SurfaceStep,
  type ThemeTokens,
  type ThemeVisual,
} from "./tokens";

/**
 * A theme definition as authored. Every field except `id`/`name` is optional:
 * anything omitted is inherited from `DEFAULT_TOKENS`.
 *
 * This is what makes "themes inherit from the Default UGN design system when an
 * override is not provided" a structural guarantee rather than a convention —
 * you physically cannot express a theme that is missing a token.
 */
export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  /** Emoji / glyph used in the admin picker and as the seasonal mark. */
  icon: string;
  /** CSS gradient shown on the admin theme card. */
  previewGradient: string;

  /** Optional partial overrides, all deep-merged onto `DEFAULT_TOKENS`. */
  extends?: string;
  scheme?: ThemeVisual["scheme"];
  /**
   * `DEFAULT` is accepted for readability; the engine maps it onto `brand[700]`
   * (the value Tailwind's `brand.DEFAULT` and `--brand-rgb` resolve through).
   */
  brand?: AuthoredBrandScale;
  surface?: Partial<Record<SurfaceStep, string>>;
  ink?: Partial<Record<InkStep, string>>;
  visual?: DeepPartial<ThemeVisual>;
  accents?: Partial<ThemeTokens["accents"]>;
  fontSans?: string;

  /** Optional seasonal assets. Absence is fine — the engine falls back. */
  assets?: {
    /** Logo mark used in the header logo slot (replaces, never joins, the UGN logo). */
    logo?: string;
    /** Small seasonal icon for banners, footers and event badges. */
    icon?: string;
  };

  /**
   * Optional seasonal content. Rendered by the single shared
   * `<SeasonalContent />` component; themes that define none render nothing.
   */
  content?: {
    banner?: { label: string; text: string; reportLink?: boolean };
    heroStrip?: { text: string };
  };

  /**
   * Data-driven description of the atmosphere layer. The single shared
   * `<SeasonalDecorations />` component renders this; there is no per-theme
   * decoration component and no per-theme decoration CSS.
   */
  decorations?: DecorationSpec;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * The brand scale as authored by a theme.
 *
 * `DEFAULT` is accepted for readability; the engine maps it onto `brand[700]`,
 * which is the value Tailwind's `brand.DEFAULT` and `--brand-rgb` resolve
 * through, so it is not a separate slot at runtime.
 */
export type AuthoredBrandScale = Partial<Record<BrandStep | "DEFAULT", string>>;

/**
 * Declarative atmosphere description. Every field is optional, so a theme can
 * contribute a single snow layer and nothing else and still be valid.
 */
export interface DecorationSpec {
  /** Backdrop layers painted with `body::before` / `body::after`. */
  backdrop?: {
    stars?: boolean;
    aurora?: boolean;
    moon?: { size?: string; top?: string; right?: string } | null;
  };
  /** Drifting particles. `kind` selects the glyph, `count` the quantity. */
  particles?: Array<{
    kind: "snow" | "ember" | "petal" | "leaf" | "sparkle" | "confetti" | "bubble" | "star" | "heart";
    count?: number;
    color?: string;
    /** Fall duration in seconds. */
    duration?: number;
  }>;
  /** Corner/edge flourishes drawn with inline SVG. */
  motifs?: Array<{
    kind: "web" | "snowbank" | "confetti-fall" | "heart" | "wave" | "frost";
    color?: string;
    opacity?: number;
  }>;
  /** A string of lights strung across the top of the page. */
  lights?: { count?: number; color?: string };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const HEX_SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_LONG = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const TRIPLET = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/;

/**
 * Normalises any authored colour into the `"R G B"` triplet form that the
 * Tailwind scales require.
 *
 * Themes are authored in hex because that is how designers and the rest of the
 * codebase write colours, and hex is far easier to review. The conversion to a
 * triplet happens here, once, at the engine boundary — so an author cannot
 * introduce a broken scale by forgetting the format.
 *
 * Returns `null` for an unparseable value so the caller can surface a
 * validation issue rather than silently emitting a colour that will be ignored
 * by the browser.
 */
export function normalizeTriplet(value: string): Rgb | null {
  const trimmed = value.trim();

  const triplet = TRIPLET.exec(trimmed);
  if (triplet) {
    const parts = [triplet[1], triplet[2], triplet[3]].map((part) => Number(part));
    if (parts.every((part) => part >= 0 && part <= 255)) return parts.join(" ");
    return null;
  }

  const long = HEX_LONG.exec(trimmed);
  if (long) {
    return [long[1], long[2], long[3]].map((pair) => parseInt(pair, 16)).join(" ");
  }

  const short = HEX_SHORT.exec(trimmed);
  if (short) {
    return [short[1], short[2], short[3]].map((digit) => parseInt(digit + digit, 16)).join(" ");
  }

  return null;
}

/**
 * Deep-merges a partial onto a base object. Arrays are replaced wholesale, not
 * concatenated — a theme replacing a particle list means "use these", not
 * "add these".
 */
function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (patch === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch as T;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] = isPlainObject(current) && isPlainObject(value) ? deepMerge(current, value) : value;
  }
  return result as T;
}

/**
 * Expands a theme definition into a complete token set by layering it over
 * `DEFAULT_TOKENS`.
 *
 * This is the single place where "inherit from Default" happens. The result is
 * always complete: no consumer downstream ever has to handle a missing token.
 */
export function resolveTokens(definition: ThemeDefinition | undefined): ThemeTokens {
  if (!definition) return DEFAULT_TOKENS;

  const brand = { ...DEFAULT_TOKENS.brand } as Record<BrandStep, Rgb>;
  // `DEFAULT` is a separate slot from `700`: the legacy Halloween palette has
  // `--brand-rgb: 109 40 217` and `--brand-700-rgb: 112 44 222`, so aliasing
  // them would have changed the CTA colour.
  let brandDefault = DEFAULT_TOKENS.brandDefault;
  if (definition.brand?.DEFAULT !== undefined) {
    const normalized = normalizeTriplet(definition.brand.DEFAULT);
    if (normalized) brandDefault = normalized;
  }
  for (const step of BRAND_STEPS) {
    const authored = definition.brand?.[step];
    if (authored === undefined) continue;
    const normalized = normalizeTriplet(authored);
    // An unparseable value is left as Default rather than propagated: the
    // registry validator reports it loudly, and the site still renders.
    if (normalized) brand[step] = normalized;
  }

  const surface = { ...DEFAULT_TOKENS.surface } as Record<SurfaceStep, Rgb>;
  for (const step of SURFACE_STEPS) {
    const authored = definition.surface?.[step];
    if (authored === undefined) continue;
    const normalized = normalizeTriplet(authored);
    if (normalized) surface[step] = normalized;
  }

  const ink = { ...DEFAULT_TOKENS.ink } as Record<InkStep, Rgb>;
  for (const step of INK_STEPS) {
    const authored = definition.ink?.[step];
    if (authored === undefined) continue;
    const normalized = normalizeTriplet(authored);
    if (normalized) ink[step] = normalized;
  }

  const visual = deepMerge(DEFAULT_TOKENS.visual, definition.visual);
  if (definition.scheme) visual.scheme = definition.scheme;

  return {
    brand,
    brandDefault,
    surface,
    ink,
    visual,
    accents: { ...DEFAULT_TOKENS.accents, ...(definition.accents ?? {}) },
    fontSans: definition.fontSans ?? DEFAULT_TOKENS.fontSans,
  };
}
