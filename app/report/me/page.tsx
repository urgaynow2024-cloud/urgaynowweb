import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Card, CardBody, CardHeader, StatusBadge } from "@/components/ui";
import {
  IconFlag,
  IconShield,
  IconUsers,
  IconCalendar,
  IconClock,
} from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  REPORT_STATUSES,
  getStatusTone,
  getStatusLabel,
  getReasonLabel,
} from "@/lib/reports";

export const metadata: Metadata = {
  title: "My Reports",
  description: "Track your submitted reports",
  robots: { index: false, follow: false },
};

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
  if (!session) {
    redirect("/admin/login?from=/report/me");
  }

  const reports = await prisma.report.findMany({
    where: { reporterId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <PageHeader
        title="My Reports"
        description="Track the status of reports you've submitted"
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        {reports.length === 0 ? (
          <EmptyState
            icon={<IconFlag size={32} />}
            title="You haven't submitted any reports yet"
            description="Found content that needs attention? Use the Report button to let our moderation team know."
            action={<Link href="/community" className="btn-primary">Browse community</Link>}
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="animate-fade-in">
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge tone={getStatusTone(report.status as keyof typeof REPORT_STATUSES)}>
                          {getStatusLabel(report.status as keyof typeof REPORT_STATUSES)}
                        </StatusBadge>
                        <span className="text-xs text-ink-500 dark:text-ink-400">
                          {getReasonLabel(report.reason)}
                        </span>
                        <span className="font-mono text-xs text-ink-400">{report.id.slice(0, 8)}</span>
                      </div>
                      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
                        {report.description}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        <IconCalendar size={12} className="inline mr-1" />
                        {relativeTime(report.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/report/track/${report.reportToken}`}
                        className="btn-ghost btn-sm"
                      >
                        <IconShield size={14} /> Track
                      </a>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
