import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconFlag, IconSearch, IconFilter, IconPlus, IconArrowRight } from "@/components/admin/ui/icons";
import { Alert } from "@/components/ui";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Support Tickets",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function statusTone(status: string): "brand" | "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "OPEN": return "brand";
    case "IN_REVIEW": return "warning";
    case "WAITING_INFO": return "neutral";
    case "RESOLVED": return "success";
    case "DISMISSED": return "danger";
    case "CLOSED": return "danger";
    default: return "neutral";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "OPEN": return "Open";
    case "IN_REVIEW": return "In Review";
    case "WAITING_INFO": return "Waiting Info";
    case "RESOLVED": return "Resolved";
    case "DISMISSED": return "Dismissed";
    case "CLOSED": return "Closed";
    default: return status;
  }
}

function priorityTone(priority: string): "brand" | "danger" | "neutral" {
  switch (priority) {
    case "URGENT": return "danger";
    case "HIGH": return "danger";
    case "NORMAL": return "brand";
    case "LOW": return "neutral";
    default: return "neutral";
  }
}

function orderByFor(sort: string): Prisma.SupportRequestOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest": return [{ createdAt: "asc" }];
    case "priority": return [{ priority: "desc" }, { createdAt: "desc" }];
    default: return [{ createdAt: "desc" }];
  }
}

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; priority?: string; assigned?: string; unassigned?: string; sort?: string; page?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login?from=/admin/support/tickets");

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  const allowedRanks = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];
  if (!staff || !allowedRanks.includes(staff.rank)) redirect("/admin");

  const q = searchParams.q?.trim() || "";
  const status = searchParams.status?.trim() || "";
  const priority = searchParams.priority?.trim() || "";
  const assigned = searchParams.assigned?.trim() || "";
  const unassigned = searchParams.unassigned === "true";
  const sort = searchParams.sort?.trim() || "newest";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Prisma.SupportRequestWhereInput = {};
  if (q) {
    where.OR = [
      { ticketNumber: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { contactInfo: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (unassigned) where.assignedStaffId = null;
  else if (assigned) where.assignedStaffId = assigned;

  const [tickets, totalCount, staffRows, openCount] = await Promise.all([
    prisma.supportRequest.findMany({
      where,
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        assignedStaffId: true,
        createdAt: true,
      },
    }),
    prisma.supportRequest.count({ where }),
    prisma.staff.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.supportRequest.count({ where: { status: "OPEN" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Support Tickets" }]}
        title="Support Tickets"
        description={`Manage support requests submitted through the support form. ${openCount} open ticket(s).`}
        actions={
          <Link href="/support" className="btn-secondary btn-sm">
            <IconArrowRight size={16} /> View support page
          </Link>
        }
      />

      {openCount > 0 && (
        <Alert tone="warning" title="Open tickets" className="m-4">
          There are {openCount} open support ticket(s) awaiting attention.
        </Alert>
      )}

      <Card className="overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by ticket number, subject, category, or contactâ€¦"
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="status" defaultValue={status} className="select pl-9 pr-9">
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="WAITING_INFO">Waiting Info</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="relative">
            <select name="priority" defaultValue={priority} className="select pl-9 pr-9">
              <option value="">All priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          {(q || status || priority) && (
            <Link href="/admin/support/tickets" className="btn-ghost btn-sm">
              Clear
            </Link>
          )}
        </form>

        {tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<IconFlag size={28} />}
              title={q || status || priority ? "No tickets match your search" : "No support tickets yet"}
              description={q || status || priority ? "Try a different search or clear the filters." : "Support tickets submitted through the support form will appear here."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ticket</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold text-right">Assignee</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <span className="block text-sm font-medium text-ink-900 dark:text-white truncate">{ticket.ticketNumber}</span>
                      <span className="block text-xs text-ink-500 dark:text-ink-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="block text-sm text-ink-700 dark:text-ink-300 truncate max-w-xs">{ticket.subject}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-ink-600 dark:text-ink-400 truncate max-w-xs">{ticket.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(ticket.status) as "brand" | "success" | "danger" | "warning" | "neutral"}>
                        {statusLabel(ticket.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={priorityTone(ticket.priority) as "brand" | "danger" | "neutral"}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ticket.assignedStaff ? (
                        <span className="text-sm text-ink-600 dark:text-ink-400 truncate max-w-xs">{ticket.assignedStaff.name}</span>
                      ) : (
                        <span className="text-xs text-ink-400 dark:text-ink-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      <Link
                        href={`/admin/support/tickets/${ticket.id}`}
                        className="btn-xs btn-primary"
                      >
                        <IconArrowRight size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-sm">
                <span className="text-ink-500 dark:text-ink-400">
                  Page {page} of {totalPages} ({totalCount} tickets)
                </span>
                <div className="flex gap-1">
                  {page > 1 && (
                    <Link
                      href={`/admin/support/tickets?${new URLSearchParams({
                        q, status, priority, ...(unassigned ? { unassigned: "true" } : {}),
                        ...(assigned ? { assigned } : {}), sort, page: String(page - 1),
                      }).toString()}`}
                      className="btn-xs btn-outline"
                    >
                      Prev
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/admin/support/tickets?${new URLSearchParams({
                        q, status, priority, ...(unassigned ? { unassigned: "true" } : {}),
                        ...(assigned ? { assigned } : {}), sort, page: String(page + 1),
                      }).toString()}`}
                      className="btn-xs btn-outline"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
