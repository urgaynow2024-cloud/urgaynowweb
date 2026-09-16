import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Card, CardBody, CardHeader, StatusBadge } from "@/components/ui";
import { ReportForm } from "@/components/report/ReportForm";
import Image from "next/image";
import { IconFlag } from "@/components/admin/ui/icons";

export const metadata: Metadata = {
  title: "Community Submission",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CommunitySubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.communitySubmission.findUnique({
    where: { id },
  });

  if (!submission || !submission.published) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={submission.title}
        description={`Submitted by ${submission.submitterName || "Anonymous"} · ${formatDate(submission.createdAt)}`}
      />
      <Container className="max-w-2xl py-12 sm:py-16">
        <Card className="animate-fade-in">
          <CardHeader
            title={submission.title}
            subtitle={`${submission.type} · ${submission.submitterName || "Anonymous"} · ${formatDate(submission.createdAt)}`}
          />
          <CardBody className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800 rounded-xl">
              <Image
                src={submission.imageUrl}
                alt={submission.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>

            {submission.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-ink-700 dark:text-ink-300 whitespace-pre-wrap">{submission.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-ink-100 dark:border-ink-800">
              <StatusBadge tone="success">Published</StatusBadge>
              <span className="text-sm text-ink-500 dark:text-ink-400">
                Type: {submission.type}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-6 animate-fade-in">
          <CardHeader
            title="Report this submission"
            subtitle="If this content violates our guidelines, please let us know"
            icon={<IconFlag size={18} />}
          />
          <CardBody>
            <ReportForm submissionId={submission.id} submissionTitle={submission.title} />
          </CardBody>
        </Card>
      </Container>
    </>
  );
}