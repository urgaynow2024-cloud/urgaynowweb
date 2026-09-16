import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import Link from "next/link";
import {
  IconFlag,
  IconAlert,
  IconCalendar,
  IconInbox,
  IconUsers,
  IconShield,
  IconArrowRight,
} from "@/components/admin/ui/icons";

export const metadata: Metadata = { title: "Reports", robots: { index: false, follow: false } };

export const revalidate = 60;

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusTone(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
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

export default async function ReportsPage() {
  const [totalReports, pendingReports, recentReports] = await Promise.all([
    prisma.communitySubmissionReport.count(),
    prisma.communitySubmissionReport.count({ where: { status: { in: ["RECEIVED", "UNDER_REVIEW"] } } }),
    prisma.communitySubmissionReport.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        submission: {
          select: { id: true, title: true, type: true, imageUrl: true },
        },
      },
    }),
  ]);

  const stats = [
    { label: "Total Reports", value: totalReports, icon: <IconFlag size={20} />, accent: "brand" as const },
    { label: "Pending Review", value: pendingReports, icon: <IconAlert size={20} />, accent: "amber" as const },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
        title="Community Reports"
        description="Review and manage reports on community submissions."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title="Recent Reports"
            subtitle="All reports on community submissions"
            icon={<IconFlag size={18} />}
          />
          <CardBody className="p-0">
            {recentReports.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconFlag size={26} />}
                  title="No reports yet"
                  description="Reports on community submissions will appear here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {recentReports.map((report, i) => (
                  <li key={report.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusPill tone={getStatusTone(report.status)}>{getStatusLabel(report.status)}</StatusPill>
                        {report.anonymous && (
                          <span className="badge badge-warning">
                            <IconShield size={10} className="mr-1" /> Anonymous
                          </span>
                        )}
                        <span className="text-xs text-ink-500 dark:text-ink-400">
                          {report.reason.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-ink-800 dark:text-ink-100">
                        {report.submission?.title || "Unknown submission"}
                      </p>
                      <p className="text-xs text-ink-400">
                        {report.submission?.type || "Unknown"} · {relativeTime(report.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="btn-ghost btn-sm"
                      >
                        <IconArrowRight size={14} /> View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}