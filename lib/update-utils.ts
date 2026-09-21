const TYPE_LABELS: Record<string, string> = {
  MAJOR: "Major",
  MINOR: "Minor",
  PATCH: "Patch",
};

export function getUpdateTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

/** Canonical changelog categories (see UrGayNow_Updates_and_Staff_Improvements.md §3). */
export const UPDATE_CATEGORIES = [
  { key: "NEW", label: "New" },
  { key: "IMPROVEMENT", label: "Improvement" },
  { key: "FIX", label: "Fix" },
  { key: "SECURITY", label: "Security" },
  { key: "PERFORMANCE", label: "Performance" },
  { key: "MAINTENANCE", label: "Maintenance" },
  { key: "COMMUNITY", label: "Community" },
  { key: "MODERATION", label: "Moderation" },
  { key: "SUPPORT", label: "Support" },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  UPDATE_CATEGORIES.map((c) => [c.key, c.label]),
);

/**
 * Role-specific tone used by the public category badge. Colours are a
 * secondary cue — the label text is always rendered, so colour alone is never
 * required to identify a category. Tones are restricted to the shared palette
 * (neutral/brand/success/warning/danger) so they work across both the public
 * and admin Badge components.
 */
export const CATEGORY_TONES: Record<string, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  NEW: "brand",
  IMPROVEMENT: "success",
  FIX: "neutral",
  SECURITY: "danger",
  PERFORMANCE: "brand",
  MAINTENANCE: "neutral",
  COMMUNITY: "brand",
  MODERATION: "warning",
  SUPPORT: "brand",
};

export function getUpdateCategoryLabel(category: string | undefined | null): string {
  if (!category) return "General";
  return CATEGORY_LABELS[category] ?? category;
}

export function getUpdateCategoryTone(
  category: string | undefined | null,
): "neutral" | "brand" | "success" | "warning" | "danger" {
  if (!category) return "neutral";
  return CATEGORY_TONES[category] ?? "neutral";
}

/** Normalise a user-supplied category string to a canonical key. */
export function normalizeUpdateCategory(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim().toUpperCase();
  if (UPDATE_CATEGORIES.some((c) => c.key === trimmed)) return trimmed;
  const byLabel = UPDATE_CATEGORIES.find(
    (c) => c.label.toUpperCase() === trimmed.replace(/[ _-]+/g, " "),
  );
  return byLabel?.key ?? trimmed.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/** Suggest a sensible default changelog category for a given release type. */
export function suggestCategory(type: "MAJOR" | "MINOR" | "PATCH"): string {
  if (type === "MAJOR") return "NEW";
  if (type === "MINOR") return "IMPROVEMENT";
  return "FIX";
}
