"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { REVIEW_LIMITS, sanitizeReviewLine, type ReviewStatusKey } from "@/lib/reviews";

/**
 * Staff moderation actions for community reviews.
 *
 * These use the existing staff session and permission model — `requireAdmin()`
 * plus the same `ugn_session` cookie and `/admin/*` middleware gate as the rest
 * of the dashboard. No separate admin system or permission table is introduced.
 */

async function logModeration(params: {
  reviewId: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  note: string;
  performedBy: string | undefined;
}) {
  await prisma.reviewModerationLog.create({
    data: {
      reviewId: params.reviewId,
      action: params.action,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      note: params.note.slice(0, REVIEW_LIMITS.NOTE_MAX),
      performedBy: params.performedBy ?? null,
    },
  });
}

function revalidateReviewSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/moderation");
}

async function applyStatus(
  reviewId: string,
  nextStatus: ReviewStatusKey,
  action: string,
  note: string,
) {
  const session = await requireAdmin();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, status: true },
  });
  if (!review) return;

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: nextStatus,
      reviewedAt: new Date(),
      reviewedBy: session.sub,
      moderationNote: note.slice(0, REVIEW_LIMITS.NOTE_MAX),
    },
  });

  await logModeration({
    reviewId,
    action,
    fromStatus: review.status,
    toStatus: nextStatus,
    note,
    performedBy: session.sub,
  });

  revalidateReviewSurfaces();
}

export async function approveReview(reviewId: string) {
  await applyStatus(reviewId, "APPROVED", "APPROVED", "");
}

export async function rejectReview(reviewId: string, formData: FormData) {
  const reason = sanitizeReviewLine(formData.get("reason"), REVIEW_LIMITS.NOTE_MAX);
  await applyStatus(reviewId, "REJECTED", "REJECTED", reason);
}

/** Takes a currently approved review down without deleting the original. */
export async function hideReview(reviewId: string, formData: FormData) {
  const reason = sanitizeReviewLine(formData.get("reason"), REVIEW_LIMITS.NOTE_MAX);
  await applyStatus(reviewId, "HIDDEN", "HIDDEN", reason);
}

/** Returns a hidden review to the moderation queue. */
export async function restoreReview(reviewId: string) {
  await applyStatus(reviewId, "PENDING", "RESTORED", "Returned to the moderation queue");
}