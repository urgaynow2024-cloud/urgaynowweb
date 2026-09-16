import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Card, CardBody, CardHeader, StatusBadge } from "@/components/ui";
import {
  IconCalendar,
  IconInbox,
  IconShield,
  IconUsers,
  IconClock,
} from "@/components/admin/ui/icons";

export const metadata: Metadata = {
  title: "Track Report",
  description: "Check the status of your submitted report",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  switch (status) {
    case "RECEIVED":
      return "brand";
    case "UNDER_REVIEW":
      return "warning";
    case "ACTION_TAKEN":
      return "success";
    case "RESOLVED":
      return "success";
    case "DISMISSED":
      return "neutral";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export default async function TrackReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const report = await prisma.communitySubmissionReport.findUnique({
    where: { reportToken: token },
    include: {
      submission: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Track Report"
        description="Check the status of your submitted report"
      />
      <Container className="max-w-2xl py-12 sm:py-16">
        <Card className="animate-fade-in">
          <CardHeader title="Report Status" icon={<IconShield size={18} />} />
          <CardBody className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge tone={getStatusColor(report.status)}>
                {getStatusLabel(report.status)}
              </StatusBadge>
              <span className="text-sm text-ink-500 dark:text-ink-400">
                Reference: <code className="font-mono text-ink-700 dark:text-ink-200">{token.slice(0, 12)}…</code>
              </span>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                  <IconCalendar size={14} /> Submitted
                </dt>
                <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                  {formatDateTime(report.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                  <IconClock size={14} /> Last Updated
                </dt>
                <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                  {formatDateTime(report.updatedAt)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                  <IconInbox size={14} /> Category
                </dt>
                <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                  {report.reason.replace(/_/g, " ")}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                  <IconShield size={14} /> Anonymous
                </dt>
                <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                  {report.anonymous ? "Yes" : "No"}
                </dd>
              </div>
            </dl>

            {report.submission && (
              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">
                  Related Submission
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Title</dt>
                    <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                      {report.submission.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Type</dt>
                    <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                      {report.submission.type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Status</dt>
                    <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                      {report.submission.status}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {!report.anonymous && (report.reporterName || report.reporterEmail) && (
              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">
                  Your Information
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {report.reporterName && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconUsers size={14} /> Name
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                        {report.reporterName}
                      </dd>
                    </div>
                  )}
                  {report.reporterEmail && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconInbox size={14} /> Email
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                        {report.reporterEmail}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {report.anonymous && (
              <Alert tone="warning" title="Anonymous report">
                Your identity is hidden from moderators. Only the report details and category are visible to staff.
              </Alert>
            )}

            <div className="pt-4 border-t border-ink-100 dark:border-ink-800 text-sm text-ink-500 dark:text-ink-400">
              <p>
                This tracking page shows only the information you are authorized to see.
                Internal moderation notes and staff identities are not displayed.
              </p>
            </div>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}