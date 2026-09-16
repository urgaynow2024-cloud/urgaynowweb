import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Button, Card, StatusBadge } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { IconImages, IconUsers, IconCalendar } from "@/components/admin/ui/icons";

export const metadata: Metadata = {
  title: "Community Submissions",
  description: "Browse community-submitted artwork, avatars, screenshots, and more",
};

export const revalidate = 60;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CommunityPage() {
  const submissions = await prisma.communitySubmission.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <>
      <PageHeader
        title="Community Submissions"
        description="Artwork, avatars, screenshots, VRChat worlds, and more from our community."
      />
      <Container className="py-16">
        {submissions.length === 0 ? (
          <Card className="animate-fade-in">
            <div className="flex flex-col items-center py-16 text-center">
              <IconImages size={48} className="mx-auto mb-4 text-ink-300 dark:text-ink-600" />
              <h3 className="text-lg font-medium text-ink-800 dark:text-ink-100">No submissions yet</h3>
              <p className="mt-2 text-ink-500 dark:text-ink-400">Be the first to share your creations!</p>
              <Link href="/community/submit" className="mt-4">
                <Button size="sm">Submit content</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission, i) => (
              <Link key={submission.id} href={`/community/${submission.id}`} className="animate-fade-in">
                <Card hover className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="relative aspect-video overflow-hidden bg-ink-100 dark:bg-ink-800">
                    <Image
                      src={submission.imageUrl}
                      alt={submission.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white/0 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white/80 group-hover:opacity-100">
                      <StatusBadge tone="success">Published</StatusBadge>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold text-ink-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {submission.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
                      <span className="flex items-center gap-1">
                        <IconUsers size={12} />
                        {submission.submitterName || "Anonymous"}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconCalendar size={12} />
                        {formatDate(submission.publishedAt || submission.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconImages size={12} />
                        {submission.type}
                      </span>
                    </div>
                    {submission.description && (
                      <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2">
                        {submission.description}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}