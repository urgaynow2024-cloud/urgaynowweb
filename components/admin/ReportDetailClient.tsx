"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatusPill } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import {
  IconFlag,
  IconUsers,
  IconCalendar,
  IconShield,
  IconAlert,
  IconArrowLeft,
  IconEye,
  IconExternal,
  IconNote,
  IconCheck,
  IconTrash,
  IconDownload,
  IconRefreshCw,
  IconSend,
  IconLink,
  IconClock,
} from "@/components/admin/ui/icons";
import type { ReportPermission } from "@/lib/report-access";
import {
  REPORT_STATUSES,
  REPORT_PRIORITIES,
  getStatusTone,
  getStatusLabel,
  getPriorityTone,
  getPriorityLabel,
  getReasonLabel,
  getContentTypeLabel,
  getAuditLabel,
  getReportLabel,
  getWebhookStatusLabel,
  getWebhookStatusTone,
  formatReportBytes,
  parseEvidence,
} from "@/lib/reports";

type EvidenceFile = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: Date | string;
};

interface ReportDetailClientProps {
  report: {
    id: string;
    reference: string | null;
    reportToken: string;
    source: string;
    contentType: string;
    contentId: string;
    reporterId: string | null;
    reporterName: string;
    reporterEmail: string | null;
    anonymous: boolean;
    reportedUserId: string | null;
    reportedUsername: string | null;
    reportedPerson: string;
    reportedDiscord: string;
    incidentAt: Date | string | null;
    links: string;
    reason: string;
    description: string;
    evidence: string;
    status: string;
    priority: string;
    webhookStatus: string;
    webhookError: string;
    webhookAttempts: number;
    webhookSentAt: Date | string | null;
    assignedToId: string | null;
    assignedTo: { id: string; name: string } | null;
    resolvedById: string | null;
    resolvedBy: { id: string; name: string } | null;
    resolution: string;
    resolvedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    evidenceFiles: EvidenceFile[];
    auditLogs: Array<{
      id: string;
      action: string;
      actorId: string | null;
      actorName: string;
      detail: string;
      createdAt: Date | string;
      actor: { id: string; name: string } | null;
    }>;
  };
  content: Record<string, unknown> & {
    id: string;
    title?: string;
    name?: string;
    description?: string | null;
    imageUrl?: string;
    bannerUrl?: string;
    submitterName?: string;
    status?: string;
    type?: string;
    creator?: string;
    coverImage?: string;
    summary?: string;
    startDateTime?: Date | string;
    vrchatUsername?: string;
    photoUrl?: string;
    rank?: string;
    excerpt?: string;
    state?: string;
  } | null;
  contentHref: string | null;
  currentStaff: { id: string; name: string; rank: string };
  permissions: ReportPermission[];
}

function relativeTime(date: Date | string): string {
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

function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DialogKind = "note" | "resolve" | "dismiss" | "escalate" | "action" | null;

export function ReportDetailClient({
  report,
  content,
  contentHref,
  currentStaff,
  permissions,
}: ReportDetailClientProps) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [dialogText, setDialogText] = useState("");
  const [statusValue, setStatusValue] = useState(report.status);
  const [priorityValue, setPriorityValue] = useState(report.priority);

  const can = useCallback(
    (permission: ReportPermission) => permissions.includes(permission),
    [permissions],
  );

  const runAction = useCallback(
    async (action: string, data: Record<string, unknown> = {}) => {
      setBusyAction(action);
      setFeedback(null);
      try {
        const response = await fetch("/api/admin/reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: report.id, action, ...data }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          setFeedback({ tone: "danger", message: result.error || "The action failed." });
          return false;
        }

        setFeedback({ tone: "success", message: "Saved." });
        window.location.reload();
        return true;
      } catch {
        setFeedback({ tone: "danger", message: "The action could not be completed." });
        return false;
      } finally {
        setBusyAction(null);
      }
    },
    [report.id],
  );

  const links = parseEvidence(report.links);
  const legacyEvidence = parseEvidence(report.evidence);
  const allLinks = [...links, ...legacyEvidence.filter((item) => !links.some((l) => l.url === item.url))];
  const reference = getReportLabel(report);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reports", href: "/admin/reports" },
          { label: reference },
        ]}
        title="Report details"
        description={`${reference} — ${getReasonLabel(report.reason)}`}
      />

      {feedback && (
        <div
          role="status"
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Report information"
              subtitle={`Reference ${reference}`}
              icon={<IconFlag size={18} />}
            />
            <CardBody className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" icon={<IconFlag size={14} />}>
                  {getReasonLabel(report.reason)}
                </Field>
                <Field label="Priority" icon={<IconShield size={14} />}>
                  <span
                    className={
                      getPriorityTone(report.priority) === "danger"
                        ? "font-medium text-red-600"
                        : getPriorityTone(report.priority) === "warning"
                          ? "font-medium text-amber-600"
                          : ""
                    }
                  >
                    {getPriorityLabel(report.priority)}
                  </span>
                </Field>
                <Field label="Status" icon={<IconAlert size={14} />}>
                  <StatusPill tone={getStatusTone(report.status)}>
                    {getStatusLabel(report.status)}
                  </StatusPill>
                </Field>
                <Field label="Submitted" icon={<IconCalendar size={14} />}>
                  {formatDateTime(report.createdAt)} ({relativeTime(report.createdAt)})
                </Field>
                <Field label="Source" icon={<IconFlag size={14} />}>
                  {report.source === "COMMUNITY"
                    ? "Community report (no site content)"
                    : getContentTypeLabel(report.contentType)}
                </Field>
                <Field label="Incident date" icon={<IconClock size={14} />}>
                  {report.incidentAt ? formatDateTime(report.incidentAt) : "Not provided"}
                </Field>
              </dl>

              <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                <h3 className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                  Description
                </h3>
                <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">
                  {report.description}
                </p>
              </div>

              {(report.reportedPerson || report.reportedDiscord || report.reportedUsername) && (
                <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                  <h3 className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                    Reported person
                  </h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {report.reportedPerson && (
                      <Field label="Name given" icon={<IconUsers size={14} />}>
                        {report.reportedPerson}
                      </Field>
                    )}
                    {report.reportedDiscord && (
                      <Field label="Discord" icon={<IconUsers size={14} />}>
                        {report.reportedDiscord}
                      </Field>
                    )}
                    {report.reportedUsername && (
                      <Field label="Linked account" icon={<IconUsers size={14} />}>
                        {report.reportedUsername}
                      </Field>
                    )}
                  </dl>
                </div>
              )}

              {allLinks.length > 0 && (
                <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                  <h3 className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                    Links supplied
                  </h3>
                  <ul className="space-y-2">
                    {allLinks.map((link, index) => (
                      <li key={`${link.url}-${index}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex max-w-full items-center gap-2 text-sm text-brand-600 hover:underline dark:text-brand-300"
                        >
                          <IconExternal size={14} aria-hidden />
                          <span className="truncate">{link.label || link.url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.evidenceFiles.length > 0 && (
                <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                  <h3 className="mb-1 text-sm font-semibold text-ink-800 dark:text-ink-100">
                    Evidence ({report.evidenceFiles.length})
                  </h3>
                  <p className="mb-3 text-xs text-ink-500 dark:text-ink-400">
                    Evidence files are stored privately with no public URL. Opening one is recorded
                    in the audit trail.
                  </p>
                  {!can("reports.evidence") ? (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      Your staff role cannot open evidence files.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {report.evidenceFiles.map((file) => (
                        <li
                          key={file.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm dark:border-ink-700"
                        >
                          <span className="min-w-0 truncate">
                            <IconShield size={14} className="mr-1.5 inline text-emerald-600" aria-hidden />
                            {file.fileName}{" "}
                            <span className="text-ink-500 dark:text-ink-400">
                              ({formatReportBytes(file.size)}, {file.contentType})
                            </span>
                          </span>
                          <a
                            href={`/api/admin/reports/evidence/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary btn-sm"
                          >
                            {file.contentType.startsWith("image/") ? (
                              <IconEye size={14} aria-hidden />
                            ) : (
                              <IconDownload size={14} aria-hidden />
                            )}
                            Open
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                <h3 className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">Reporter</h3>
                {report.anonymous ? (
                  <p className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <IconAlert size={16} aria-hidden /> Anonymous report — identity hidden from
                    moderators
                  </p>
                ) : (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" icon={<IconUsers size={14} />}>
                      {report.reporterName || "—"}
                    </Field>
                    <Field label="Email" icon={<IconUsers size={14} />}>
                      {report.reporterEmail || "—"}
                    </Field>
                  </dl>
                )}
              </div>
            </CardBody>
          </Card>

          {content && (
            <Card>
              <CardHeader
                title="Reported content"
                subtitle={contentHref ? "Open it in a new tab if you need the full page" : "Not directly accessible"}
                icon={<IconEye size={18} />}
              />
              <CardBody className="space-y-4">
                {typeof content.imageUrl === "string" && content.imageUrl && (
                  <Image
                    src={content.imageUrl}
                    alt={content.title || content.name || "Reported content"}
                    width={800}
                    height={450}
                    className="max-h-64 w-auto rounded-lg object-cover"
                  />
                )}
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title">
                    {content.title || content.name || content.id}
                  </Field>
                  {typeof content.description === "string" && content.description && (
                    <Field label="Description" wide>
                      {content.description}
                    </Field>
                  )}
                  {typeof content.summary === "string" && content.summary && (
                    <Field label="Summary" wide>
                      {content.summary}
                    </Field>
                  )}
                  {content.submitterName && <Field label="Submitted by">{content.submitterName}</Field>}
                  {content.creator && <Field label="Creator">{content.creator}</Field>}
                  {content.type && <Field label="Type">{content.type}</Field>}
                  {content.status && <Field label="Status">{content.status}</Field>}
                  {content.rank && <Field label="Rank">{content.rank}</Field>}
                  {content.vrchatUsername && (
                    <Field label="VRChat username">{content.vrchatUsername}</Field>
                  )}
                  {content.startDateTime && (
                    <Field label="Starts">{formatDateTime(content.startDateTime)}</Field>
                  )}
                  {content.state && <Field label="State">{content.state}</Field>}
                </dl>
                {contentHref ? (
                  <a
                    href={contentHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary btn-sm"
                  >
                    <IconExternal size={14} aria-hidden /> View on site
                  </a>
                ) : (
                  <p className="text-sm text-ink-500 dark:text-ink-400">
                    The reported content is no longer available. The report is kept for the audit
                    history.
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Audit trail"
              subtitle={`${report.auditLogs.length} recorded event${report.auditLogs.length === 1 ? "" : "s"}`}
              icon={<IconNote size={18} />}
            />
            <CardBody className="p-0">
              {report.auditLogs.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-ink-500 dark:text-ink-400">
                  No audit entries yet
                </p>
              ) : (
                <ol className="divide-y divide-ink-100 dark:divide-ink-800">
                  {report.auditLogs.map((log) => (
                    <li key={log.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30"
                          aria-hidden
                        >
                          <IconShield size={14} className="text-brand-600 dark:text-brand-400" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 text-sm">
                            <span className="font-medium text-ink-800 dark:text-ink-100">
                              {getAuditLabel(log.action)}
                            </span>
                            <span className="text-ink-500 dark:text-ink-400">
                              {formatDateTime(log.createdAt)}
                            </span>
                            {log.actorName && (
                              <span className="text-ink-500 dark:text-ink-400">
                                by {log.actorName}
                              </span>
                            )}
                          </p>
                          {log.detail && (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">
                              {log.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Staff actions" icon={<IconShield size={18} />} />
            <CardBody className="space-y-3">
              {can("reports.assign") && (
                <div className="grid gap-2">
                  {report.status === "OPEN" && report.assignedToId !== currentStaff.id && (
                    <Button
                      className="w-full"
                      onClick={() => void runAction("assign", { assigneeId: currentStaff.id })}
                      loading={busyAction === "assign"}
                      leftIcon={<IconUsers size={15} />}
                    >
                      Assign to me
                    </Button>
                  )}
                  {report.assignedToId && report.assignedToId !== currentStaff.id && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void runAction("assign", { assigneeId: currentStaff.id })}
                      loading={busyAction === "assign"}
                      leftIcon={<IconUsers size={15} />}
                    >
                      Take over from {report.assignedTo?.name}
                    </Button>
                  )}
                  {report.assignedToId === currentStaff.id && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void runAction("unassign")}
                      loading={busyAction === "unassign"}
                      leftIcon={<IconUsers size={15} />}
                    >
                      Unassign
                    </Button>
                  )}
                </div>
              )}

              {can("reports.notes") && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setDialogText("");
                    setDialog("note");
                  }}
                  leftIcon={<IconNote size={15} />}
                >
                  Add internal note
                </Button>
              )}

              {can("reports.resolve") && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setDialogText("");
                    setDialog("action");
                  }}
                  leftIcon={<IconSend size={15} />}
                >
                  Record moderation action
                </Button>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {can("reports.escalate") && report.status !== "ESCALATED" && (
                  <Button
                    variant={report.priority === "URGENT" ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => {
                      setDialogText("");
                      setDialog("escalate");
                    }}
                    leftIcon={<IconAlert size={15} />}
                  >
                    Escalate
                  </Button>
                )}

                {can("reports.resolve") && (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => {
                      setDialogText("");
                      setDialog("resolve");
                    }}
                    leftIcon={<IconCheck size={15} />}
                  >
                    Resolve
                  </Button>
                )}

                {can("reports.dismiss") && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setDialogText("");
                      setDialog("dismiss");
                    }}
                    leftIcon={<IconTrash size={15} />}
                  >
                    Dismiss
                  </Button>
                )}

                {can("reports.review") && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="report-status" className="sr-only">
                        Change status
                      </label>
                      <select
                        id="report-status"
                        value={statusValue}
                        onChange={(event) => {
                          const next = event.target.value;
                          setStatusValue(next);
                          void runAction("status", { status: next });
                        }}
                        disabled={busyAction === "status"}
                        className="select"
                      >
                        {Object.entries(REPORT_STATUSES).map(([key, meta]) => (
                          <option key={key} value={key} disabled={key === report.status}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="report-priority" className="sr-only">
                        Change priority
                      </label>
                      <select
                        id="report-priority"
                        value={priorityValue}
                        onChange={(event) => {
                          const next = event.target.value;
                          setPriorityValue(next);
                          void runAction("priority", { priority: next });
                        }}
                        disabled={busyAction === "priority"}
                        className="select"
                      >
                        {Object.entries(REPORT_PRIORITIES).map(([key, meta]) => (
                          <option key={key} value={key} disabled={key === report.priority}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {!can("reports.resolve") && (
                <p className="rounded-lg border border-ink-200 px-3 py-2 text-xs text-ink-500 dark:border-ink-700 dark:text-ink-400">
                  Your staff role can review and annotate this report but cannot resolve, dismiss,
                  or escalate it. A lead can still take those actions.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Staff notification" icon={<IconLink size={18} />} />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500 dark:text-ink-400">Delivery</span>
                <StatusPill tone={getWebhookStatusTone(report.webhookStatus)}>
                  {getWebhookStatusLabel(report.webhookStatus)}
                </StatusPill>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500 dark:text-ink-400">Attempts</span>
                <span className="text-ink-800 dark:text-ink-100">{report.webhookAttempts}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500 dark:text-ink-400">Last sent</span>
                <span className="text-ink-800 dark:text-ink-100">
                  {report.webhookSentAt ? relativeTime(report.webhookSentAt) : "Never"}
                </span>
              </div>
              {report.webhookError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">
                  {report.webhookError}
                </p>
              )}
              {can("reports.webhookRetry") ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => void runAction("retryWebhook")}
                  loading={busyAction === "retryWebhook"}
                  disabled={report.webhookStatus === "SENT"}
                  leftIcon={<IconRefreshCw size={15} />}
                >
                  Retry notification
                </Button>
              ) : (
                report.webhookStatus !== "SENT" && (
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Only leads can retry a failed staff notification.
                  </p>
                )
              )}
              <p className="text-xs text-ink-500 dark:text-ink-400">
                The Discord message only contains the reference, category, target, and a link back
                here. Descriptions and evidence stay on this page.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Report IDs" icon={<IconFlag size={18} />} />
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500 dark:text-ink-400">Reference</dt>
                  <dd className="font-mono font-semibold text-ink-800 dark:text-ink-200">
                    {reference}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500 dark:text-ink-400">Internal ID</dt>
                  <dd className="font-mono text-xs text-ink-800 dark:text-ink-200">{report.id}</dd>
                </div>
                {report.contentId && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-500 dark:text-ink-400">Content ID</dt>
                    <dd className="font-mono text-xs text-ink-800 dark:text-ink-200">
                      {report.contentId}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500 dark:text-ink-400">Assigned</dt>
                  <dd className="text-ink-800 dark:text-ink-100">
                    {report.assignedTo?.name ?? "Unassigned"}
                  </dd>
                </div>
                {report.resolvedBy && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-500 dark:text-ink-400">Closed by</dt>
                    <dd className="text-ink-800 dark:text-ink-100">{report.resolvedBy.name}</dd>
                  </div>
                )}
                {report.resolution && (
                  <div className="pt-2">
                    <dt className="text-ink-500 dark:text-ink-400">Resolution</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-ink-800 dark:text-ink-100">
                      {report.resolution}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>
        </aside>
      </div>

      {dialog && (
        <ActionDialog
          kind={dialog}
          value={dialogText}
          onChange={setDialogText}
          busy={busyAction === dialog}
          onClose={() => setDialog(null)}
          onSubmit={async (text) => {
            const ok = await runAction(dialog, dialog === "note" || dialog === "escalate" || dialog === "action"
              ? { note: text }
              : { resolution: text });
            if (ok) setDialog(null);
          }}
        />
      )}

      <Link
        href="/admin/reports"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
      >
        <IconArrowLeft size={16} aria-hidden /> Back to reports
      </Link>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  wide,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1 text-xs font-medium text-ink-500 dark:text-ink-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-ink-800 dark:text-ink-100">{children}</dd>
    </div>
  );
}

const DIALOG_COPY: Record<
  Exclude<DialogKind, null>,
  { title: string; description: string; placeholder: string; button: string; required: boolean; danger?: boolean }
> = {
  note: {
    title: "Add an internal note",
    description: "Only staff can read this. It is added to the audit trail.",
    placeholder: "What did you find or check?",
    button: "Add note",
    required: true,
  },
  action: {
    title: "Record a moderation action",
    description: "Use this to log a warning, mute, removal, or block you applied elsewhere.",
    placeholder: "Warned the user and removed the offending message…",
    button: "Record action",
    required: true,
  },
  resolve: {
    title: "Resolve this report",
    description: "This closes the report. The reporter sees a summary on their tracking page.",
    placeholder: "Warned the reported user and removed the content.",
    button: "Resolve report",
    required: false,
  },
  dismiss: {
    title: "Dismiss this report",
    description: "Use this when the report does not breach the community rules.",
    placeholder: "No rule was broken — the context was shared between friends.",
    button: "Dismiss report",
    required: false,
    danger: true,
  },
  escalate: {
    title: "Escalate this report",
    description: "Escalating marks the report urgent and raises its priority.",
    placeholder: "Threatening behaviour directed at a member — needs safeguarding.",
    button: "Escalate",
    required: false,
  },
};

function ActionDialog({
  kind,
  value,
  onChange,
  busy,
  onClose,
  onSubmit,
}: {
  kind: Exclude<DialogKind, null>;
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}) {
  const copy = DIALOG_COPY[kind];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        aria-describedby="action-dialog-description"
        className="w-full max-w-md animate-scale-in rounded-2xl bg-white p-5 dark:bg-ink-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="action-dialog-title" className="mb-1 text-lg font-semibold text-ink-900 dark:text-white">
          {copy.title}
        </h3>
        <p
          id="action-dialog-description"
          className="mb-4 text-sm text-ink-500 dark:text-ink-400"
        >
          {copy.description}
        </p>
        <label htmlFor="action-dialog-input" className="sr-only">
          {copy.title}
        </label>
        <textarea
          id="action-dialog-input"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          required={copy.required}
          maxLength={2000}
          placeholder={copy.placeholder}
          className="textarea mb-4 w-full resize-y"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={copy.danger ? "danger" : "primary"}
            loading={busy}
            disabled={copy.required && value.trim().length === 0}
            onClick={() => onSubmit(value.trim())}
          >
            {copy.button}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailClient;