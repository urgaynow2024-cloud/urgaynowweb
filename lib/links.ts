/**
 * Shared link-hub domain logic: category catalogue, URL validation/normalization,
 * and domain extraction. Pure (no server APIs) so it can be imported by both
 * server modules and client components (e.g. the admin form preview).
 */

export type LinkCategory =
  | "Community"
  | "VRChat"
  | "Socials"
  | "Support"
  | "Creators/Partners"
  | "Other";

export interface LinkCategoryDef {
  key: string;
  label: string;
}

/** Canonical link categories, in display order. */
export const LINK_CATEGORIES: LinkCategoryDef[] = [
  { key: "Community", label: "Community" },
  { key: "VRChat", label: "VRChat" },
  { key: "Socials", label: "Socials" },
  { key: "Support", label: "Support" },
  { key: "Creators/Partners", label: "Creators / Partners" },
  { key: "Other", label: "Other" },
];

export const DEFAULT_LINK_CATEGORY = "Other";

export const LINK_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  LINK_CATEGORIES.map((c) => [c.key, c.label]),
);

const PROTOCOL_RE = /^https?:\/\//i;

/** True when `value` parses to an absolute http(s) URL. */
export function isValidUrl(value: string): boolean {
  try {
    if (!PROTOCOL_RE.test(value)) return false;
    const url = new URL(value);
    return url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** Trim + ensure an absolute https URL, lowercasing the hostname. */
export function normalizeUrl(value: string): string {
  let v = value.trim();
  if (!v) return "";
  if (!PROTOCOL_RE.test(v)) v = `https://${v}`;
  try {
    const url = new URL(v);
    url.hostname = url.hostname.toLowerCase();
    return url.toString();
  } catch {
    return v;
  }
}

/** Hostname (without leading www) for a display "domain label". */
export function parseDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
