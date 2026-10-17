import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { IconArrowLeft, IconShield, IconClock } from "@/components/admin/ui/icons";
import { updatePartnershipStatus } from "../actions";

export const metadata: Metadata = {
  title: "Partnership Application Detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ALLOWED_RANKS = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];

function statusTone(status: string): "brand" | "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "PENDING": return "warning";
    case "APPROVED": return "success";
    case "REJECTED": return "danger";
    default: return "neutral";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Pending";
    case "APPROVED": return "Approved";
    case "REJECTED": return "Rejected";
    default: return status;
  }
}

async function requireStaff() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff || !ALLOWED_RANKS.includes(staff.rank)) redirect("/admin");

  return staff;
}

export default async function PartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();

  const { id } = await params;
  if (!id || !/^[a-z0-9]{15,32}$/i.test(id)) {
    notFound();
  }

  const application = await prisma.partnerApplication.findUnique({
    where: { id },
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
      internalNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Partnerships", href: "/admin/partnerships" },
          { label: application.name },
        ]}
        title="Application Detail"
        description={application.name}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/partnerships" className="btn-secondary btn-sm">
              <IconArrowLeft size={14} /> Back to applications
            </Link>
          </div>
        }
      />

      <Card className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-ink-900 dark:text-white mb-2">{application.name}</h2>
            <p className="text-sm text-ink-600 dark:text-ink-400">
              {application.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <IconShield size={16} className="text-ink-500 dark:text-ink-400" />
              <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                {application.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconClock size={16} className="text-ink-500 dark:text-ink-400" />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                {new Date(application.submittedAt).toLocaleString()}
              </span>
            </div>
            {application.reviewedAt && (
              <div className="flex items-center gap-2">
                <IconClock size={16} className="text-ink-500 dark:text-ink-400" />
                <span className="text-sm text-ink-600 dark:text-ink-400">
                  {new Date(application.reviewedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Organization / Community</label>
            <span className="text-sm text-ink-700 dark:text-ink-300">{application.name}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Contact Email</label>
            <span className="text-sm text-ink-700 dark:text-ink-300 break-all">{application.email}</span>
          </div>
          {application.discord && (
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Discord</label>
              <span className="text-sm text-ink-700 dark:text-ink-300 break-all">{application.discord}</span>
            </div>
          )}
          {application.website && (
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Website</label>
              <span className="text-sm text-ink-700 dark:text-ink-300 break-all">{application.website}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Status</label>
            <Badge tone={statusTone(application.status)}>
              {statusLabel(application.status)}
            </Badge>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Description</label>
            <p className="text-sm text-ink-700 dark:text-ink-300 break-words whitespace-pre-line">
              {application.description}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Reviewed By</label>
            {application.reviewedBy ? (
              <span className="text-sm text-ink-700 dark:text-ink-300">{application.reviewedBy}</span>
            ) : (
              <span className="text-sm text-ink-400 dark:text-ink-500">Not yet reviewed</span>
            )}
          </div>
          {application.rejectionReason && (
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Rejection Reason</label>
              <span className="text-sm text-ink-700 dark:text-ink-300 break-words">{application.rejectionReason}</span>
            </div>
          )}
          {application.internalNotes && (
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Internal Notes</label>
              <span className="text-sm text-ink-700 dark:text-ink-300 break-words">{application.internalNotes}</span>
            </div>
          )}
        </div>

        {application.status === "PENDING" && (
          <div className="mt-6 pt-6 border-t border-ink-100 dark:border-ink-800">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-white mb-3">Review Application</h3>
            <form action={updatePartnershipStatus} className="space-y-4">
              <input type="hidden" name="id" value={application.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Button type="submit" name="action" value="approve" variant="success" className="w-full sm:w-auto">
                    Approve Application
                  </Button>
                </div>
                <div>
                  <Button type="submit" name="action" value="reject" variant="danger" className="w-full sm:w-auto">
                    Reject Application
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="rejection-reason" className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Rejection Reason (optional)</label>
                <textarea
                  id="rejection-reason"
                  name="rejectionReason"
                  rows={3}
                  placeholder="Reason for rejection..."
                  className="block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
                />
              </div>
            </form>
          </div>
        )}

        {["APPROVED", "REJECTED"].includes(application.status) && (
          <div className="mt-6 pt-6 border-t border-ink-100 dark:border-ink-800">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-white mb-3">Reopen Application</h3>
            <form action={updatePartnershipStatus} className="inline-flex items-center gap-2">
              <input type="hidden" name="id" value={application.id} />
              <Button type="submit" name="action" value="pending" variant="outline" className="btn-sm">
                Reopen for Review
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
