import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { checkMemoryRateLimit, getClientIp, hashIp, fingerprint } from "@/lib/request-security";

export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "Bug Report",
  "Technical Problem",
  "Feature Request",
  "General Question",
  "Community / Discord",
  "Moderation / Safety",
  "Moderation Appeal",
  "Harassment / Report",
  "Report Content",
  "Account / Discord Issue",
  "Shop / Purchase",
  "Creator Support",
  "Content / Resources",
  "Feedback / Suggestions",
  "Partnership / Collaboration",
  "Privacy / Data Request",
  "Report a Website Issue",
  "Other",
];

const VALID_CONTACT_METHODS = ["discord", "email", "other"];

/** Short burst limit in front of the durable per-IP limit. */
const BURST_LIMIT = { WINDOW_MS: 60_000, MAX_PER_WINDOW: 10 };

/** Durable per-IP limit, backed by the stored (salted) IP hash. */
async function isOverRateLimit(ipHash: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 30 * 60 * 1000);
  const count = await safeQuery(
    () =>
      prisma.supportRequest.count({
        where: { reporterIpHash: ipHash, createdAt: { gte: windowStart } },
      }),
    0,
  );
  return count >= 5;
}

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return `UGN-${year}-${random}`;
}

/**
 * Resolve the configured support webhook. Prefers the runtime env var
 * DISCORD_REPORTS_WEBHOOK_URL, falling back to the DB setting
 * discordReportsWebhookUrl. The URL never leaves the server.
 */
async function resolveSupportWebhookUrl(): Promise<string> {
  const envUrl = process.env.DISCORD_REPORTS_WEBHOOK_URL;
  if (envUrl) return envUrl.trim();
  try {
    return (await getSetting("discordReportsWebhookUrl")).trim();
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const burst = checkMemoryRateLimit(
    `support-submit:${ipHash}`,
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

  const idempotencyKey = typeof payload.idempotencyKey === "string"
    ? payload.idempotencyKey.trim()
    : undefined;

  const category = String(payload.category || "").trim();
  const subject = String(payload.subject || "").trim();
  const description = String(payload.description || "").trim();
  const contactMethod = String(payload.contactMethod || "").trim();
  const contactInfo = String(payload.contactInfo || "").trim();

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { success: false, error: "Invalid category." },
      { status: 400 },
    );
  }

  if (!VALID_CONTACT_METHODS.includes(contactMethod)) {
    return NextResponse.json(
      { success: false, error: "Invalid contact method." },
      { status: 400 },
    );
  }

  if (!subject || subject.length > 120) {
    return NextResponse.json(
      { success: false, error: "Subject required (max 120 chars)." },
      { status: 400 },
    );
  }

  if (!description || description.length > 3000) {
    return NextResponse.json(
      { success: false, error: "Description required (max 3000 chars)." },
      { status: 400 },
    );
  }

  if (!contactInfo || contactInfo.length > 200) {
    return NextResponse.json(
      { success: false, error: "Contact information required (max 200 chars)." },
      { status: 400 },
    );
  }

  // Idempotent retry: the same submit token must never create a second ticket.
  if (idempotencyKey) {
    const existing = await prisma.supportRequest.findUnique({
      where: { idempotencyKey },
      select: { id: true, ticketNumber: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        ticketNumber: existing.ticketNumber,
        message: "This submission has already been registered.",
      });
    }
  }

  // Durable rate limit (per IP, 30-minute window).
  if (await isOverRateLimit(ipHash)) {
    return NextResponse.json(
      {
        success: false,
        error: "You have reached the limit of 5 support requests per 30 minutes. Please try again later.",
      },
      { status: 429 },
    );
  }

  // Duplicate submission protection (same IP, same details).
  const dedupeHash = fingerprint([
    ipHash,
    category,
    subject,
    description.slice(0, 400).toLowerCase(),
    contactMethod,
    contactInfo,
  ]);
  const recentDuplicate = await prisma.supportRequest.findFirst({
    where: {
      dedupeHash,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true, ticketNumber: true },
  });
  if (recentDuplicate) {
    return NextResponse.json({
      success: false,
      duplicate: true,
      error: "You already submitted this request. We have not created a duplicate ticket.",
      ticketNumber: recentDuplicate.ticketNumber,
    }, { status: 409 });
  }

  let ticketNumber: string;
  let attempts = 0;
  do {
    ticketNumber = generateTicketNumber();
    const existing = await prisma.supportRequest.findUnique({
      where: { ticketNumber },
      select: { id: true },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    return NextResponse.json(
      { success: false, error: "Could not generate unique ticket number. Please try again." },
      { status: 500 },
    );
  }

  let created: any;
  try {
    created = await prisma.supportRequest.create({
      data: {
        ticketNumber,
        category,
        subject,
        description,
        contactMethod,
        contactInfo,
        status: "OPEN",
        priority: "NORMAL",
        attachments: "[]",
        idempotencyKey,
        dedupeHash,
        webhookStatus: "PENDING",
      },
      select: {
        id: true,
        ticketNumber: true,
        category: true,
        subject: true,
        description: true,
        contactMethod: true,
        contactInfo: true,
        createdAt: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[support/contact] failed to store ticket", {
      ipHash: ipHash.slice(0, 12),
      message,
    });
    return NextResponse.json(
      { success: false, error: "Could not submit request. Please try again." },
      { status: 500 },
    );
  }

  // Discord staff notification (best-effort, never fails the submission).
  const webhookResult = await sendSupportWebhook({
    ticketNumber: created.ticketNumber,
    category: created.category,
    subject: created.subject,
    description: created.description,
    contactMethod: created.contactMethod,
    contactInfo: created.contactInfo,
    createdAt: created.createdAt,
  });

  await prisma.supportRequest
    .update({
      where: { id: created.id },
      data: {
        webhookStatus: webhookResult.status,
        webhookError: (webhookResult.error ?? "").slice(0, 500),
        webhookSentAt: webhookResult.status === "SENT" ? new Date() : null,
        webhookAttempts: { increment: 1 },
      },
    })
    .catch((error) => {
      console.error("[support/contact] could not record webhook state", {
        ticketId: created.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });

  return NextResponse.json({
    success: true,
    ticketNumber: created.ticketNumber,
    notification: webhookResult.status === "SENT" ? "sent" : "queued",
  });
}

/**
 * Send the staff notification for a support ticket via Discord webhook.
 * Never throws: the return value is the accurate delivery state.
 */
async function sendSupportWebhook(input: {
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  contactMethod: string;
  contactInfo: string;
  createdAt: Date;
}): Promise<{ status: string; error?: string }> {
  let webhookUrl: string;
  try {
    webhookUrl = await resolveSupportWebhookUrl();
  } catch {
    return { status: "SKIPPED", error: "No support webhook is configured" };
  }

  if (!webhookUrl) {
    return { status: "SKIPPED", error: "No support webhook is configured" };
  }

  // Validate that the URL is a Discord webhook before sending.
  try {
    const url = new URL(webhookUrl);
    if (url.protocol !== "https:") return { status: "FAILED", error: "Webhook URL must use HTTPS" };
    const allowedHosts = new Set([
      "discord.com",
      "discordapp.com",
      "canary.discord.com",
      "ptb.discord.com",
    ]);
    if (!allowedHosts.has(url.hostname.toLowerCase())) {
      return { status: "FAILED", error: "Configured webhook URL is not a Discord webhook" };
    }
    if (!url.pathname.startsWith("/api/webhooks/")) {
      return { status: "FAILED", error: "Configured webhook URL is not a Discord webhook" };
    }
  } catch {
    return { status: "FAILED", error: "Configured webhook URL is not parseable" };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 10_000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        content: `📬 **New support ticket: ${input.ticketNumber}**`,
        embeds: [{
          title: input.subject,
          description: input.description.slice(0, 4000),
          color: 0x750787,
          fields: [
            { name: "Ticket", value: input.ticketNumber, inline: true },
            { name: "Category", value: input.category, inline: true },
            { name: "Contact", value: `${input.contactMethod}: ${input.contactInfo}`, inline: true },
          ],
          timestamp: input.createdAt.toISOString(),
          footer: { text: "Ur Gay Now Support" },
        }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        status: "FAILED",
        error: `Discord webhook error (${response.status}): ${body.slice(0, 180)}`,
      };
    }

    return { status: "SENT" };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { status: "FAILED", error: "Discord webhook request timed out" };
    }
    return {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Unknown webhook error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
