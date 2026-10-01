import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import {
  RATE_LIMIT,
  REPORT_LIMITS,
  getSuggestedPriority,
  stringifyEvidence,
} from "@/lib/reports";
import { validateReportSubmission } from "@/lib/report-validation";
import { checkMemoryRateLimit, fingerprint, getClientIp, hashIp } from "@/lib/request-security";
import { nextReportReference } from "@/lib/report-reference";
import { sendReportWebhook } from "@/lib/report-webhook";
import { readEvidenceTokens, writeTrackingToken } from "@/lib/report-evidence-token";

export const runtime = "nodejs";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Durable per-IP limit, backed by the stored (salted) IP hash. */
async function isOverRateLimit(ipHash: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT.WINDOW_MS);
  const count = await safeQuery(
    () =>
      prisma.report.count({
        where: { reporterIpHash: ipHash, createdAt: { gte: windowStart } },
      }),
    0,
  );
  return count >= RATE_LIMIT.MAX_PER_WINDOW;
}

/** Look up the display name behind a reported piece of site content. */
async function resolveReportedUsername(
  contentType: string,
  contentId: string,
): Promise<string | null> {
  if (!contentId) return null;
  try {
    if (contentType === "COMMUNITY_SUBMISSION") {
      const submission = await prisma.communitySubmission.findUnique({
        where: { id: contentId },
        select: { submitterName: true },
      });
      return submission?.submitterName ?? null;
    }
    if (contentType === "GALLERY_IMAGE") {
      const image = await prisma.galleryImage.findUnique({
        where: { id: contentId },
        select: { submitterName: true },
      });
      return image?.submitterName ?? null;
    }
    if (contentType === "STAFF_PROFILE") {
      const staff = await prisma.staff.findUnique({
        where: { id: contentId },
        select: { name: true },
      });
      return staff?.name ?? null;
    }
  } catch {
    /* content lookup is best-effort */
  }
  return null;
}

/** Attach staged uploads to the new report. Only the submitter's own uploads. */
async function claimEvidence(reportId: string, evidenceIds: string[]): Promise<number> {
  const tokens = await readEvidenceTokens();
  if (evidenceIds.length === 0 || tokens.length === 0) return 0;

  const result = await prisma.reportEvidence.updateMany({
    where: {
      id: { in: evidenceIds },
      uploaderToken: { in: tokens },
      reportId: null,
    },
    data: { reportId },
  });
  return result.count;
}

/**
 * Short burst limit in front of the durable per-IP limit. This catches
 * hammering (including automated retries that fail validation) without getting
 * in the way of someone correcting a form a couple of times.
 */
const BURST_LIMIT = { WINDOW_MS: 60_000, MAX_PER_WINDOW: 10 };

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const burst = checkMemoryRateLimit(
    `report-submit:${ipHash}`,
    BURST_LIMIT.MAX_PER_WINDOW,
    BURST_LIMIT.WINDOW_MS,
  );
  if (!burst.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const validation = validateReportSubmission(payload ?? {});
  if (!validation.ok) {
    if ("spam" in validation && validation.spam) {
      // Honeypot tripped. Answer as if it succeeded so the bot learns nothing,
      // but store nothing at all.
      console.warn("[report/submit] honeypot tripped", { ipHash: ipHash.slice(0, 12) });
      return NextResponse.json({
        success: true,
        reference: "UGN-000000",
        reportToken: null,
        notification: "queued",
      });
    }
    const message = "error" in validation ? validation.error : "Invalid submission.";
    const field = "field" in validation ? validation.field : undefined;
    return NextResponse.json({ success: false, error: message, field }, { status: 400 });
  }

  const input = validation.value;

  // 1. Idempotent retry: the same submit token must never create a second report.
  if (input.idempotencyKey) {
    const existing = await prisma.report.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { id: true, reportToken: true, reference: true },
    });
    if (existing) {
      await writeTrackingToken(existing.reportToken);
      return NextResponse.json({
        success: true,
        duplicate: true,
        reference: existing.reference,
        reportToken: existing.reportToken,
        trackingUrl: `/report/track/${existing.reportToken}`,
        notification: "already-registered",
      });
    }
  }

  // 2. Rate limit (durable check against stored reports).
  if (await isOverRateLimit(ipHash)) {
    return NextResponse.json(
      {
        success: false,
        error: `You have reached the limit of ${RATE_LIMIT.MAX_PER_WINDOW} reports per 30 minutes. Please try again later.`,
      },
      { status: 429 },
    );
  }

  // 3. Duplicate submission protection (same person, same target, same details).
  const dedupeHash = fingerprint([
    ipHash,
    input.category,
    input.reportedPerson || input.reportedDiscord,
    input.contentType,
    input.contentId,
    input.description.slice(0, 400).toLowerCase(),
  ]);
  const recentDuplicate = await prisma.report.findFirst({
    where: {
      dedupeHash,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    select: { id: true, reportToken: true, reference: true },
  });
  if (recentDuplicate) {
    await writeTrackingToken(recentDuplicate.reportToken);
    return NextResponse.json(
      {
        success: false,
        duplicate: true,
        error: "You already submitted this report. We have not created a duplicate.",
        reference: recentDuplicate.reference,
        reportToken: recentDuplicate.reportToken,
        trackingUrl: `/report/track/${recentDuplicate.reportToken}`,
      },
      { status: 409 },
    );
  }

  const session = await getSession();
  const anonymous = input.anonymous || !input.reporterName;
  const source = input.contentType === "NONE" ? "COMMUNITY" : "CONTENT";

  const reportedUsername = await resolveReportedUsername(input.contentType, input.contentId);

  let report;
  try {
    const { reference, sequence } = await nextReportReference();

    report = await prisma.report.create({
      data: {
        reference,
        referenceSeq: sequence,
        source,
        contentType: input.contentType,
        contentId: input.contentId,
        reporterId: session?.sub ?? null,
        reporterName: anonymous ? "" : input.reporterName || session?.name || "",
        reporterEmail: anonymous ? null : input.reporterEmail,
        anonymous,
        reporterIpHash: ipHash,
        idempotencyKey: input.idempotencyKey,
        dedupeHash,
        reportedUsername,
        reportedPerson: input.reportedPerson,
        reportedDiscord: input.reportedDiscord,
        incidentAt: input.incidentAt,
        links: JSON.stringify(input.links),
        reason: input.category,
        description: input.description,
        evidence: stringifyEvidence(input.links),
        status: "OPEN",
        priority: getSuggestedPriority(input.category),
        webhookStatus: "PENDING",
      },
    });

    await claimEvidence(report.id, input.evidenceIds);

    await prisma.reportAuditLog.create({
      data: {
        reportId: report.id,
        action: "SUBMITTED",
        actorId: session?.sub ?? null,
        actorName: anonymous ? "Anonymous reporter" : input.reporterName || session?.name || "Reporter",
        detail: `Submitted via the public report form (${source === "COMMUNITY" ? "community report" : "website content"}).`,
      },
    });
  } catch (error) {
    console.error("[report/submit] failed to store report", {
      ipHash: ipHash.slice(0, 12),
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: "We couldn't submit your report. Please try again." },
      { status: 500 },
    );
  }

  await writeTrackingToken(report.reportToken);

  // Staff notification is best-effort and happens after the report is stored.
  const evidenceCount = await prisma.reportEvidence.count({ where: { reportId: report.id } });
  const webhookResult = await sendReportWebhook({
    reference: report.reference,
    id: report.id,
    category: report.reason,
    status: report.status,
    priority: report.priority,
    source: report.source,
    reportedPerson: report.reportedPerson,
    reportedUsername: report.reportedUsername,
    anonymous: report.anonymous,
    evidenceCount,
    linkCount: input.links.length,
    action: "submitted",
  });

  await prisma.report
    .update({
      where: { id: report.id },
      data: {
        webhookStatus: webhookResult.status,
        webhookError: (webhookResult.error ?? "").slice(0, 500),
        webhookSentAt: webhookResult.status === "SENT" ? new Date() : null,
        webhookAttempts: { increment: 1 },
      },
    })
    .catch((error) => {
      console.error("[report/submit] could not record webhook state", {
        reportId: report.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });

  await prisma.reportAuditLog.create({
    data: {
      reportId: report.id,
      action: webhookResult.status === "SENT" ? "WEBHOOK_SENT" : "WEBHOOK_FAILED",
      actorName: "System",
      detail:
        webhookResult.status === "SENT"
          ? "Staff notification delivered to Discord."
          : `Staff notification not delivered (${webhookResult.status}): ${(webhookResult.error ?? "unknown").slice(0, 200)}`,
    },
  });

  return NextResponse.json({
    success: true,
    reference: report.reference,
    reportToken: report.reportToken,
    trackingUrl: `/report/track/${report.reportToken}`,
    notification:
      webhookResult.status === "SENT"
        ? "sent"
        : webhookResult.status === "SKIPPED"
          ? "not-configured"
          : "queued",
    limits: {
      maxPerWindow: RATE_LIMIT.MAX_PER_WINDOW,
      descriptionMax: REPORT_LIMITS.DESCRIPTION_MAX,
      evidenceMaxFiles: REPORT_LIMITS.EVIDENCE_MAX_FILES,
    },
  });
}