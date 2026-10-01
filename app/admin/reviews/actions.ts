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

/**
 * Resolves the signed-in moderator to a `Staff` row.
 *
 * `Review.reviewedBy` and `ReviewModerationLog.performedBy` are foreign keys to
 * `Staff.id` (a cuid), but the session subject is the value of `ADMIN_USERNAME`
 * — see `createSession()` in lib/auth.ts. Those are different identifiers, so
 * writing `session.sub` straight into a foreign key raises a constraint
 * violation and fails the whole action.
 *
 * Returning `null` when there is no match is the correct outcome, not a silent
 * failure: the action still succeeds and is still audited, it just does not
 * attribute the decision to a staff profile. This mirrors the community
 * submission actions in app/admin/community/actions.ts, which deliberately
 * leave `performedBy` unset for the same reason.
 */
async function resolveModeratorStaffId(sub: string): Promise<string | null> {
  const staff = await prisma.staff.findFirst({
    where: {
      OR: [{ name: { equals: sub, mode: "insensitive" } }, { vrchatUsername: sub }],
    },
    select: { id: true },
  });
  return staff?.id ?? null;
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

  const performedBy = await resolveModeratorStaffId(session.sub);
  const safeNote = note.slice(0, REVIEW_LIMITS.NOTE_MAX);

  // Both writes must succeed together. Previously the status update committed
  // and only then did the audit log run, so a failure between them left a review
  // approved with no record of who approved it or why.
  await prisma.$transaction([
    prisma.review.update({
      where: { id: reviewId },
      data: {
        status: nextStatus,
        reviewedAt: new Date(),
        reviewedBy: performedBy,
        moderationNote: safeNote,
      },
    }),
    prisma.reviewModerationLog.create({
      data: {
        reviewId,
        action,
        fromStatus: review.status,
        toStatus: nextStatus,
        note: safeNote,
        performedBy,
      },
    }),
  ]);

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

/**
 * Permanently removes a review. This is a hard delete: `ReviewModerationLog`
 * cascades on delete, so the audit trail for that review goes with it.
 *
 * Prefer `hideReview` when the goal is to take something down — hiding keeps the
 * record and its moderation history. Delete is for removing content that should
 * not be retained at all.
 */
export async function deleteReview(reviewId: string, formData: FormData) {
  const session = await requireAdmin();
  const reason = sanitizeReviewLine(formData.get("reason"), REVIEW_LIMITS.NOTE_MAX);

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true },
  });
  if (!review) return;

  await prisma.review.delete({ where: { id: reviewId } });

  // The moderation log cascades with the review, so record the deletion against
  // the admin dashboard's own audit trail instead.
  console.warn(
    `[admin/reviews] review ${reviewId} permanently deleted by ${session.sub}${reason ? ` — ${reason}` : ""}`,
  );

  revalidateReviewSurfaces();
}