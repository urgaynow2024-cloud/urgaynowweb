import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { checkMemoryRateLimit, getClientIp, hashIp, fingerprint } from "@/lib/request-security";
import { sendPartnershipWebhook } from "@/lib/partnership-webhook";

export const runtime = "nodejs";

const BURST_LIMIT = { WINDOW_MS: 60_000, MAX_PER_WINDOW: 10 };
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const burst = checkMemoryRateLimit(
    `partnership-apply:${ipHash}`,
    BURST_LIMIT.MAX_PER_WINDOW,
    BURST_LIMIT.WINDOW_MS,
  );
  if (!burst.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please wait a minute and try again." },
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

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const discord = String(payload.discord || "").trim();
  const website = String(payload.website || "").trim();
  const description = String(payload.description || "").trim();
  const idempotencyKey = typeof payload.idempotencyKey === "string"
    ? payload.idempotencyKey.trim()
    : undefined;

  // Validate required fields
  if (!name || name.length > 200) {
    return NextResponse.json(
      { success: false, error: "Name is required (max 200 chars)." },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: "A valid email address is required." },
      { status: 400 },
    );
  }

  if (discord && discord.length > 100) {
    return NextResponse.json(
      { success: false, error: "Discord username must be 100 characters or fewer." },
      { status: 400 },
    );
  }

  if (website && website.length > 500) {
    return NextResponse.json(
      { success: false, error: "Website must be 500 characters or fewer." },
      { status: 400 },
    );
  }

  if (!description || description.length < 10) {
    return NextResponse.json(
      { success: false, error: "Description is required (min 10 chars)." },
      { status: 400 },
    );
  }
  if (description.length > 5000) {
    return NextResponse.json(
      { success: false, error: "Description must be 5000 characters or fewer." },
      { status: 400 },
    );
  }

  // Idempotent retry: same submit token must never create a second application.
  if (idempotencyKey) {
    const existing = await prisma.partnerApplication.findUnique({
      where: { idempotencyKey: idempotencyKey },
      select: { id: true, name: true, status: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        id: existing.id,
        name: existing.name,
        status: existing.status,
        message: "This application has already been registered.",
      });
    }
  }

  // Durable rate limit per IP (30-minute window).
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const recentCount = await safeQuery(
    () =>
      prisma.partnerApplication.count({
        where: { createdAt: { gte: windowStart } },
      }),
    0,
  );
  if (recentCount >= 5) {
    return NextResponse.json(
      { success: false, error: "Too many applications from this address. Please try again later." },
      { status: 429 },
    );
  }

  // Duplicate submission protection (same email + similar description).
  const dedupeHash = fingerprint([
    ipHash,
    email,
    name,
    description.slice(0, 400).toLowerCase(),
  ]);
  const recentDuplicate = await prisma.partnerApplication.findFirst({
    where: {
      dedupeHash,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    select: { id: true, name: true, status: true },
  });
  if (recentDuplicate) {
    return NextResponse.json({
      success: false,
      duplicate: true,
      error: "You already submitted a partnership application with these details.",
      id: recentDuplicate.id,
      name: recentDuplicate.name,
      status: recentDuplicate.status,
    }, { status: 409 });
  }

  let application: any;
  try {
    application = await prisma.partnerApplication.create({
      data: {
        name,
        email,
        discord,
        website,
        description,
        status: "PENDING",
        idempotencyKey,
        dedupeHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        discord: true,
        website: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[partnership/apply] failed to store application", {
      ipHash: ipHash.slice(0, 12),
      message,
    });
    return NextResponse.json(
      { success: false, error: "We couldn't submit your application. Please try again." },
      { status: 500 },
    );
  }

  // Discord staff notification (best-effort, never fails the submission).
  await sendPartnershipWebhook({
    id: application.id,
    name: application.name,
    email: application.email,
    discord: application.discord || undefined,
    website: application.website || undefined,
    description: application.description,
    status: application.status,
    action: "submitted",
  }).catch((error) => {
    console.error("[partnership/apply] webhook notification failed", {
      applicationId: application.id,
      message: error instanceof Error ? error.message : String(error),
    });
  });

  return NextResponse.json({
    success: true,
    id: application.id,
    name: application.name,
    status: application.status,
    notification: "queued",
  });
}
