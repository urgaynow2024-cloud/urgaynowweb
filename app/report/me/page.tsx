import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Card, CardBody, StatusBadge } from "@/components/ui";
import { IconCalendar, IconFlag } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/EmptyState";
import {
  getStatusTone,
  getStatusLabel,
  getReasonLabel,
  getReportLabel,
} from "@/lib/reports";
import { readTrackingTokens } from "@/lib/report-evidence-token";

export const metadata: Metadata = {
  title: "My Reports",
  description: "Track the status of reports you submitted",
  robots: { index: false, follow: false },
};

/** Private per-browser view of the visitor's own reports. */
export const dynamic = "force-dynamic";

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default async function MyReportsPage() {
  const session = await getSession();
  const tokens = await readTrackingTokens();

  const reports = await prisma.report.findMany({
    where: {
      OR: [
        ...(tokens.length > 0 ? [{ reportToken: { in: tokens } }] : []),
        ...(session?.sub ? [{ reporterId: session.sub }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reference: true,
      reportToken: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      resolution: true,
      anonymous: true,
    },
  });

  const identified = Boolean(session?.sub) || tokens.length > 0;

  return (
    <>
      <PageHeader
        title="My Reports"
        description="Reports you submitted from this browser or account."
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        {!identified && (
          <Alert tone="info" title="Nothing to show yet" className="mb-6">
            This page lists reports submitted from this browser. Because it is tied to your
            browser, a report submitted on another device or in another browser will not appear
            here — use the private tracking link you were given instead.
          </Alert>
        )}

        {reports.length === 0 ? (
          <EmptyState
            icon={<IconFlag size={32} />}
            title="You haven't submitted any reports yet"
            description="Found something that needs attention? Use the report form to let our moderation team know."
            action={
              <Link href="/report" className="btn-primary">
                Report a problem
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="animate-fade-in">
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="font-mono text-sm font-bold text-brand-700 dark:text-brand-300">
                          {getReportLabel(report)}
                        </code>
                        <StatusBadge tone={getStatusTone(report.status)}>
                          {getStatusLabel(report.status)}
                        </StatusBadge>
                        <span className="text-xs text-ink-500 dark:text-ink-400">
                          {getReasonLabel(report.reason)}
                        </span>
                        {report.anonymous && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
                        {report.description}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        <IconCalendar size={12} className="mr-1 inline" />
                        Submitted {relativeTime(report.createdAt)}
                        {report.resolution ? " · updated with an outcome" : ""}
                      </p>
                    </div>
                    <Link href={`/report/track/${report.reportToken}`} className="btn-secondary btn-sm">
                      Track
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}

            <p className="pt-2 text-xs text-ink-500 dark:text-ink-400">
              You only ever see your own reports. Staff internal notes and other members&rsquo;
              reports are never shown here.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}