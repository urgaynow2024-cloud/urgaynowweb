import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatusPill } from "@/components/admin/ui/Badge";
import { IconFlag, IconCalendar, IconInbox, IconUsers, IconShield, IconAlert, IconArrowLeft } from "@/components/admin/ui/icons";
import Link from "next/link";

export const metadata: Metadata = { title: "Report Details", robots: { index: false, follow: false } };

export const revalidate = 60;

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

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.communitySubmissionReport.findUnique({
    where: { id },
    include: {
      submission: {
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          imageUrl: true,
          submitterName: true,
          submitterEmail: true,
          status: true,
          published: true,
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
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reports", href: "/admin/reports" },
          { label: `Report ${id.slice(0, 8)}` },
        ]}
        title="Report Details"
        description="Review and manage this report"
        actions={
          <Link href="/admin/reports" className="btn-ghost btn-sm">
            <IconArrowLeft size={14} /> Back
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-fade-in">
            <CardHeader
              title={report.submission?.title || "Unknown submission"}
              subtitle={`${report.submission?.type || "Unknown"} · ${getStatusLabel(report.submission?.status || "UNKNOWN")}`}
              actions={
                <StatusPill tone={getStatusTone(report.status)}>
                  {getStatusLabel(report.status)}
                </StatusPill>
              }
            />
            <CardBody className="space-y-4">
              {report.submission?.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800 rounded-xl">
                  <Image
                    src={report.submission.imageUrl}
                    alt={report.submission.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover"
                  />
                </div>
              )}

              {report.submission?.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-ink-700 dark:text-ink-300 whitespace-pre-wrap">{report.submission.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader title="Report Details" icon={<IconFlag size={18} />} />
            <CardBody className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                  <IconInbox size={14} /> Reason
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                    {report.reason.replace(/_/g, " ")}
                  </dd>
                </div>

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
                    <IconCalendar size={14} /> Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                    {formatDateTime(report.updatedAt)}
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

              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1 flex items-center gap-1">
                  <IconAlert size={14} /> Details
                </dt>
                <dd className="text-sm text-ink-800 dark:text-ink-100 whitespace-pre-wrap bg-ink-50 dark:bg-ink-800/50 p-3 rounded-lg">
                  {report.details || "No details provided"}
                </dd>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader title="Reporter Info" icon={<IconUsers size={18} />} />
            <CardBody className="space-y-4">
              {report.anonymous ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <IconShield size={18} className="text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Anonymous Report</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Reporter identity is hidden per their request.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {report.reporterName && (
                    <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconUsers size={14} /> Name
                  </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{report.reporterName}</dd>
                    </div>
                  )}
                  {report.reporterEmail && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconInbox size={14} /> Email
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{report.reporterEmail}</dd>
                    </div>
                  )}
                  {!report.reporterName && !report.reporterEmail && !report.anonymous && (
                    <p className="text-sm text-ink-500 dark:text-ink-400">No contact information provided</p>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1">Reference Token</dt>
                <dd className="text-sm font-mono text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-800/50 p-2 rounded">
                  {report.reportToken}
                </dd>
              </div>
            </CardBody>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader title="Status Actions" icon={<IconFlag size={18} />} />
            <CardBody className="space-y-3">
              <form action={async (formData: FormData) => {
                const newStatus = formData.get("status") as string;
                await prisma.communitySubmissionReport.update({
                  where: { id: report.id },
                  data: { status: newStatus as any },
                });
              }}>
                <select
                  name="status"
                  defaultValue={report.status}
                  className="select w-full"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                >
                  <option value="RECEIVED">Received</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACTION_TAKEN">Action Taken</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}