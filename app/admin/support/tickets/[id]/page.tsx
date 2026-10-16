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
import { IconCalendar, IconClock, IconFlag, IconArrowLeft } from "@/components/admin/ui/icons";

export const metadata: Metadata = {
  title: "Ticket Detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  const allowedRanks = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];
  if (!staff || !allowedRanks.includes(staff.rank)) redirect("/admin");

  const { id } = await params;
  if (!id || !/^[a-z0-9]{15,32}$/i.test(id)) {
    notFound();
  }

  const ticket = await prisma.supportRequest.findUnique({
    where: { id },
    select: {
      id: true,
      ticketNumber: true,
      category: true,
      subject: true,
      description: true,
      contactMethod: true,
      contactInfo: true,
      status: true,
      priority: true,
      assignedStaffId: true,
      createdAt: true,
      updatedAt: true,
      webhookStatus: true,
      webhookError: true,
      webhookAttempts: true,
      webhookSentAt: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Support Tickets", href: "/admin/support/tickets" },
          { label: ticket.ticketNumber },
        ]}
        title="Ticket Detail"
        description={ticket.subject}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/support/tickets" className="btn-secondary btn-sm">
              <IconArrowLeft size={14} /> Back to tickets
            </Link>
          </div>
        }
      />

      <Card className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-ink-900 dark:text-white mb-2">{ticket.subject}</h2>
            <p className="text-sm text-ink-600 dark:text-ink-400">{ticket.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <IconFlag size={16} className="text-ink-500 dark:text-ink-400" />
              <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">{ticket.ticketNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCalendar size={16} className="text-ink-500 dark:text-ink-400" />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconClock size={16} className="text-ink-500 dark:text-ink-400" />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                {new Date(ticket.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Category</label>
            <span className="text-sm text-ink-700 dark:text-ink-300">{ticket.category}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Contact Method</label>
            <span className="text-sm text-ink-700 dark:text-ink-300">{ticket.contactMethod}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Contact Information</label>
            <span className="text-sm text-ink-700 dark:text-ink-300 break-all">{ticket.contactInfo}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Status</label>
            <Badge tone={statusTone(ticket.status) as "brand" | "success" | "danger" | "warning" | "neutral"}>
              {statusLabel(ticket.status)}
            </Badge>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Priority</label>
            <Badge tone={priorityTone(ticket.priority) as "brand" | "danger" | "neutral"}>
              {ticket.priority}
            </Badge>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">Assigned Staff</label>
            {ticket.assignedStaffId ? (
              <span className="text-sm text-ink-700 dark:text-ink-300">{ticket.assignedStaffId}</span>
            ) : (
              <span className="text-sm text-ink-400 dark:text-ink-500">Unassigned</span>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-ink-100 dark:border-ink-800">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-white mb-3">Webhook Delivery</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">Status:</span>
            <Badge tone={ticket.webhookStatus === "SENT" ? "success" : ticket.webhookStatus === "FAILED" ? "danger" : "neutral"}>
              {ticket.webhookStatus}
            </Badge>
          </div>
          {ticket.webhookAttempts > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">Attempts:</span>
              <span className="text-sm text-ink-700 dark:text-ink-300">{ticket.webhookAttempts}</span>
            </div>
          )}
          {ticket.webhookSentAt && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">Sent at:</span>
              <span className="text-sm text-ink-700 dark:text-ink-300">{new Date(ticket.webhookSentAt).toLocaleString()}</span>
            </div>
          )}
          {ticket.webhookError && (
            <Alert tone="danger" title="Webhook error" className="mt-3">
              {ticket.webhookError}
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
