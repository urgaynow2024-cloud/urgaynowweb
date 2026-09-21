import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import {
  IconFlag,
  IconAlert,
  IconArrowRight,
  IconSearch,
  IconFilter,
  IconX,
} from "@/components/admin/ui/icons";
import {
  REPORT_STATUSES,
  REPORT_PRIORITIES,
  REPORT_REASONS,
  REPORT_CONTENT_TYPES,
  getStatusTone,
  getStatusLabel,
  getPriorityTone,
  getPriorityLabel,
  getReasonLabel,
  getContentTypeLabel,
} from "@/lib/reports";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; reason?: string; priority?: string; type?: string; assigned?: string; reporter?: string; unassigned?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status || "";
  const reason = searchParams.reason || "";
  const priority = searchParams.priority || "";
  const type = searchParams.type || "";
  const assigned = searchParams.assigned || "";
  const reporter = searchParams.reporter || "";
  const unassigned = searchParams.unassigned === "true";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { reporterName: { contains: q, mode: "insensitive" } },
      { reportedUsername: { contains: q, mode: "insensitive" } },
      { contentId: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && VALID_REPORT_STATUSES.has(status)) where.status = status;
  if (reason && VALID_REPORT_REASONS.has(reason as any)) where.reason = reason;
  if (priority && VALID_REPORT_PRIORITIES.has(priority)) where.priority = priority;
  if (type && VALID_REPORT_CONTENT_TYPES.has(type)) where.contentType = type;
  if (unassigned) where.assignedToId = null;
  else if (assigned) where.assignedToId = assigned;
  if (reporter) where.reporterName = { contains: reporter, mode: "insensitive" };

  const [openCount, inReviewCount, highPriorityCount, resolvedTodayCount, totalCount, reports] = await Promise.all([
    prisma.report.count({ where: { ...where, status: "OPEN" } }),
    prisma.report.count({ where: { ...where, status: "IN_REVIEW" } }),
    prisma.report.count({ where: { ...where, priority: "HIGH" } }),
    prisma.report.count({
      where: {
        ...where,
        status: "RESOLVED",
        resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    }),
  ]);

  const statCards = [
    { label: "Open Reports", value: openCount, icon: <IconFlag size={20} />, accent: "brand" as const },
    { label: "In Review", value: inReviewCount, icon: <IconAlert size={20} />, accent: "amber" as const },
    { label: "High Priority", value: highPriorityCount, icon: <IconAlert size={20} />, accent: "amber" as const },
    { label: "Resolved Today", value: resolvedTodayCount, icon: <IconFlag size={20} />, accent: "emerald" as const },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
        title="Reports Center"
        description="Review, assign, and resolve community reports."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title="Report Queue"
            subtitle={`${totalCount} reports total`}
            icon={<IconFlag size={18} />}
          />
          <CardBody className="p-0">
            {reports.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconFlag size={26} />}
                  title="✨ No reports need attention"
                  description="Reports will appear here when they are submitted."
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-4 dark:border-ink-800">
                  <form method="get" className="flex flex-wrap flex-1 items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                    <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input name="q" defaultValue={q} placeholder="Search ID, user, content ID…" className="input pl-9" />
                  </div>
                  <select name="status" defaultValue={status} className="select min-w-[140px]">
                    <option value="">All statuses</option>
                    {Object.entries(REPORT_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <select name="priority" defaultValue={priority} className="select min-w-[140px]">
                    <option value="">All priorities</option>
                    {Object.entries(REPORT_PRIORITIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <select name="type" defaultValue={type} className="select min-w-[140px]">
                    <option value="">All types</option>
                    {Object.entries(REPORT_CONTENT_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <select name="reason" defaultValue={reason} className="select min-w-[140px]">
                    <option value="">All reasons</option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <input name="reporter" defaultValue={reporter} placeholder="Reporter" className="input min-w-[140px]" />
                  <button type="submit" className="btn-secondary btn-sm">
                    <IconFilter size={14} /> Filter
                  </button>
                  {(q || status || priority || type || reason || reporter || unassigned) && (
                    <Link href="/admin/reports" className="btn-ghost btn-sm">
                      <IconX size={14} /> Clear
                    </Link>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="checkbox" name="unassigned" defaultChecked={unassigned} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                    Unassigned only
                  </label>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                      <tr>
                        <th className="px-5 py-3 font-semibold text-left">ID</th>
                        <th className="px-5 py-3 font-semibold text-left">Type</th>
                        <th className="px-5 py-3 font-semibold text-left">Reason</th>
                        <th className="px-5 py-3 font-semibold text-left hidden md:table-cell">Reporter</th>
                        <th className="px-5 py-3 font-semibold text-left hidden lg:table-cell">Reported User</th>
                        <th className="px-5 py-3 font-semibold text-left">Priority</th>
                        <th className="px-5 py-3 font-semibold text-left">Status</th>
                        <th className="px-5 py-3 font-semibold text-left hidden lg:table-cell">Assigned</th>
                        <th className="px-5 py-3 font-semibold text-left">Submitted</th>
                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                      {reports.map((r) => (
                        <tr key={r.id} className="group hover:bg-ink-50 dark:hover:bg-ink-900/40">
                          <td className="px-5 py-3 font-mono text-xs text-ink-600">{r.id.slice(0, 8)}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs">{getContentTypeLabel(r.contentType)}</span>
                          </td>
                          <td className="px-5 py-3 text-xs">{getReasonLabel(r.reason)}</td>
                          <td className="px-5 py-3 text-xs hidden md:table-cell">{r.reporterName || "—"}</td>
                          <td className="px-5 py-3 text-xs hidden lg:table-cell">{r.reportedUsername || "—"}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium ${getPriorityTone(r.priority) === "danger" ? "text-red-600" : getPriorityTone(r.priority) === "warning" ? "text-amber-600" : "text-ink-600"}`}>
                              {getPriorityLabel(r.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <StatusPill tone={getStatusTone(r.status)}>{getStatusLabel(r.status)}</StatusPill>
                          </td>
                          <td className="px-5 py-3 text-xs hidden lg:table-cell">{r.assignedTo?.name || "—"}</td>
                          <td className="px-5 py-3 text-xs text-ink-500">{relativeTime(r.createdAt)}</td>
                          <td className="px-5 py-3 text-right">
                            <Link href={`/admin/reports/${r.id}`} className="btn-ghost btn-sm">
                              <IconArrowRight size={14} /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

const VALID_REPORT_STATUSES = new Set(Object.keys(REPORT_STATUSES));
const VALID_REPORT_REASONS = new Set(REPORT_REASONS.map((r) => r.value));
const VALID_REPORT_PRIORITIES = new Set(Object.keys(REPORT_PRIORITIES));
const VALID_REPORT_CONTENT_TYPES = new Set(Object.keys(REPORT_CONTENT_TYPES));
