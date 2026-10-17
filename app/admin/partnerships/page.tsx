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
import { IconArrowRight, IconLink, IconPlus, IconSearch, IconFilter } from "@/components/admin/ui/icons";
import { Alert } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { updatePartnershipStatus } from "./actions";

export const metadata: Metadata = {
  title: "Partnership Applications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function statusTone(status: string): "brand" | "success" | "danger" | "warning" {
  switch (status) {
    case "APPROVED": return "success";
    case "REJECTED": return "danger";
    case "PENDING": return "warning";
    default: return "brand";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "APPROVED": return "Approved";
    case "REJECTED": return "Rejected";
    case "PENDING": return "Pending";
    default: return status;
  }
}

export default async function AdminPartnershipsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string; error?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login?from=/admin/partnerships");

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  const ALLOWED_RANKS = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];
  if (!staff || !ALLOWED_RANKS.includes(staff.rank)) redirect("/admin");

  const q = searchParams.q?.trim() || "";
  const status = searchParams.status?.trim() || "";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Prisma.PartnerApplicationWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status as "PENDING" | "APPROVED" | "REJECTED";
  }

  const [applications, totalCount, pendingCount] = await Promise.all([
    prisma.partnerApplication.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        discord: true,
        website: true,
        description: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        rejectionReason: true,
      },
    }),
    prisma.partnerApplication.count({ where }),
    prisma.partnerApplication.count({ where: { status: "PENDING" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Partnerships" }]}
        title="Partnership Applications"
        description={`Review and manage partnership applications. ${pendingCount} pending review.`}
        actions={
          <Link href="/partnership/apply" className="btn-secondary btn-sm">
            <IconPlus size={16} /> Submit application
          </Link>
        }
      />

      {pendingCount > 0 && (
        <Alert tone="warning" title="Pending applications" className="m-4">
          There are {pendingCount} partnership application(s) awaiting review.
        </Alert>
      )}

      {searchParams.error && (
        <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Could not complete action â€” please try again.
        </div>
      )}

      <Card className="overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by name or emailâ€¦" className="input pl-9" />
          </div>
          <div className="relative">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="status" defaultValue={status} className="select pl-9 pr-9">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {(q || status) && (
            <Link href="/admin/partnerships" className="btn-ghost btn-sm">
              Clear
            </Link>
          )}
        </form>

        {applications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<IconLink size={28} />}
              title={q || status ? "No applications match your search" : "No partnership applications yet"}
              description={q || status ? "Try a different search or clear the filters." : "Applications submitted through the partnership form will appear here."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {applications.map((app) => (
                  <tr key={app.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-ink-900 dark:text-white truncate">{app.name}</span>
                        {app.discord && (
                          <span className="block text-xs text-ink-500 dark:text-ink-400">Discord: {app.discord}</span>
                        )}
                        {app.website && (
                          <span className="block text-xs text-ink-500 dark:text-ink-400">Website: {app.website}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-ink-600 dark:text-ink-400 truncate max-w-xs">{app.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(app.status) as "brand" | "success" | "danger" | "warning"}>
                        {statusLabel(app.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/partnerships/${app.id}`}
                          className="btn-xs btn-outline"
                        >
                          <IconArrowRight size={14} /> View
                        </Link>
                        {app.status === "PENDING" && (
                          <form action={updatePartnershipStatus} className="inline">
                            <input type="hidden" name="id" value={app.id} />
                            <input type="hidden" name="action" value="approve" />
                            <Button type="submit" className="btn-xs btn-primary">
                              Approve
                            </Button>
                          </form>
                        )}
                        {app.status !== "PENDING" && (
                          <form action={updatePartnershipStatus} className="inline">
                            <input type="hidden" name="id" value={app.id} />
                            <input type="hidden" name="action" value="pending" />
                            <Button type="submit" className="btn-xs btn-outline">
                              Reopen
                            </Button>
                          </form>
                        )}
                        {app.status === "PENDING" && (
                          <form action={updatePartnershipStatus} className="inline">
                            <input type="hidden" name="id" value={app.id} />
                            <input type="hidden" name="action" value="reject" />
                            <Button type="submit" className="btn-xs btn-danger">
                              Reject
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-sm">
            <span className="text-ink-500 dark:text-ink-400">
              Page {page} of {totalPages} ({totalCount} applications)
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/admin/partnerships?${new URLSearchParams({ q, status, page: String(page - 1) }).toString()}`} className="btn-xs btn-outline">
                  Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/partnerships?${new URLSearchParams({ q, status, page: String(page + 1) }).toString()}`} className="btn-xs btn-outline">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
