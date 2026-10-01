import { cleanMultiline, cleanText } from "@/lib/report-validation";

/**
 * Community review domain logic.
 *
 * Reviews are plain text only. Nothing in this module produces HTML, and the
 * public page never renders submitted content with `dangerouslySetInnerHTML` —
 * React escaping is the only thing standing between a reviewer and the page, so
 * every field is additionally stripped of markup before it is stored.
 *
 * This module is deliberately free of server-only imports so the public form can
 * validate with the exact same limits and messages the API enforces. The server
 * always re-runs every check.
 */

export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;

export const REVIEW_LIMITS = {
  /** Display name shown publicly when the reviewer allows it. */
  DISPLAY_NAME_MAX: 40,
  /** Optional Discord or VRChat handle, staff-visible only. */
  HANDLE_MAX: 60,
  /** Review body. */
  CONTENT_MIN: 20,
  CONTENT_MAX: 2000,
  /** Staff-only moderation note. */
  NOTE_MAX: 500,
} as const;

export const REVIEW_STATUSES = {
  PENDING: { label: "Pending review", tone: "warning" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  HIDDEN: { label: "Hidden", tone: "neutral" },
} as const;

export type ReviewStatusKey = keyof typeof REVIEW_STATUSES;
export type ReviewStatusTone = (typeof REVIEW_STATUSES)[ReviewStatusKey]["tone"];

export function isReviewStatus(value: string): value is ReviewStatusKey {
  return value in REVIEW_STATUSES;
}

export function getReviewStatusLabel(status: string): string {
  return REVIEW_STATUSES[status as ReviewStatusKey]?.label ?? status.replace(/_/g, " ");
}

export function getReviewStatusTone(status: string): ReviewStatusTone {
  return REVIEW_STATUSES[status as ReviewStatusKey]?.tone ?? "neutral";
}

export function getRatingLabel(rating: number): string {
  return `${rating} out of 5 stars`;
}

/* -------------------------------------------------------------------------- */
/* Sanitisation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Markup is stripped rather than escaped: a review is plain text, so any HTML
 * the submitter typed is removed before storage instead of being rendered.
 * `&` is collapsed first so entities like `&lt;script&gt;` cannot be used to
 * smuggle markup past the tag stripper, then complete tags — attributes and all
 * — are dropped so `<img src=x onerror=...>` leaves nothing behind.
 */
function stripMarkup(value: string): string {
  return value
    .replace(/&/g, " ")
    .replace(/<[^>]*>?/g, " ")
    .replace(/[<>{}[\]()<>]/g, " ")
    .replace(/\s+/g, " ");
}

/** Sanitises a single-line field (display name, handle, moderation note). */
export function sanitizeReviewLine(value: unknown, max: number): string {
  return stripMarkup(cleanText(value, max));
}

/**
 * Sanitises the review body. Paragraphs are preserved so multi-paragraph
 * reviews still read properly, but no markup survives.
 */
export function sanitizeReviewContent(value: unknown): string {
  const cleaned = cleanMultiline(value, REVIEW_LIMITS.CONTENT_MAX + 200);
  return cleaned
    .split("\n")
    .map((line) => stripMarkup(line).trim())
    .filter((line) => line.length > 0)
    .join("\n\n")
    .slice(0, REVIEW_LIMITS.CONTENT_MAX);
}

/* -------------------------------------------------------------------------- */
/* Abuse / spam scoring                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A deliberately small list of unambiguous slurs and abuse terms. This is a
 * speed bump plus a moderation signal, not a comprehensive filter — staff still
 * make the final call on every review.
 */
const ABUSE_TERMS = [
  "nigger", "nigga", "faggot", "fag", "tranny", "retard", "retarded",
  "kike", "spic", "chink", "wetback", "gook", "coon", "paki",
  "kill yourself", "kys", "dox yourself", "i hope you die", "worthless piece of",
];

/** Obvious link-farm / SEO spam markers. */
const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /\b[a-z0-9-]+\.(?:com|net|org|io|ru|xyz|top|shop)\b/i,
  /<[a-z]/i,
  /\b(?:buy|cheap|discount|seo|backlink|crypto|casino)\b.{0,20}\b(?:link|traffic|service)s?\b/i,
  /(.)\1{8,}/, // keyboard mashing
];

/** Link count above which a review is treated as link spam. */
const SPAM_LINK_THRESHOLD = 2;

export type ReviewAbuseCheck = {
  /** Higher means more likely spam. Staff see this on the moderation queue. */
  score: number;
  /** Set when the review contains explicit abuse and should be auto-rejected. */
  abusive: boolean;
  reasons: string[];
};

/**
 * Scores a review for obvious spam and abuse. Used to auto-reject clear abuse
 * and to flag borderline reviews for staff — never used to auto-approve.
 */
export function checkReviewAbuse(input: {
  displayName: string;
  handle: string;
  content: string;
}): ReviewAbuseCheck {
  const reasons: string[] = [];
  let score = 0;

  const haystack = `${input.content} ${input.displayName} ${input.handle}`.toLowerCase();

  const abuseHits = ABUSE_TERMS.filter((term) =>
    new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(haystack),
  );
  if (abuseHits.length > 0) {
    score += 5;
    reasons.push("contains abusive language");
  }

  const linkCount = (haystack.match(/https?:\/\//gi) ?? []).length;
  if (linkCount >= SPAM_LINK_THRESHOLD) {
    score += 3;
    reasons.push("contains multiple links");
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(haystack)) {
      score += 1;
      reasons.push("matches a spam pattern");
      break;
    }
  }

  if (input.content.length > 0 && input.content.length / Math.max(1, input.content.split(/\s+/).length) > 30) {
    score += 1;
    reasons.push("unusual word lengths");
  }

  return { score, abusive: abuseHits.length > 0, reasons: Array.from(new Set(reasons)) };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export type ReviewSubmissionInput = {
  displayName?: unknown;
  handle?: unknown;
  rating?: unknown;
  content?: unknown;
  showUsername?: unknown;
  /** Honeypot: real users never fill this in. */
  website?: unknown;
};

export type ValidatedReview = {
  displayName: string;
  handle: string;
  rating: number;
  content: string;
  showUsername: boolean;
};

export type ReviewValidationResult =
  | { ok: true; value: ValidatedReview }
  | { ok: false; error: string; field?: string }
  /** Honeypot tripped — the caller must not store anything. */
  | { ok: false; spam: true };

export function validateReviewSubmission(input: ReviewSubmissionInput): ReviewValidationResult {
  if (typeof input.website === "string" && input.website.trim() !== "") {
    // Honeypot filled in. The route reports success to the bot but stores
    // nothing, so the spammer gets no signal about the filter.
    return { ok: false, spam: true };
  }

  const ratingRaw = typeof input.rating === "string" ? Number(input.rating) : input.rating;
  const rating = typeof ratingRaw === "number" ? ratingRaw : Number.NaN;
  if (!Number.isInteger(rating) || rating < REVIEW_RATING_MIN || rating > REVIEW_RATING_MAX) {
    return { ok: false, error: "Please choose a rating between 1 and 5 stars.", field: "rating" };
  }

  const displayName = sanitizeReviewLine(input.displayName, REVIEW_LIMITS.DISPLAY_NAME_MAX);
  if (displayName.length < 2) {
    return {
      ok: false,
      error: `Please enter a display name of at least 2 characters.`,
      field: "displayName",
    };
  }

  const handle = sanitizeReviewLine(input.handle, REVIEW_LIMITS.HANDLE_MAX);

  const content = sanitizeReviewContent(input.content);
  if (content.length < REVIEW_LIMITS.CONTENT_MIN) {
    return {
      ok: false,
      error: `Please write at least ${REVIEW_LIMITS.CONTENT_MIN} characters so your review is useful to others.`,
      field: "content",
    };
  }
  if (content.length >= REVIEW_LIMITS.CONTENT_MAX) {
    return {
      ok: false,
      error: `Please shorten your review to ${REVIEW_LIMITS.CONTENT_MAX} characters or fewer.`,
      field: "content",
    };
  }

  const showUsername = input.showUsername === true || input.showUsername === "true" || input.showUsername === "on";

  return { ok: true, value: { displayName, handle, rating, content, showUsername } };
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                        */
/* -------------------------------------------------------------------------- */

export type RatingSummary = {
  average: number;
  total: number;
  /** Index 0 = 1 star … index 4 = 5 stars. */
  distribution: number[];
};

/**
 * Builds the aggregate header shown above the review list. Only ever called
 * with APPROVED reviews.
 */
export function summariseRatings(reviews: Array<{ rating: number }>): RatingSummary {
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;

  for (const review of reviews) {
    const index = Math.round(review.rating) - 1;
    if (index >= 0 && index < distribution.length) {
      distribution[index] += 1;
      total += 1;
    }
  }

  const average = total === 0 ? 0 : distribution.reduce((sum, count, i) => sum + count * (i + 1), 0) / total;

  return {
    average: Math.round(average * 10) / 10,
    total,
    distribution,
  };
}

/** First character of a display name, used for the generated avatar. */
export function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Code-point aware so emoji and accented characters don't render as "?" or split.
  const first = Array.from(trimmed)[0] ?? "?";
  return first.toUpperCase();
}

/** Publicly visible reviewer label. Falls back to "Anonymous" when hidden. */
export function getPublicReviewerName(review: { displayName: string; showUsername: boolean }): string {
  return review.showUsername && review.displayName.trim() !== "" ? review.displayName.trim() : "Anonymous";
}

/**
 * Short, human relative time. Mirrors the wording already used by the admin
 * moderation queue so the two surfaces read consistently.
 */
export function formatRelativeTime(date: Date | string): string {
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}