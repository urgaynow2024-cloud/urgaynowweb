import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Card } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { ListSkeleton } from "@/components/Skeleton";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RatingDistributionRow, RatingSummaryBar, StarRating } from "@/components/reviews/StarRating";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { summariseRatings } from "@/lib/reviews";

const PAGE_SIZE = 9;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Community Reviews",
  description:
    "Read what members of the Ur Gay Now community say about their experience, and share your own review.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Community Reviews · Ur Gay Now",
    description: "Real reviews from members of the Ur Gay Now community.",
    url: "/reviews",
  },
};

/**
 * Approved reviews are the only rows this page can select. PENDING, REJECTED and
 * HIDDEN rows are never fetched, so private moderation state, staff notes and
 * reviewer handles cannot leak through this route.
 */
const PUBLIC_REVIEW_SELECT = {
  id: true,
  displayName: true,
  showUsername: true,
  rating: true,
  content: true,
  createdAt: true,
} as const;

async function ApprovedReviews({ page }: { page: number }) {
  const [items, total, allRatings] = await Promise.all([
    safeQuery(
      () =>
        prisma.review.findMany({
          where: { status: "APPROVED" },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: PUBLIC_REVIEW_SELECT,
        }),
      [],
    ),
    safeQuery(() => prisma.review.count({ where: { status: "APPROVED" } }), 0),
    safeQuery(
      () => prisma.review.findMany({ where: { status: "APPROVED" }, select: { rating: true } }),
      [],
    ),
  ]);

  const summary = summariseRatings(allRatings);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-12">
      {summary.total > 0 && (
        <Card className="p-6 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:text-left">
              <p className="text-5xl font-bold text-ink-900 dark:text-ink-50">{summary.average.toFixed(1)}</p>
              <StarRating
                rating={Math.round(summary.average)}
                className="mt-2 justify-center sm:justify-start"
              />
              <div className="mt-2">
                <RatingSummaryBar average={summary.average} total={summary.total} />
              </div>
            </div>

            <ul className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingDistributionRow
                  key={stars}
                  stars={stars}
                  count={summary.distribution[stars - 1]}
                  total={summary.total}
                />
              ))}
            </ul>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon="⭐"
          title={summary.total === 0 ? "No reviews yet" : "No reviews on this page"}
          description={
            summary.total === 0
              ? "Be the first to share your experience of Ur Gay Now with the community."
              : "Try another page to read more community reviews."
          }
          action={
            summary.total === 0 ? (
              <Link href="#write-a-review" className="btn-primary">
                Write the first review
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((review, index) => (
              <ScrollFadeIn key={review.id} delay={index * 80}>
                <ReviewCard review={review} />
              </ScrollFadeIn>
            ))}
          </StaggeredList>

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination page={page} totalPages={totalPages} basePath="/reviews" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  return (
    <>
      <PageHeader
        title="Community Reviews"
        description="Real experiences from the Ur Gay Now community. Every review is read by our staff team before it appears here."
      />

      <Container className="py-16">
        <div className="space-y-12">
          <Alert tone="info" title="A community space, not a product page">
            These reviews come from VRChat and Discord members of Ur Gay Now, and they are moderated by our staff team.
            Anything that breaks our community rules can be removed. If you spot a problem with a review, use the
            report button on it.
          </Alert>

          <Suspense fallback={<ListSkeleton rows={6} />}>
            <ApprovedReviews page={page} />
          </Suspense>

          <section id="write-a-review" className="scroll-mt-24">
            <div className="mx-auto max-w-2xl">
              <h2 className="section-title-accent mb-2 text-2xl sm:text-3xl">Share your experience</h2>
              <p className="mb-8 text-ink-600 dark:text-ink-300">
                Been part of Ur Gay Now? Tell the community what it&apos;s been like for you.
              </p>

              <Card className="p-6 sm:p-8">
                <ReviewForm />
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}