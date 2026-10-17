import { normalizeRoleKey } from "@/lib/roles";

/**
 * Server-side report permissions.
 *
 * Every report route and server action calls `can()` on the server. The UI uses
 * the same map to decide which controls to render, but hiding a button is never
 * treated as the authorisation mechanism.
 */
export const REPORT_PERMISSIONS = [
  "reports.view",
  "reports.assign",
  "reports.review",
  "reports.notes",
  "reports.evidence",
  "reports.escalate",
  "reports.resolve",
  "reports.dismiss",
  "reports.manage",
  "reports.webhookRetry",
] as const;

export type ReportPermission = (typeof REPORT_PERMISSIONS)[number];

export const ALL_REPORT_PERMISSIONS: ReportPermission[] = [...REPORT_PERMISSIONS];

const LEAD: ReportPermission[] = [...REPORT_PERMISSIONS];

/** Role key -> permissions. Role keys come from lib/roles.ts (normalizeRoleKey). */
export const REPORT_ROLE_PERMISSIONS: Record<string, ReportPermission[]> = {
  founder: LEAD,
  co_founder: LEAD,
  co_owner: LEAD,
  admin: LEAD,
  safeguarding: LEAD,
  moderator: LEAD,
  event_manager: LEAD,
  community_manager: LEAD,
};

/**
 * Permissions for a staff rank. Every staff rank gets owner-level (LEAD)
 * permissions, so no staff member is ever locked out of reports or
 * moderation actions.
 */
export function getReportPermissionsForRank(rank: string | null | undefined): ReportPermission[] {
  const key = normalizeRoleKey(rank);
  const mapped = REPORT_ROLE_PERMISSIONS[key];
  if (mapped) return mapped;
  return LEAD;
}

export function can(roleKey: string | null | undefined, permission: ReportPermission): boolean {
  return getReportPermissionsForRank(roleKey).includes(permission);
}

/** Human-readable explanation used in the staff UI and audit errors. */
export const REPORT_PERMISSION_LABELS: Record<ReportPermission, string> = {
  "reports.view": "View reports",
  "reports.assign": "Assign reports",
  "reports.review": "Review and change status",
  "reports.notes": "Add internal notes",
  "reports.evidence": "Open protected evidence",
  "reports.escalate": "Escalate reports",
  "reports.resolve": "Resolve reports",
  "reports.dismiss": "Dismiss reports",
  "reports.manage": "Full report management",
  "reports.webhookRetry": "Retry failed notifications",
};