import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_PER_WINDOW) return true;
  entry.count += 1;
  return false;
}

const VALID_REASONS = new Set([
  "HARASSMENT",
  "HATE_SPEECH",
  "NSFW",
  "SCAM",
  "IMPERSONATION",
  "RULE_VIOLATION",
  "BUG",
  "EVENT_ISSUE",
  "COMMUNITY_CONTENT",
  "OTHER",
]);

function generateReportToken(): string {
  return randomBytes(16).toString("hex");
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many reports. Please try again later.",
      },
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

  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const submissionId = String(payload.submissionId || "").trim();
  const reason = String(payload.reason || "").toUpperCase();
  const details = String(payload.details || "").trim();
  const reporterName = String(payload.reporterName || "").trim();
  const reporterEmail = String(payload.reporterEmail || "").trim();
  const anonymous = Boolean(payload.anonymous);

  if (!submissionId) {
    return NextResponse.json(
      { success: false, error: "Missing submission ID." },
      { status: 400 },
    );
  }

  if (!VALID_REASONS.has(reason)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid report reason." },
      { status: 400 },
    );
  }

  if (!details) {
    return NextResponse.json(
      { success: false, error: "Please provide details for your report." },
      { status: 400 },
    );
  }

  const submission = await prisma.communitySubmission.findUnique({
    where: { id: submissionId },
    select: { id: true },
  });

  if (!submission) {
    return NextResponse.json(
      { success: false, error: "Submission not found." },
      { status: 404 },
    );
  }

  const reportToken = generateReportToken();

  try {
    await prisma.communitySubmissionReport.create({
      data: {
        submissionId,
        reason,
        details,
        reporterName: anonymous ? "" : reporterName,
        reporterEmail: anonymous ? null : (reporterEmail || null),
        anonymous,
        reportToken,
        status: "RECEIVED",
      },
    });

    return NextResponse.json({
      success: true,
      reportToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[report/submit] failure", { ip, message });
    return NextResponse.json(
      {
        success: false,
        error: "Your report could not be submitted. Please try again.",
      },
      { status: 500 },
    );
  }
}