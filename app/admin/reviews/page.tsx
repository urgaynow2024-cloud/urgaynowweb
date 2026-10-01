import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  approveReview,
  deleteReview,
  hideReview,
  rejectReview,
  restoreReview,
} from "@/app/admin/reviews/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import { ListSkeleton } from "@/components/Skeleton";
import { StarRating } from "@/components/reviews/StarRating";
import {
  REVIEW_STATUSES,
  formatRelativeTime,
  getReviewStatusLabel,
  getReviewStatusTone,
} from "@/lib/reviews";
import {
  IconCheck,
  IconEye,
  IconFlag,
  IconStar,
  IconTrash,
  IconX,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Community Reviews", robots: { index: false, follow: false } };

export const revalidate = 60;

/** Queue tabs, in the order staff work through them. */
const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "HIDDEN", label: "Hidden" },
  { key: "REJECTED", label: "Rejected" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string | undefined): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

/**
 * Two-step permanent delete. `<details>` gives the confirmation step without a
 * client component and without a single-click destructive path. The panel is
 * absolutely positioned so it does not disturb the row layout, and the whole
 * thing is keyboard-reachable via <summary>.
 */
function DeleteReviewForm({ reviewId, reviewer }: { reviewId: string; reviewer: string }) {
  return (
    <details className="group relative">
      <summary
        className="btn-ghost btn-sm inline-flex cursor-pointer list-none"
        aria-label={`Permanently delete the review by ${reviewer}`}
      >
        <IconTrash size={14} /> Delete
      </summary>
      <form
        action={deleteReview.bind(null, reviewId)}
        className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-ink-200 bg-white p-3 shadow-card-premium-hover dark:border-ink-700 dark:bg-ink-900"
      >
        <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">
          Delete this review permanently?
        </p>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          This removes the review and its moderation history. Use Hide instead if
          you only want to take it down.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button type="submit" className="btn-danger btn-sm">
            <IconTrash size={14} /> Delete
          </button>
          <span className="text-xs text-ink-400">press Delete again to confirm</span>
        </div>
      </form>
    </details>
  );
}

async function ReviewsContent({ tab }: { tab: TabKey }) {
  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: { status: tab },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        moderationLogs: {
          orderBy: { performedAt: "desc" },
          take: 3,
          include: { staff: { select: { name: true } } },
        },
      },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (status: string) => counts.find((c) => c.status === status)?._count._all ?? 0;

  const stats = [
    { label: "Pending review", value: countFor("PENDING"), icon: <IconStar size={20} />, accent: "amber" as const, hint: "Waiting on a decision" },
    { label: "Approved", value: countFor("APPROVED"), icon: <IconCheck size={20} />, accent: "emerald" as const, hint: "Live on /reviews" },
    { label: "Hidden", value: countFor("HIDDEN"), icon: <IconEye size={20} />, accent: "brand" as const, hint: "Taken down but kept" },
    { label: "Rejected", value: countFor("REJECTED"), icon: <IconX size={20} />, accent: "red" as const, hint: "Never published" },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} hint={s.hint} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <nav aria-label="Review status filter" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
              aria-current={tab === t.key ? "page" : undefined}
              className={`badge ${tab === t.key ? "badge-brand" : "badge-neutral"}`}
            >
              {t.label}
              <span className="ml-1 opacity-70">{countFor(t.key)}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title={`${REVIEW_STATUSES[tab].label} reviews`}
            subtitle="Reviews are plain text. Nothing here is rendered as HTML."
            icon={<IconStar size={18} />}
            actions={
              <Link href="/reviews" className="btn-ghost btn-sm">
                View public page
              </Link>
            }
          />
          <CardBody className="p-0">
            {reviews.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconStar size={26} />}
                  title={`No ${REVIEW_STATUSES[tab].label.toLowerCase()} reviews`}
                  description={
                    tab === "PENDING"
                      ? "Nothing waiting on a decision right now."
                      : "No reviews have this status yet."
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {reviews.map((review) => (
                  <li key={review.id} className="px-5 py-4 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                            {review.displayName || "Anonymous"}
                          </p>
                          <StarRating rating={review.rating} size="sm" />
                          <StatusPill tone={getReviewStatusTone(review.status)}>
                            {getReviewStatusLabel(review.status)}
                          </StatusPill>
                          {review.spamScore > 0 && (
                            <StatusPill tone="warning">Spam score {review.spamScore}</StatusPill>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-ink-400">
                          {formatRelativeTime(review.createdAt)}
                          {review.discordUsername && (
                            <>
                              {" · "}
                              <span title="Visible to staff only">Discord/VRChat: {review.discordUsername}</span>
                            </>
                          )}
                          {!review.showUsername && (
                            <>
                              {" · "}
                              <span>Displayed anonymously</span>
                            </>
                          )}
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                          {review.content}
                        </p>

                        {review.moderationNote && (
                          <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                            <span className="font-medium">Moderation note:</span> {review.moderationNote}
                          </p>
                        )}

                        {review.moderationLogs.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-xs text-ink-400">
                            {review.moderationLogs.map((log) => (
                              <li key={log.id}>
                                {log.action.replace(/_/g, " ").toLowerCase()}
                                {log.staff && ` by ${log.staff.name}`}
                                {log.note && ` — ${log.note}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {review.status !== "APPROVED" && (
                          <form action={approveReview.bind(null, review.id)}>
                            <button type="submit" className="btn-success btn-sm">
                              <IconCheck size={14} /> Approve
                            </button>
                          </form>
                        )}

                        {review.status === "APPROVED" && (
                          <form action={hideReview.bind(null, review.id)}>
                            <input type="hidden" name="reason" value="Hidden by staff" />
                            <button type="submit" className="btn-secondary btn-sm">
                              <IconEye size={14} /> Hide
                            </button>
                          </form>
                        )}

                        {review.status === "HIDDEN" && (
                          <form action={restoreReview.bind(null, review.id)}>
                            <button type="submit" className="btn-secondary btn-sm">
                              <IconEye size={14} /> Restore
                            </button>
                          </form>
                        )}

                        {review.status !== "REJECTED" && (
                          <form action={rejectReview.bind(null, review.id)} className="flex items-center gap-1">
                            <input
                              type="text"
                              name="reason"
                              placeholder="Reason"
                              maxLength={500}
                              aria-label={`Rejection reason for review by ${review.displayName || "anonymous"}`}
                              className="input hidden h-8 w-36 text-xs sm:block"
                            />
                            <button type="submit" className="btn-danger btn-sm">
                              <IconX size={14} /> Reject
                            </button>
                          </form>
                        )}

                        {/* Two-step delete: the first click reveals a
                            confirmation rather than destroying the record on a
                            single misclick. */}
                        <DeleteReviewForm reviewId={review.id} reviewer={review.displayName || "anonymous"} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin();

  const tab: TabKey = isTabKey(searchParams.status) ? searchParams.status : "PENDING";

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Reviews" }]}
        title="Community Reviews"
        description="Approve, reject, or hide community reviews before they appear on the public reviews page."
        actions={
          <Link href="/admin/reports?type=COMMUNITY_REVIEW" className="btn-secondary btn-sm">
            <IconFlag size={14} /> Reported reviews
          </Link>
        }
      />

      <Suspense fallback={<ListSkeleton rows={8} />}>
        <ReviewsContent tab={tab} />
      </Suspense>
    </div>
  );
}