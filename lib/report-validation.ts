import {
  EVIDENCE_ALLOWED_EXTENSIONS,
  EVIDENCE_ALLOWED_TYPES,
  EVIDENCE_SIGNATURES,
  REPORT_CATEGORIES,
  REPORT_LIMITS,
  VALID_CATEGORIES,
  getSuggestedPriority,
  type ReportCategory,
  type ReportPriority,
} from "@/lib/reports";

/**
 * Shared validation for the report system.
 *
 * This module is deliberately free of server-only imports so the public form can
 * use the exact same limits and messages as the API. The server always re-runs
 * every check — the client copy exists only for fast feedback.
 */

export type ReportLinkInput = { url: string; label?: string };

export type ReportSubmissionInput = {
  category?: unknown;
  /** Legacy alias for `category`, still sent by the in-page report modal. */
  reason?: unknown;
  description?: unknown;
  reportedPerson?: unknown;
  reportedDiscord?: unknown;
  incidentAt?: unknown;
  links?: unknown;
  /** Legacy alias for `links` used by the in-page report modal. */
  evidence?: unknown;
  reporterName?: unknown;
  reporterEmail?: unknown;
  anonymous?: unknown;
  contentType?: unknown;
  contentId?: unknown;
  idempotencyKey?: unknown;
  evidenceIds?: unknown;
  /** Honeypot: real users never fill this in. */
  website?: unknown;
};

export type ValidatedReportSubmission = {
  category: ReportCategory;
  description: string;
  reportedPerson: string;
  reportedDiscord: string;
  incidentAt: Date | null;
  links: ReportLinkInput[];
  reporterName: string;
  reporterEmail: string | null;
  anonymous: boolean;
  contentType: string;
  contentId: string;
  idempotencyKey: string | null;
  evidenceIds: string[];
  suggestedPriority: ReportPriority;
};

export type ValidationResult =
  | { ok: true; value: ValidatedReportSubmission }
  | { ok: false; error: string; field?: string }
  /** Honeypot tripped — the caller must not store anything. */
  | { ok: false; spam: true };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9_-]{16,80}$/;
const EVIDENCE_ID_PATTERN = /^[a-z0-9]{20,32}$/i;
const CONTENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    // Strip control characters (including newlines) so single-line fields
    // cannot be used for header/log injection or UI spoofing.
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, max);
}

/** Only http(s) URLs are accepted; anything else (javascript:, data:, file:) is rejected. */
export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > REPORT_LIMITS.LINK_MAX) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (!parsed.hostname || parsed.hostname.length < 3) return null;
  // Reject credentials and non-standard ports used for internal scanning.
  if (parsed.username || parsed.password) return null;
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") return null;
  return parsed.toString();
}

function parseLinks(value: unknown): { links: ReportLinkInput[]; error?: string } {
  if (value === undefined || value === null || value === "") return { links: [] };

  let raw: unknown = value;
  if (typeof value === "string") {
    // Accept newline/comma separated URLs as well as structured values.
    raw = value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  const entries = Array.isArray(raw) ? raw : [raw];
  if (entries.length > REPORT_LIMITS.LINKS_MAX_COUNT) {
    return { links: [], error: `Please provide no more than ${REPORT_LIMITS.LINKS_MAX_COUNT} links.` };
  }

  const links: ReportLinkInput[] = [];
  let total = 0;

  for (const entry of entries) {
    const candidate =
      typeof entry === "string"
        ? { url: entry, label: "" }
        : {
            url: (entry as ReportLinkInput)?.url,
            label: (entry as ReportLinkInput)?.label,
          };

    const url = sanitizeUrl(candidate.url);
    if (!url) {
      return { links: [], error: "One of the links is not a valid http(s) URL." };
    }

    total += url.length;
    if (total > REPORT_LIMITS.LINKS_MAX_TOTAL) {
      return { links: [], error: "The links you added are too long." };
    }

    links.push({ url, label: cleanText(candidate.label, 120) });
  }

  return { links };
}

/**
 * Like {@link cleanMultiline} but reports whether the source was over the limit,
 * so the caller can reject the submission instead of silently truncating the
 * reporter's words.
 */
export function normalizeMultiline(
  value: unknown,
  max: number,
): { text: string; truncated: boolean } {
  const raw = typeof value === "string" ? value : "";
  const cleaned = cleanMultiline(raw, max);
  return { text: cleaned, truncated: raw.trim().length > max };
}

function parseIncidentAt(value: unknown): { incidentAt: Date | null; error?: string } {
  if (value === undefined || value === null || value === "") return { incidentAt: null };
  if (typeof value !== "string" && typeof value !== "number") {
    return { incidentAt: null, error: "The incident date is not valid." };
  }
  const date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) {
    return { incidentAt: null, error: "The incident date is not valid." };
  }
  const now = Date.now();
  if (date.getTime() > now + 24 * 60 * 60 * 1000) {
    return { incidentAt: null, error: "The incident date cannot be in the future." };
  }
  if (date.getTime() < now - 10 * 365 * 24 * 60 * 60 * 1000) {
    return { incidentAt: null, error: "Please check the incident date." };
  }
  return { incidentAt: date };
}

/**
 * Validate a report submission payload. Returns a sanitised, size-bounded
 * object or a human-readable error for the form to display.
 */
export function validateReportSubmission(
  input: ReportSubmissionInput,
): ValidationResult {
  if (typeof input.website === "string" && input.website.trim() !== "") {
    // Honeypot field was filled in. The route reports success to the bot but
    // stores nothing, so the spammer gets no signal about the filter.
    return { ok: false, spam: true };
  }

  const categoryRaw = cleanText(input.category ?? input.reason, REPORT_LIMITS.CATEGORY_MAX).toUpperCase();
  if (!categoryRaw) {
    return { ok: false, error: "Please choose a category.", field: "category" };
  }
  if (!VALID_CATEGORIES.has(categoryRaw)) {
    return { ok: false, error: "Please choose a valid category.", field: "category" };
  }

  const descriptionInput = normalizeMultiline(input.description, REPORT_LIMITS.DESCRIPTION_MAX);
  if (descriptionInput.truncated) {
    return {
      ok: false,
      error: `Please shorten your description to ${REPORT_LIMITS.DESCRIPTION_MAX} characters or fewer.`,
      field: "description",
    };
  }
  const description = descriptionInput.text;
  if (description.length < REPORT_LIMITS.DESCRIPTION_MIN) {
    return {
      ok: false,
      error: `Please describe what happened in at least ${REPORT_LIMITS.DESCRIPTION_MIN} characters.`,
      field: "description",
    };
  }

  const anonymous = input.anonymous === true || input.anonymous === "true";

  const reporterName = cleanText(input.reporterName, REPORT_LIMITS.REPORTER_NAME_MAX);
  if (anonymous && reporterName !== "") {
    return { ok: false, error: "Remove your name to submit anonymously.", field: "reporterName" };
  }

  let reporterEmail: string | null = null;
  const emailRaw = cleanText(input.reporterEmail, REPORT_LIMITS.REPORTER_EMAIL_MAX);
  if (emailRaw !== "") {
    if (!EMAIL_PATTERN.test(emailRaw)) {
      return { ok: false, error: "Please enter a valid email address.", field: "reporterEmail" };
    }
    reporterEmail = emailRaw;
  }
  if (anonymous && reporterEmail) {
    return {
      ok: false,
      error: "Remove your email address to submit anonymously.",
      field: "reporterEmail",
    };
  }

  const reportedPerson = cleanText(input.reportedPerson, REPORT_LIMITS.REPORTED_PERSON_MAX);
  const reportedDiscord = cleanText(input.reportedDiscord, REPORT_LIMITS.REPORTED_DISCORD_MAX);

  const incident = parseIncidentAt(input.incidentAt);
  if (incident.error) {
    return { ok: false, error: incident.error, field: "incidentAt" };
  }

  const parsedLinks = parseLinks(input.links ?? input.evidence);
  if (parsedLinks.error) {
    return { ok: false, error: parsedLinks.error, field: "links" };
  }

  const contentTypeRaw = cleanText(input.contentType, 40).toUpperCase();
  const contentType = contentTypeRaw === "" ? "NONE" : contentTypeRaw;
  const contentId = cleanText(input.contentId, 64);
  if (contentId !== "" && !CONTENT_ID_PATTERN.test(contentId)) {
    return { ok: false, error: "The reported content reference is not valid.", field: "contentId" };
  }

  let idempotencyKey: string | null = null;
  const idempotencyRaw = cleanText(input.idempotencyKey, 80);
  if (idempotencyRaw !== "") {
    if (!IDEMPOTENCY_PATTERN.test(idempotencyRaw)) {
      return { ok: false, error: "Invalid submission token.", field: "idempotencyKey" };
    }
    idempotencyKey = idempotencyRaw;
  }

  const evidenceIds: string[] = [];
  if (Array.isArray(input.evidenceIds)) {
    if (input.evidenceIds.length > REPORT_LIMITS.EVIDENCE_MAX_FILES) {
      return {
        ok: false,
        error: `You can attach up to ${REPORT_LIMITS.EVIDENCE_MAX_FILES} files.`,
        field: "evidence",
      };
    }
    for (const raw of input.evidenceIds) {
      const id = typeof raw === "string" ? raw.trim() : "";
      if (!EVIDENCE_ID_PATTERN.test(id)) {
        return { ok: false, error: "One of the attached files is not valid.", field: "evidence" };
      }
      evidenceIds.push(id);
    }
  }

  return {
    ok: true,
    value: {
      category: categoryRaw as ReportCategory,
      description,
      reportedPerson,
      reportedDiscord,
      incidentAt: incident.incidentAt,
      links: parsedLinks.links,
      reporterName,
      reporterEmail,
      anonymous,
      contentType,
      contentId,
      idempotencyKey,
      evidenceIds,
      suggestedPriority: getSuggestedPriority(categoryRaw as ReportCategory),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Evidence files                                                             */
/* -------------------------------------------------------------------------- */

export type EvidenceFileCheck =
  | { ok: true; safeFileName: string }
  | { ok: false; error: string };

export function fileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index).toLowerCase();
}

/**
 * Validate an uploaded evidence file: declared type, extension, size, and magic
 * bytes. Executables, scripts, archives, and mismatched content are rejected.
 */
export function validateEvidenceFile(file: File, bytes: Uint8Array): EvidenceFileCheck {
  if (file.size === 0) {
    return { ok: false, error: "One of the attached files is empty." };
  }
  if (file.size > REPORT_LIMITS.EVIDENCE_MAX_BYTES) {
    return {
      ok: false,
      error: `Each file must be ${Math.floor(
        REPORT_LIMITS.EVIDENCE_MAX_BYTES / (1024 * 1024),
      )}MB or smaller.`,
    };
  }

  const declaredType = (file.type || "").toLowerCase();
  const extension = fileExtension(file.name || "");

  if (!EVIDENCE_ALLOWED_TYPES[declaredType]) {
    return {
      ok: false,
      error: "That file type is not supported. Use an image, video, audio, PDF, or text file.",
    };
  }
  if (extension && !EVIDENCE_ALLOWED_EXTENSIONS.has(extension)) {
    return { ok: false, error: "That file extension is not allowed." };
  }

  // Confirm the real content type using magic bytes where we have a signature.
  const signature = EVIDENCE_SIGNATURES.find((candidate) =>
    candidate.types.includes(declaredType),
  );
  if (signature && bytes.length >= signature.bytes.length) {
    const matches = signature.bytes.every((byte, index) => bytes[index] === byte);
    if (!matches) {
      return {
        ok: false,
        error: "The file contents do not match the file type. Upload rejected.",
      };
    }
  }

  // Reject obvious executable/script payloads regardless of declared type.
  const header = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 512))
    .toLowerCase();
  const suspicious = [
    "<script",
    "<?php",
    "#!/bin/",
    "<!doctype html",
    "<html",
    "powershell",
    "cmd.exe",
  ];
  if (declaredType.startsWith("text/") || declaredType === "application/pdf") {
    if (suspicious.some((needle) => header.includes(needle))) {
      return { ok: false, error: "Executable or script content is not allowed." };
    }
  }

  const baseName = (file.name || "evidence").replace(/[^\w.\- ]+/g, "_").slice(0, 80);
  const safeFileName = `${baseName}${EVIDENCE_ALLOWED_TYPES[declaredType]}`;
  return { ok: true, safeFileName };
}

/** Categories offered by the public form, as `{ value, label, description }`. */
export const PUBLIC_CATEGORY_OPTIONS = REPORT_CATEGORIES.map((category) => ({
  value: category.value,
  label: category.label,
  description: category.description,
}));