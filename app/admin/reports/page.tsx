import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
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
  CONTENT_REPORT_CATEGORIES,
  REPORT_STATUSES,
  REPORT_PRIORITIES,
  REPORT_CATEGORIES,
  LEGACY_REPORT_CATEGORIES,
  getStatusTone,
  getStatusLabel,
  getPriorityTone,
  getPriorityLabel,
  getReasonLabel,
  getContentTypeLabel,
  getReportLabel,
  getWebhookStatusLabel,
  getWebhookStatusTone,
  VALID_REASONS,
  type ReportPriority,
  type ReportStatus,
} from "@/lib/reports";
import { getReportPermissionsForRank } from "@/lib/report-access";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

/** Staff report data must never be cached by a CDN or the browser. */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const ALL_CATEGORIES = [...REPORT_CATEGORIES, ...LEGACY_REPORT_CATEGORIES];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "Priority" },
  { value: "reference", label: "Reference" },
] as const;

function orderByFor(sort: string): Prisma.ReportOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "priority":
      return [{ priority: "desc" }, { createdAt: "desc" }];
    case "reference":
      return [{ referenceSeq: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

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
  searchParams: {
    q?: string;
    status?: string;
    reason?: string;
    priority?: string;
    type?: string;
    assigned?: string;
    reporter?: string;
    unassigned?: string;
    sort?: string;
    page?: string;
  };
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login?from=/admin/reports");

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  const permissions = getReportPermissionsForRank(staff?.rank);
  if (!staff || !permissions.includes("reports.view")) redirect("/admin");

  const q = searchParams.q?.trim() || "";
  const status = searchParams.status?.trim() || "";
  const reason = searchParams.reason?.trim() || "";
  const priority = searchParams.priority?.trim() || "";
  const type = searchParams.type?.trim() || "";
  const assigned = searchParams.assigned?.trim() || "";
  const reporter = searchParams.reporter?.trim() || "";
  const unassigned = searchParams.unassigned === "true";
  const sort = searchParams.sort?.trim() || "newest";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Prisma.ReportWhereInput = {};

  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { reporterName: { contains: q, mode: "insensitive" } },
      { reportedUsername: { contains: q, mode: "insensitive" } },
      { reportedPerson: { contains: q, mode: "insensitive" } },
      { reportedDiscord: { contains: q, mode: "insensitive" } },
      { contentId: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && status in REPORT_STATUSES) where.status = status;
  if (reason && VALID_REASONS.has(reason)) where.reason = reason;
  if (priority && priority in REPORT_PRIORITIES) where.priority = priority;
  if (type) where.contentType = type;
  if (unassigned) where.assignedToId = null;
  else if (assigned) where.assignedToId = assigned;
  if (reporter) where.reporterName = { contains: reporter, mode: "insensitive" };

  const [openCount, inReviewCount, urgentCount, resolvedTodayCount, totalCount, reports, staffRows] =
    await Promise.all([
      prisma.report.count({ where: { ...where, status: "OPEN" } }),
      prisma.report.count({ where: { ...where, status: { in: ["IN_REVIEW", "WAITING_INFO"] } } }),
      prisma.report.count({
        where: {
          ...where,
          priority: { in: ["HIGH", "URGENT"] },
          status: { in: ["OPEN", "IN_REVIEW", "WAITING_INFO", "ESCALATED"] },
        },
      }),
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
        orderBy: orderByFor(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          assignedTo: { select: { id: true, name: true } },
          evidenceFiles: { select: { id: true } },
        },
      }),
      prisma.staff.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageLink = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, String(value));
    }
    params.set("page", String(target));
    return `/admin/reports?${params.toString()}`;
  };

  const statCards = [
    { label: "New", value: openCount, icon: <IconFlag size={20} />, accent: "brand" as const },
    {
      label: "In review",
      value: inReviewCount,
      icon: <IconAlert size={20} />,
      accent: "amber" as const,
    },
    {
      label: "High priority",
      value: urgentCount,
      icon: <IconAlert size={20} />,
      accent: "amber" as const,
    },
    {
      label: "Resolved today",
      value: resolvedTodayCount,
      icon: <IconFlag size={20} />,
      accent: "emerald" as const,
    },
  ];

  const hasFilters = Boolean(
    q || status || priority || type || reason || reporter || unassigned || assigned,
  );

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
            title="Report queue"
            subtitle={`${totalCount} report${totalCount === 1 ? "" : "s"} match your filters`}
            icon={<IconFlag size={18} />}
          />
          <CardBody className="p-0">
            <div className="border-b border-ink-100 p-4 dark:border-ink-800">
              <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative sm:col-span-2 lg:col-span-2">
                  <IconSearch
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <label htmlFor="report-search" className="sr-only">
                    Search reports
                  </label>
                  <input
                    id="report-search"
                    name="q"
                    defaultValue={q}
                    placeholder="UGN-000123, person, Discord ID, description…"
                    className="input pl-9"
                  />
                </div>

                <div>
                  <label htmlFor="filter-status" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="filter-status"
                    name="status"
                    defaultValue={status}
                    className="select min-w-[150px]"
                  >
                    <option value="">All statuses</option>
                    {Object.entries(REPORT_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-category" className="sr-only">
                    Filter by category
                  </label>
                  <select
                    id="filter-category"
                    name="reason"
                    defaultValue={reason}
                    className="select min-w-[170px]"
                  >
                    <option value="">All categories</option>
                    {CONTENT_REPORT_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-priority" className="sr-only">
                    Filter by priority
                  </label>
                  <select
                    id="filter-priority"
                    name="priority"
                    defaultValue={priority}
                    className="select min-w-[140px]"
                  >
                    <option value="">All priorities</option>
                    {Object.entries(REPORT_PRIORITIES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-content" className="sr-only">
                    Filter by content type
                  </label>
                  <select
                    id="filter-content"
                    name="type"
                    defaultValue={type}
                    className="select min-w-[150px]"
                  >
                    <option value="">All content types</option>
                    <option value="NONE">Community report (no content)</option>
                    {Object.entries(REPORT_CONTENT_TYPE_FILTERS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-assignee" className="sr-only">
                    Filter by assigned staff member
                  </label>
                  <select
                    id="filter-assignee"
                    name="assigned"
                    defaultValue={assigned}
                    className="select min-w-[160px]"
                  >
                    <option value="">Anyone assigned</option>
                    {staffRows.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-sort" className="sr-only">
                    Sort reports
                  </label>
                  <select
                    id="filter-sort"
                    name="sort"
                    defaultValue={sort}
                    className="select min-w-[150px]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
                  <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
                    <input
                      type="checkbox"
                      name="unassigned"
                      value="true"
                      defaultChecked={unassigned}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    Unassigned only
                  </label>
                  <button type="submit" className="btn-secondary btn-sm min-h-[44px]">
                    <IconFilter size={14} aria-hidden /> Apply filters
                  </button>
                  {hasFilters && (
                    <Link href="/admin/reports" className="btn-ghost btn-sm min-h-[44px]">
                      <IconX size={14} aria-hidden /> Clear
                    </Link>
                  )}
                </div>
              </form>
            </div>

            {reports.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconFlag size={26} />}
                  title="✨ No reports match this view"
                  description={
                    hasFilters
                      ? "Try clearing a filter or searching for something else."
                      : "Reports will appear here as soon as they are submitted."
                  }
                />
              </div>
            ) : (
              <>
                {/* Mobile: cards. Desktop: table. */}
                <ul className="divide-y divide-ink-100 md:hidden dark:divide-ink-800">
                  {reports.map((report) => (
                    <li key={report.id}>
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="block px-4 py-4 transition-colors hover:bg-ink-50 dark:hover:bg-ink-900/40"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300">
                            {getReportLabel(report)}
                          </code>
                          <StatusPill tone={getStatusTone(report.status)}>
                            {getStatusLabel(report.status)}
                          </StatusPill>
                          {report.priority !== "NORMAL" && (
                            <span
                              className={`text-xs font-medium ${
                                getPriorityTone(report.priority) === "danger"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {getPriorityLabel(report.priority)}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-ink-700 dark:text-ink-200">
                          {report.description}
                        </p>
                        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                          {getReasonLabel(report.reason)} ·{" "}
                          {report.reportedPerson || report.reportedUsername || "No target given"} ·{" "}
                          {relativeTime(report.createdAt)}
                          {report.evidenceFiles.length > 0 && ` · ${report.evidenceFiles.length} file(s)`}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Report queue</caption>
                    <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                      <tr>
                        <th scope="col" className="px-5 py-3 text-left font-semibold">Reference</th>
                        <th scope="col" className="px-5 py-3 text-left font-semibold">Category</th>
                        <th scope="col" className="hidden px-5 py-3 text-left font-semibold lg:table-cell">Reported</th>
                        <th scope="col" className="hidden px-5 py-3 text-left font-semibold xl:table-cell">Reporter</th>
                        <th scope="col" className="px-5 py-3 text-left font-semibold">Priority</th>
                        <th scope="col" className="px-5 py-3 text-left font-semibold">Status</th>
                        <th scope="col" className="hidden px-5 py-3 text-left font-semibold lg:table-cell">Assigned</th>
                        <th scope="col" className="hidden px-5 py-3 text-left font-semibold xl:table-cell">Notify</th>
                        <th scope="col" className="px-5 py-3 text-left font-semibold">Submitted</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                      {reports.map((report) => (
                        <tr key={report.id} className="group hover:bg-ink-50 dark:hover:bg-ink-900/40">
                          <td className="px-5 py-3">
                            <code className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300">
                              {getReportLabel(report)}
                            </code>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs">{getReasonLabel(report.reason)}</span>
                            <span className="block text-[11px] text-ink-400">
                              {report.source === "COMMUNITY"
                                ? "Community report"
                                : getContentTypeLabel(report.contentType)}
                              {report.evidenceFiles.length > 0 &&
                                ` · ${report.evidenceFiles.length} file(s)`}
                            </span>
                          </td>
                          <td className="hidden px-5 py-3 text-xs lg:table-cell">
                            {report.reportedPerson || report.reportedUsername || "—"}
                          </td>
                          <td className="hidden px-5 py-3 text-xs xl:table-cell">
                            {report.anonymous ? (
                              <span className="text-amber-600 dark:text-amber-400">Anonymous</span>
                            ) : (
                              report.reporterName || "—"
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-xs font-medium ${
                                getPriorityTone(report.priority) === "danger"
                                  ? "text-red-600"
                                  : getPriorityTone(report.priority) === "warning"
                                    ? "text-amber-600"
                                    : "text-ink-600 dark:text-ink-300"
                              }`}
                            >
                              {getPriorityLabel(report.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <StatusPill tone={getStatusTone(report.status)}>
                              {getStatusLabel(report.status)}
                            </StatusPill>
                          </td>
                          <td className="hidden px-5 py-3 text-xs lg:table-cell">
                            {report.assignedTo?.name || "—"}
                          </td>
                          <td className="hidden px-5 py-3 text-xs xl:table-cell">
                            <span
                              className={
                                getWebhookStatusTone(report.webhookStatus) === "danger"
                                  ? "text-red-600"
                                  : getWebhookStatusTone(report.webhookStatus) === "success"
                                    ? "text-emerald-600"
                                    : "text-ink-500 dark:text-ink-400"
                              }
                            >
                              {getWebhookStatusLabel(report.webhookStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-ink-500">{relativeTime(report.createdAt)}</td>
                          <td className="px-5 py-3 text-right">
                            <Link href={`/admin/reports/${report.id}`} className="btn-ghost btn-sm">
                              <IconArrowRight size={14} aria-hidden /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <nav
                    className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-3 text-sm dark:border-ink-800"
                    aria-label="Report pagination"
                  >
                    {page > 1 ? (
                      <Link href={pageLink(page - 1)} className="btn-secondary btn-sm">
                        Previous
                      </Link>
                    ) : (
                      <span className="btn-secondary btn-sm pointer-events-none opacity-50">Previous</span>
                    )}
                    <span className="text-ink-500 dark:text-ink-400">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link href={pageLink(page + 1)} className="btn-secondary btn-sm">
                        Next
                      </Link>
                    ) : (
                      <span className="btn-secondary btn-sm pointer-events-none opacity-50">Next</span>
                    )}
                  </nav>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

const REPORT_CONTENT_TYPE_FILTERS: Record<string, string> = {
  COMMUNITY_PHOTO: "Community photo",
  GALLERY_IMAGE: "Gallery image",
  GROUP_PHOTO: "Group photo",
  EVENT: "Event",
  STAFF_PROFILE: "Staff profile",
  SHOP_DESIGN: "Shop design",
  COMMUNITY_SUBMISSION: "Community submission",
  ANNOUNCEMENT: "Announcement",
  COMMUNITY_REVIEW: "Community review",
};