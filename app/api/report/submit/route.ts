import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import {
  VALID_REASONS,
  VALID_CONTENT_TYPES,
  RATE_LIMIT,
  getReasonLabel,
} from "@/lib/reports";

export const runtime = "nodejs";

async function checkRateLimit(ip: string, userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT.WINDOW_MS);
  
  const [ipCount, userCount] = await Promise.all([
    prisma.report.count({
      where: {
        createdAt: { gte: windowStart },
        reporterId: { not: userId },
      },
    }),
    prisma.report.count({
      where: {
        createdAt: { gte: windowStart },
        reporterId: userId,
      },
    }),
  ]);

  return ipCount >= RATE_LIMIT.MAX_PER_WINDOW || userCount >= RATE_LIMIT.MAX_PER_WINDOW;
}

async function notifyStaffOfNewReport(report: {
  id: string;
  reportToken: string;
  contentType: string;
  contentId: string;
  reason: string;
  description: string;
}) {
  try {
    const webhookUrl = (await getSetting("discordReportsWebhookUrl")).trim();
    if (!webhookUrl) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
    const reportUrl = `${siteUrl}/admin/reports/${report.id}`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🚨 **New report submitted**",
        embeds: [{
          title: `Report #${report.id.slice(0, 8)}`,
          description: report.description.slice(0, 4000),
          color: 0x750787,
          fields: [
            { name: "Reason", value: getReasonLabel(report.reason), inline: true },
            { name: "Content", value: `${report.contentType}: ${report.contentId}`, inline: true },
            { name: "Priority", value: "Normal", inline: true },
          ],
          timestamp: new Date().toISOString(),
          url: reportUrl,
          footer: { text: "Ur Gay Now Reports" },
        }],
      }),
    });
  } catch {
    // Don't fail the report submission if notification fails
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "You need to sign in before submitting a report." },
      { status: 401 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (await checkRateLimit(ip, session.sub)) {
    return NextResponse.json(
      { success: false, error: "Too many reports. Please try again later." },
      { status: 429 },
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const contentType = String(payload.contentType || "").toUpperCase() as string;
  const contentId = String(payload.contentId || "").trim();
  const reason = String(payload.reason || "").toUpperCase();
  const description = String(payload.description || "").trim();
  const reporterName = String(payload.reporterName || "").trim();
  const reporterEmail = String(payload.reporterEmail || "").trim();
  const anonymous = Boolean(payload.anonymous);

  if (!VALID_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { success: false, error: "Invalid content type." },
      { status: 400 },
    );
  }

  if (!contentId) {
    return NextResponse.json(
      { success: false, error: "Missing content ID." },
      { status: 400 },
    );
  }

  if (!VALID_REASONS.has(reason as any)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid report reason." },
      { status: 400 },
    );
  }

  if (!description) {
    return NextResponse.json(
      { success: false, error: "Please provide details for your report." },
      { status: 400 },
    );
  }

  const existing = await prisma.report.findFirst({
    where: {
      reporterId: session.sub,
      contentType,
      contentId,
      reason,
      status: { in: ["OPEN", "IN_REVIEW"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { success: false, error: "You already have an open report for this content." },
      { status: 409 },
    );
  }

  let reportedUserId: string | null = null;
  let reportedUsername: string | null = null;

  try {
    if (contentType === "COMMUNITY_SUBMISSION") {
      const submission = await prisma.communitySubmission.findUnique({
        where: { id: contentId },
        select: { submitterName: true },
      });
      reportedUsername = submission?.submitterName ?? null;
    } else if (contentType === "GALLERY_IMAGE") {
      const image = await prisma.galleryImage.findUnique({
        where: { id: contentId },
        select: { submitterName: true },
      });
      reportedUsername = image?.submitterName ?? null;
    } else if (contentType === "STAFF_PROFILE") {
      const staff = await prisma.staff.findUnique({
        where: { id: contentId },
        select: { name: true },
      });
      reportedUsername = staff?.name ?? null;
    }
  } catch {
    /* content lookup is optional */
  }

  try {
    const created = await prisma.report.create({
      data: {
        contentType,
        contentId,
        reporterId: session.sub,
        reporterName: anonymous ? "" : (reporterName || session.name),
        reporterEmail: anonymous ? null : (reporterEmail || null),
        anonymous,
        reportedUserId,
        reportedUsername,
        reason,
        description,
        status: "OPEN",
        priority: "NORMAL",
      },
    });

    await notifyStaffOfNewReport(created);

    return NextResponse.json({ success: true, reportToken: created.reportToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[report/submit] failure", { ip, message });
    return NextResponse.json(
      { success: false, error: "Your report could not be submitted. Please try again." },
      { status: 500 },
    );
  }
}
