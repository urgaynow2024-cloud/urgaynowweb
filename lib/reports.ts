import type { ReactNode } from "react";

export type ReportContentType =
  | "COMMUNITY_PHOTO"
  | "GALLERY_IMAGE"
  | "GROUP_PHOTO"
  | "EVENT"
  | "STAFF_PROFILE"
  | "SHOP_DESIGN"
  | "COMMUNITY_SUBMISSION"
  | "ANNOUNCEMENT";

export type ReportReason =
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "SEXUAL_CONTENT"
  | "NSFW"
  | "VIOLENCE"
  | "SCAM"
  | "SPAM"
  | "COPYRIGHT"
  | "IMPERSONATION"
  | "PERSONAL_INFO"
  | "RULE_VIOLATION"
  | "OTHER";

export type ReportStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | "ESCALATED";

export type ReportPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

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
};

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "HARASSMENT", label: "Harassment", description: "Targeted harassment, threats, or bullying" },
  { value: "HATE_SPEECH", label: "Hate or discriminatory content", description: "Hate speech targeting protected characteristics" },
  { value: "SEXUAL_CONTENT", label: "Sexual/inappropriate content", description: "Sexually explicit or suggestive material" },
  { value: "NSFW", label: "NSFW content", description: "Not safe for work or public viewing" },
  { value: "VIOLENCE", label: "Violence or gore", description: "Graphic violence or disturbing imagery" },
  { value: "SCAM", label: "Scam/fraud", description: "Scams, fraud, or deceptive content" },
  { value: "SPAM", label: "Spam", description: "Unsolicited or repetitive spam content" },
  { value: "COPYRIGHT", label: "Copyright/ownership issue", description: "Copyright infringement or stolen content" },
  { value: "IMPERSONATION", label: "Impersonation", description: "Impersonating another person or entity" },
  { value: "PERSONAL_INFO", label: "Personal information", description: "Sharing private personal information" },
  { value: "RULE_VIOLATION", label: "Community rules violation", description: "Violation of community guidelines" },
  { value: "OTHER", label: "Other", description: "Something else — please describe below" },
];

export const REPORT_STATUSES: Record<
  ReportStatus,
  { label: string; tone: "neutral" | "brand" | "success" | "warning" | "danger" }
> = {
  OPEN: { label: "Open", tone: "brand" },
  IN_REVIEW: { label: "In Review", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  DISMISSED: { label: "Dismissed", tone: "neutral" },
  ESCALATED: { label: "Escalated", tone: "danger" },
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

export const DESCRIPTION_MAX_LENGTH = 2000;

export const RATE_LIMIT = {
  WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  MAX_PER_WINDOW: 6,
} as const;

export const VALID_CONTENT_TYPES = new Set(Object.keys(REPORT_CONTENT_TYPES));
export const VALID_REASONS = new Set(REPORT_REASONS.map((r) => r.value));
export const VALID_STATUSES = new Set(Object.keys(REPORT_STATUSES));
export const VALID_PRIORITIES = new Set(Object.keys(REPORT_PRIORITIES));

export function getContentTypeLabel(type: string): string {
  return REPORT_CONTENT_TYPES[type as ReportContentType]?.label ?? type.replace(/_/g, " ");
}

export function getReasonLabel(reason: string): string {
  return REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason.replace(/_/g, " ");
}

export function getReasonDescription(reason: string): string {
  return REPORT_REASONS.find((r) => r.value === reason)?.description ?? "";
}

export function getStatusLabel(status: string): string {
  return REPORT_STATUSES[status as ReportStatus]?.label ?? status.replace(/_/g, " ");
}

export function getStatusTone(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  return REPORT_STATUSES[status as ReportStatus]?.tone ?? "neutral";
}

export function getPriorityLabel(priority: string): string {
  return REPORT_PRIORITIES[priority as ReportPriority]?.label ?? priority;
}

export function getPriorityTone(priority: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  return REPORT_PRIORITIES[priority as ReportPriority]?.tone ?? "neutral";
}

export function parseEvidence(json: string): Array<{ url: string; label?: string }> {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((e) => e && typeof e.url === "string" && e.url.trim() !== "")
        .map((e) => ({ url: e.url.trim(), label: e.label?.trim() }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function stringifyEvidence(evidence: Array<{ url: string; label?: string }>): string {
  return JSON.stringify(evidence.map((e) => ({ url: e.url, label: e.label ?? "" })));
}

export function getReportContentHref(contentType: string, contentId: string): string | null {
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
      return `/news`;
    default:
      return null;
  }
}
