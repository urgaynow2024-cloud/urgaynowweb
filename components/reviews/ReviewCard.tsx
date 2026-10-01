"use client";

import { ReviewAvatar, StarRating } from "@/components/reviews/StarRating";
import { ReportButton } from "@/components/report/ReportModal";
import { formatRelativeTime, getPublicReviewerName } from "@/lib/reviews";

export type ReviewCardData = {
  id: string;
  displayName: string;
  showUsername: boolean;
  rating: number;
  content: string;
  createdAt: Date | string;
};

/**
 * A single approved community review.
 *
 * Only ever rendered for `status === "APPROVED"` rows. Submitted content is
 * plain text and is rendered as text — there is no path here that turns it into
 * HTML. Private fields (the reviewer's handle, moderation notes, staff identity)
 * are deliberately absent from the props the caller passes in.
 *
 * Client component because the report button opens a modal; the report itself
 * posts to the existing /api/report/submit endpoint.
 */
export function ReviewCard({ review }: { review: ReviewCardData }) {
  const reviewerName = getPublicReviewerName(review);
  const isAnonymous = reviewerName === "Anonymous";
  const postedAt = new Date(review.createdAt);

  return (
    <article className="card card-hover flex h-full flex-col p-6">
      <div className="flex items-start gap-3">
        <ReviewAvatar name={reviewerName} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h3 className="truncate text-base font-semibold text-ink-900 dark:text-ink-50">
              {reviewerName}
            </h3>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            {isAnonymous ? (
              <>Shared anonymously</>
            ) : (
              <time dateTime={postedAt.toISOString()}>{formatRelativeTime(review.createdAt)}</time>
            )}
          </p>
        </div>
      </div>

      <blockquote className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">
        {review.content}
      </blockquote>

      <div className="mt-5 flex items-center justify-end border-t border-ink-100 pt-3 dark:border-ink-800">
        <ReportButton
          contentType="COMMUNITY_REVIEW"
          contentId={review.id}
          contentTitle={`Community review from ${reviewerName}`}
          size="sm"
          variant="ghost"
        />
      </div>
    </article>
  );
}