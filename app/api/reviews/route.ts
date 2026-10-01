import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkMemoryRateLimit, getClientIp, hashIp } from "@/lib/request-security";
import {
  checkReviewAbuse,
  validateReviewSubmission,
  type ReviewSubmissionInput,
} from "@/lib/reviews";

export const runtime = "nodejs";

/**
 * Public review submission.
 *
 * Reviews are never published directly. Every accepted submission is stored as
 * PENDING (or REJECTED when it trips the abuse check) and only becomes visible
 * on /reviews after a staff member approves it.
 */

/** Short-term burst guard, per IP hash. */
const BURST_LIMIT = { WINDOW_MS: 60_000, MAX_PER_WINDOW: 5 };

/** Durable guard, counted against stored reviews for the same IP hash. */
const DURABLE_LIMIT = { WINDOW_MS: 60 * 60 * 1000, MAX_PER_WINDOW: 5 };

/** Abuse score at or above which a review is rejected without staff review. */
const AUTO_REJECT_SPAM_SCORE = 5;

async function isOverDurableLimit(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - DURABLE_LIMIT.WINDOW_MS);
  const count = await prisma.review.count({
    where: { submittedIpHash: ipHash, createdAt: { gte: since } },
  });
  return count >= DURABLE_LIMIT.MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const burst = checkMemoryRateLimit(
    `review-submit:${ipHash}`,
    BURST_LIMIT.MAX_PER_WINDOW,
    BURST_LIMIT.WINDOW_MS,
  );
  if (!burst.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let payload: ReviewSubmissionInput;
  try {
    payload = (await req.json()) ?? {};
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const validation = validateReviewSubmission(payload);
  if (!validation.ok) {
    if ("spam" in validation && validation.spam) {
      // Honeypot tripped. Answer as if it succeeded so the bot learns nothing,
      // but store nothing at all.
      console.warn("[reviews] honeypot tripped", { ipHash: ipHash.slice(0, 12) });
      return NextResponse.json({ success: true, status: "pending" });
    }
    const message = "error" in validation ? validation.error : "Invalid review.";
    const field = "field" in validation ? validation.field : undefined;
    return NextResponse.json({ success: false, error: message, field }, { status: 400 });
  }

  const input = validation.value;

  const abuse = checkReviewAbuse({
    displayName: input.displayName,
    handle: input.handle,
    content: input.content,
  });

  // Clear abuse is rejected outright. Everything else — including anything
  // merely suspicious — still goes to staff, who make the final call.
  const rejected = abuse.abusive || abuse.score >= AUTO_REJECT_SPAM_SCORE;

  try {
    if (await isOverDurableLimit(ipHash)) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached the limit of ${DURABLE_LIMIT.MAX_PER_WINDOW} reviews per hour. Please try again later.`,
        },
        { status: 429 },
      );
    }

    const review = await prisma.review.create({
      data: {
        status: rejected ? "REJECTED" : "PENDING",
        rating: input.rating,
        content: input.content,
        displayName: input.displayName,
        discordUsername: input.handle,
        showUsername: input.showUsername,
        submittedIpHash: ipHash,
        spamScore: abuse.score,
        reviewedAt: rejected ? new Date() : null,
        moderationNote: abuse.reasons.join("; ").slice(0, 500),
        moderationLogs: {
          create: {
            action: rejected ? "REJECTED" : "SUBMITTED",
            note: abuse.reasons.join("; ").slice(0, 500),
            fromStatus: "",
            toStatus: rejected ? "REJECTED" : "PENDING",
          },
        },
      },
      select: { id: true, status: true },
    });

    if (abuse.score > 0) {
      console.warn("[reviews] flagged for moderation", {
        id: review.id,
        spamScore: abuse.score,
        abusive: abuse.abusive,
        reasons: abuse.reasons,
      });
    }

    return NextResponse.json({ success: true, status: review.status }, { status: 201 });
  } catch (error) {
    // Never leak a database or driver error to the public.
    console.error("[reviews] submission failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "We couldn't save your review right now. Please try again shortly." },
      { status: 500 },
    );
  }
}