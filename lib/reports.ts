export type ReportContentType =
  | "COMMUNITY_PHOTO"
  | "GALLERY_IMAGE"
  | "GROUP_PHOTO"
  | "EVENT"
  | "STAFF_PROFILE"
  | "SHOP_DESIGN"
  | "COMMUNITY_SUBMISSION"
  | "ANNOUNCEMENT"
  | "COMMUNITY_REVIEW";

export type ReportCategory =
  // Canonical categories (MMD 2026)
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "SEXUAL_MISCONDUCT"
  | "SAFEGUARDING"
  | "THREATS"
  | "SPAM_RAID"
  | "SCAM_FRAUD"
  | "INAPPROPRIATE_CONTENT"
  | "STAFF_MISCONDUCT"
  | "RULE_VIOLATION"
  | "OTHER"
  // Legacy values kept so existing reports and old report forms keep working
  | "SEXUAL_CONTENT"
  | "NSFW"
  | "VIOLENCE"
  | "SCAM"
  | "SPAM"
  | "COPYRIGHT"
  | "IMPERSONATION"
  | "PERSONAL_INFO"
  | "WEBSITE_BUG"
  | "EVENT_ISSUE"
  | "COMMUNITY_CONTENT";

export type ReportStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "WAITING_INFO"
  | "ACTION_TAKEN"
  | "RESOLVED"
  | "DISMISSED"
  | "ESCALATED";

export type ReportPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ReportSource = "COMMUNITY" | "CONTENT";

export type ReportWebhookStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export const REPORT_CONTENT_TYPES: Record<
  ReportContentType,
  { label: string; description: string }
> = {
  COMMUNITY_PHOTO: { label: "Community photo", description: "A photo submitted by a community member" },
  GALLERY_IMAGE: { label: "Gallery image", description: "An image in the public gallery" },
  GROUP_PHOTO: { label: "Group photo", description: "A group photo collection" },
  EVENT: { label: "Event", description: "An event listing" },
  STAFF_PROFILE: { label: "Staff profile", description: "A staff team member's profile" },
  SHOP_DESIGN: { label: "Shop design", description: "A community design in the shop showcase" },
  COMMUNITY_SUBMISSION: { label: "Community submission", description: "A pending community submission" },
  ANNOUNCEMENT: { label: "Announcement", description: "A news announcement" },
  COMMUNITY_REVIEW: { label: "Community review", description: "A public community review" },
};

/**
 * Canonical report categories. Order matches the MMD list and is the order used
 * by the public report form.
 */
export const REPORT_CATEGORIES: {
  value: ReportCategory;
  label: string;
  description: string;
  /** Categories that apply to a specific piece of website content. */
  content: boolean;
  /** Suggested starting priority. */
  priority: ReportPriority;
}[] = [
  {
    value: "HARASSMENT",
    label: "Harassment",
    description: "Targeted bullying, intimidation, or repeated unwanted contact",
    content: true,
    priority: "HIGH",
  },
  {
    value: "HATE_SPEECH",
    label: "Hate Speech / Discrimination",
    description: "Hate speech or discrimination targeting a protected characteristic",
    content: true,
    priority: "HIGH",
  },
  {
    value: "SEXUAL_MISCONDUCT",
    label: "Sexual Misconduct",
    description: "Sexual harassment, unwanted sexual attention, or related misconduct",
    content: true,
    priority: "URGENT",
  },
  {
    value: "SAFEGUARDING",
    label: "Safeguarding Concern",
    description: "A concern about a child's safety or another safeguarding matter",
    content: true,
    priority: "URGENT",
  },
  {
    value: "THREATS",
    label: "Threats",
    description: "Threats of violence, self-harm, or harm to others",
    content: true,
    priority: "URGENT",
  },
  {
    value: "SPAM_RAID",
    label: "Spam / Raid",
    description: "Spam, advertising, or a raid/brigading of our community spaces",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "SCAM_FRAUD",
    label: "Scam / Fraud",
    description: "Scams, phishing, fraud, or requests for money or account access",
    content: true,
    priority: "HIGH",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    label: "Inappropriate Content",
    description: "Sexual, violent, or otherwise inappropriate content or behaviour",
    content: true,
    priority: "HIGH",
  },
  {
    value: "STAFF_MISCONDUCT",
    label: "Staff Misconduct",
    description: "Misconduct by a UGN staff member, volunteer, or host",
    content: false,
    priority: "HIGH",
  },
  {
    value: "RULE_VIOLATION",
    label: "Rule Violation",
    description: "A breach of the UGN community rules",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Something else — please describe it in the details",
    content: true,
    priority: "NORMAL",
  },
];

/**
 * Legacy categories that older reports (and the community submission report
 * modal) still use. They remain valid input, but new reports use the canonical
 * categories above.
 */
export const LEGACY_REPORT_CATEGORIES: {
  value: ReportCategory;
  label: string;
  description: string;
  content: boolean;
  priority: ReportPriority;
}[] = [
  {
    value: "SEXUAL_CONTENT",
    label: "Sexual content",
    description: "Sexually explicit or suggestive material (legacy category)",
    content: true,
    priority: "HIGH",
  },
  {
    value: "NSFW",
    label: "NSFW content",
    description: "Not safe for work (legacy category)",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "VIOLENCE",
    label: "Violence or gore",
    description: "Graphic violence (legacy category)",
    content: true,
    priority: "HIGH",
  },
  {
    value: "SCAM",
    label: "Scam / Fraud",
    description: "Scams or fraud (legacy category)",
    content: true,
    priority: "HIGH",
  },
  {
    value: "SPAM",
    label: "Spam",
    description: "Spam content (legacy category)",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "COPYRIGHT",
    label: "Copyright / ownership issue",
    description: "Copyright infringement or stolen content (legacy category)",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "IMPERSONATION",
    label: "Impersonation",
    description: "Impersonating another person (legacy category)",
    content: true,
    priority: "HIGH",
  },
  {
    value: "PERSONAL_INFO",
    label: "Personal information",
    description: "Sharing private personal information (legacy category)",
    content: true,
    priority: "HIGH",
  },
  {
    value: "WEBSITE_BUG",
    label: "Website bug",
    description: "Something on the website is broken",
    content: true,
    priority: "LOW",
  },
  {
    value: "EVENT_ISSUE",
    label: "Event issue",
    description: "A problem with an event listing",
    content: true,
    priority: "NORMAL",
  },
  {
    value: "COMMUNITY_CONTENT",
    label: "Community content",
    description: "A problem with community submitted content",
    content: true,
    priority: "NORMAL",
  },
];

const ALL_CATEGORIES = [...REPORT_CATEGORIES, ...LEGACY_REPORT_CATEGORIES];

/** Categories offered when reporting a specific piece of website content. */
export const CONTENT_REPORT_CATEGORIES = ALL_CATEGORIES.filter((c) => c.content);

/** Back-compat alias used by existing imports. */
export const REPORT_REASONS = REPORT_CATEGORIES;

export const REPORT_STATUSES: Record<
  ReportStatus,
  { label: string; tone: "neutral" | "brand" | "success" | "warning" | "danger"; open: boolean }
> = {
  OPEN: { label: "New", tone: "brand", open: true },
  IN_REVIEW: { label: "Reviewing", tone: "warning", open: true },
  WAITING_INFO: { label: "Waiting for Information", tone: "warning", open: true },
  ACTION_TAKEN: { label: "Action Taken", tone: "success", open: false },
  RESOLVED: { label: "Resolved", tone: "success", open: false },
  DISMISSED: { label: "Dismissed", tone: "neutral", open: false },
  ESCALATED: { label: "Escalated", tone: "danger", open: true },
};

export const REPORT_PRIORITIES: Record<
  ReportPriority,
  { label: string; tone: "neutral" | "brand" | "success" | "warning" | "danger" }
> = {
  LOW: { label: "Low", tone: "neutral" },
  NORMAL: { label: "Normal", tone: "brand" },
  HIGH: { label: "High", tone: "warning" },
  URGENT: { label: "Urgent", tone: "danger" },
};

export const REPORT_WEBHOOK_STATUSES: Record<
  ReportWebhookStatus,
  { label: string; tone: "neutral" | "brand" | "success" | "warning" | "danger" }
> = {
  PENDING: { label: "Not sent", tone: "warning" },
  SENT: { label: "Sent", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  SKIPPED: { label: "No webhook configured", tone: "neutral" },
};

/* -------------------------------------------------------------------------- */
/* Limits                                                                     */
/* -------------------------------------------------------------------------- */

export const REPORT_LIMITS = {
  CATEGORY_MAX: 2000,
  DESCRIPTION_MAX: 4000,
  DESCRIPTION_MIN: 20,
  REPORTER_NAME_MAX: 80,
  REPORTER_EMAIL_MAX: 200,
  REPORTED_PERSON_MAX: 120,
  REPORTED_DISCORD_MAX: 120,
  LINK_MAX: 500,
  LINKS_MAX_COUNT: 6,
  LINKS_MAX_TOTAL: 1500,
  EVIDENCE_MAX_FILES: 4,
  EVIDENCE_MAX_BYTES: 4 * 1024 * 1024,
  EVIDENCE_MAX_TOTAL_BYTES: 8 * 1024 * 1024,
  /** Older content-report form counter. */
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;

export const DESCRIPTION_MAX_LENGTH = REPORT_LIMITS.DESCRIPTION_MAX_LENGTH;

/** Public submission rate limit, applied per submitter IP hash. */
export const RATE_LIMIT = {
  WINDOW_MS: 30 * 60 * 1000, // 30 minutes
  MAX_PER_WINDOW: 5,
} as const;

/** Staff dashboard request limit for a single IP. */
export const ADMIN_RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_PER_WINDOW: 120,
} as const;

/** File types accepted for evidence. No executables, scripts, or archives. */
export const EVIDENCE_ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "video/mp4": ".mp4",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
};

export const EVIDENCE_ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".pdf",
  ".txt",
  ".mp4",
  ".mp3",
  ".ogg",
]);

/** Magic-byte signatures used to confirm the real content of an upload. */
export const EVIDENCE_SIGNATURES: Array<{ types: string[]; bytes: number[] }> = [
  { types: ["image/png"], bytes: [0x89, 0x50, 0x4e, 0x47] },
  { types: ["image/jpeg", "image/jpg"], bytes: [0xff, 0xd8, 0xff] },
  { types: ["image/gif"], bytes: [0x47, 0x49, 0x46, 0x38] },
  { types: ["application/pdf"], bytes: [0x25, 0x50, 0x44, 0x46] },
];

export const VALID_CONTENT_TYPES = new Set<string>(Object.keys(REPORT_CONTENT_TYPES));
export const VALID_REASONS = new Set<string>(ALL_CATEGORIES.map((c) => c.value));
export const VALID_CATEGORIES = VALID_REASONS;
export const VALID_STATUSES = new Set<string>(Object.keys(REPORT_STATUSES));
export const VALID_PRIORITIES = new Set<string>(Object.keys(REPORT_PRIORITIES));
export const VALID_WEBHOOK_STATUSES = new Set<string>(Object.keys(REPORT_WEBHOOK_STATUSES));
export const OPEN_STATUSES = Object.entries(REPORT_STATUSES)
  .filter(([, meta]) => meta.open)
  .map(([key]) => key);

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export function getContentTypeLabel(type: string): string {
  if (!type || type === "NONE") return "Community report";
  return REPORT_CONTENT_TYPES[type as ReportContentType]?.label ?? type.replace(/_/g, " ");
}

export function getCategoryDefinition(value: string) {
  return ALL_CATEGORIES.find((c) => c.value === value);
}

export function getReasonLabel(reason: string): string {
  return getCategoryDefinition(reason)?.label ?? reason.replace(/_/g, " ");
}

export function getReasonDescription(reason: string): string {
  return getCategoryDefinition(reason)?.description ?? "";
}

export function getSuggestedPriority(reason: string): ReportPriority {
  return getCategoryDefinition(reason)?.priority ?? "NORMAL";
}

export function getStatusLabel(status: string): string {
  return REPORT_STATUSES[status as ReportStatus]?.label ?? status.replace(/_/g, " ");
}

export function getStatusTone(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  return REPORT_STATUSES[status as ReportStatus]?.tone ?? "neutral";
}

export function isOpenStatus(status: string): boolean {
  return OPEN_STATUSES.includes(status);
}

export function getPriorityLabel(priority: string): string {
  return REPORT_PRIORITIES[priority as ReportPriority]?.label ?? priority;
}

export function getPriorityTone(priority: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  return REPORT_PRIORITIES[priority as ReportPriority]?.tone ?? "neutral";
}

export function getWebhookStatusLabel(status: string): string {
  return REPORT_WEBHOOK_STATUSES[status as ReportWebhookStatus]?.label ?? status;
}

export function getWebhookStatusTone(
  status: string,
): "neutral" | "brand" | "success" | "warning" | "danger" {
  return REPORT_WEBHOOK_STATUSES[status as ReportWebhookStatus]?.tone ?? "neutral";
}

/* -------------------------------------------------------------------------- */
/* Evidence (external links) helpers                                          */
/* -------------------------------------------------------------------------- */

export function parseEvidence(json: string): Array<{ url: string; label?: string }> {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((e) => e && typeof e.url === "string" && e.url.trim() !== "")
        .map((e) => ({ url: e.url.trim(), label: typeof e.label === "string" ? e.label.trim() : undefined }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function stringifyEvidence(evidence: Array<{ url: string; label?: string }>): string {
  return JSON.stringify(evidence.map((e) => ({ url: e.url, label: e.label ?? "" })));
}

export function parseLinks(json: string): Array<{ url: string; label?: string }> {
  return parseEvidence(json);
}

/** UGN-000123 -> 000123 */
export function referenceToSequence(reference: string | null | undefined): number | null {
  if (!reference) return null;
  const match = /^UGN-(\d+)$/.exec(reference.trim());
  return match ? Number(match[1]) : null;
}

/** Human label for a report reference (falls back to a short id). */
export function getReportLabel(report: { reference?: string | null; id: string }): string {
  return report.reference || `UGN-${report.id.slice(0, 6).toUpperCase()}`;
}

export function getReportContentHref(contentType: string, contentId: string): string | null {
  if (!contentType || !contentId || contentType === "NONE") return null;
  switch (contentType) {
    case "COMMUNITY_SUBMISSION":
    case "COMMUNITY_PHOTO":
      return `/community/${contentId}`;
    case "GALLERY_IMAGE":
      return `/gallery`;
    case "GROUP_PHOTO":
      return `/groups/${contentId}`;
    case "EVENT":
      return `/events`;
    case "STAFF_PROFILE":
      return `/staff/${contentId}`;
    case "SHOP_DESIGN":
      return `/shop`;
case "ANNOUNCEMENT":
      return "/news";
    case "COMMUNITY_REVIEW":
      return "/reviews";
    default:
      return null;
  }
}

/** Labels for the staff audit timeline. */
export const REPORT_AUDIT_LABELS: Record<string, string> = {
  SUBMITTED: "Report submitted",
  ASSIGNED: "Assigned to moderator",
  UNASSIGNED: "Unassigned",
  STATUS_CHANGED: "Status changed",
  PRIORITY_CHANGED: "Priority changed",
  NOTE_ADDED: "Staff note added",
  ACTION_RECORDED: "Action recorded",
  RESOLVED: "Report resolved",
  DISMISSED: "Report dismissed",
  ESCALATED: "Report escalated",
  EVIDENCE_VIEWED: "Evidence opened",
  WEBHOOK_RETRIED: "Staff notification retried",
  WEBHOOK_SENT: "Staff notification sent",
  WEBHOOK_FAILED: "Staff notification failed",
  CONTENT_RESTORED: "Reported content restored",
  EVIDENCE_ADDED: "Evidence attached",
};

export function getAuditLabel(action: string): string {
  return REPORT_AUDIT_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                       */
/* -------------------------------------------------------------------------- */

export function formatReportBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}