/**
 * Canonical staff & community badge registry.
 *
 * The visual badge layer (17-Staff-Badges-and-Roles) derives from this map.
 * Permissions are enforced independently server-side (see lib/auth.ts and
 * action handlers); this module is read-only decoration data.
 */

export type RoleDefinition = {
  key: string;
  label: string;
  tooltip: string;
  summaryCategory?: "leadership" | "moderation" | "event" | "community";
  /** Optional tone used by the RoleBadge component. */
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
};

/** Canonical staff ranks — must stay in sync with 10-Staff-Moderation-Dashboard. */
export const STAFF_ROLES: RoleDefinition[] = [
  {
    key: "founder",
    label: "Founder",
    tooltip: "Founder — sets platform direction and has unrestricted access.",
    summaryCategory: "leadership",
    tone: "danger",
  },
  {
    key: "co_founder",
    label: "Co-Founder",
    tooltip: "Co-Founder — co-leads the platform with the Founder.",
    summaryCategory: "leadership",
    tone: "danger",
  },
  {
    key: "co_owner",
    label: "Co-Owner",
    tooltip: "Co-Owner — shares ownership responsibilities.",
    summaryCategory: "leadership",
    tone: "danger",
  },
  {
    key: "safeguarding",
    label: "Safeguarding",
    tooltip: "Safeguarding — protects community wellbeing and handles safety concerns.",
    summaryCategory: "moderation",
    tone: "warning",
  },
  {
    key: "admin",
    label: "Admin",
    tooltip: "Admin — manages staff, settings, and oversees moderation.",
    summaryCategory: "moderation",
    tone: "warning",
  },
  {
    key: "moderator",
    label: "Moderator",
    tooltip: "Moderator — reviews reports, submissions, and takes moderation action.",
    summaryCategory: "moderation",
    tone: "warning",
  },
  // Additional staff roles (not part of the 6-rank directory hierarchy)
  {
    key: "event_manager",
    label: "Event Manager",
    tooltip: "Event Manager — creates, edits, and manages events.",
    summaryCategory: "event",
    tone: "brand",
  },
  {
    key: "community_manager",
    label: "Community Manager",
    tooltip: "Community Manager — manages announcements, polls, and community content.",
    summaryCategory: "community",
    tone: "brand",
  },
];

/** Community (non-staff) badges — signal contribution without implying moderation power. */
export const COMMUNITY_ROLES: RoleDefinition[] = [
  {
    key: "verified_creator",
    label: "Verified Creator",
    tooltip: "Verified Creator — community member whose work has been reviewed and featured.",
    tone: "success",
  },
  {
    key: "event_host",
    label: "Event Host",
    tooltip: "Event Host — regularly hosts community events.",
    tone: "brand",
  },
  {
    key: "contributor",
    label: "Contributor",
    tooltip: "Contributor — has published community submissions.",
    tone: "neutral",
  },
];

/** Combined lookup map keyed by canonical role key. */
export const ROLE_MAP: Record<string, RoleDefinition> = [
  ...STAFF_ROLES,
  ...COMMUNITY_ROLES,
].reduce((acc, def) => {
  acc[def.key] = def;
  return acc;
}, {} as Record<string, RoleDefinition>);

/** Legacy rank mappings for backward compatibility with existing database values. */
export const LEGACY_RANK_MAP: Record<string, string> = {
  "co~founder": "co_founder",
  "co~owner": "co_owner",
  "safe~guarding": "safeguarding",
  "moderator/media": "moderator",
  "moderator / media": "moderator",
  "owner": "co_owner",
  "co-founder": "co_founder",
  "co-owner": "co_owner",
  "safeguarding": "safeguarding",
  "admin": "admin",
  "moderator": "moderator",
  "founder": "founder",
  "event manager": "event_manager",
  "community manager": "community_manager",
};

/**
 * Normalize a raw `Staff.rank` string to a canonical role key.
 * Falls back to the raw value (lowercased) if no match is found, so unknown
 * ranks still render a badge instead of disappearing.
 */
export function normalizeRoleKey(rank: string | null | undefined): string {
  if (!rank) return "";
  const trimmed = rank.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();

  // Check legacy mappings first (handles tildes, slashes, case variations)
  if (LEGACY_RANK_MAP[lower]) {
    return LEGACY_RANK_MAP[lower];
  }

  // Direct match against canonical keys (case-insensitive).
  const direct = Object.keys(ROLE_MAP).find(
    (k) => k.toLowerCase() === lower,
  );
  if (direct) return direct;

  // Human-readable label match (e.g. "Co-Founder" -> co_founder).
  const byLabel = ROLE_MAP[
    Object.keys(ROLE_MAP).find(
      (k) => ROLE_MAP[k].label.toLowerCase() === lower,
    ) as string
  ];
  if (byLabel) return byLabel.key;

  // Fallback: slugify the raw value so unknown ranks still produce a stable key.
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Resolve a role key to its definition, falling back to a generic badge. */
export function getRoleDefinition(key: string): RoleDefinition {
  return (
    ROLE_MAP[key] ?? {
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      tooltip: key.replace(/_/g, " "),
      tone: "neutral",
    }
  );
}