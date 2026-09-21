"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatusPill } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import {
  IconFlag,
  IconUsers,
  IconCalendar,
  IconShield,
  IconAlert,
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconEye,
  IconExternal,
  IconNote,
  IconInbox,
  IconCheck,
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
  parseEvidence,
  getReportContentHref,
} from "@/lib/reports";

interface ReportDetailClientProps {
  report: {
    id: string;
    reportToken: string;
    contentType: string;
    contentId: string;
    reporterId: string | null;
    reporterName: string;
    reporterEmail: string | null;
    anonymous: boolean;
    reportedUserId: string | null;
    reportedUsername: string | null;
    reason: string;
    description: string;
    evidence: string;
    status: string;
    priority: string;
    assignedToId: string | null;
    assignedTo: { id: string; name: string } | null;
    resolvedById: string | null;
    resolvedBy: { id: string; name: string } | null;
    resolution: string;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    auditLogs: Array<{
      id: string;
      action: string;
      actorId: string | null;
      actorName: string;
      detail: string;
      createdAt: Date;
      actor: { id: string; name: string } | null;
    }>;
  };
  content: {
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
  currentStaff: { id: string; name: string };
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

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportDetailClient({
  report,
  content,
  contentHref,
  currentStaff,
}: ReportDetailClientProps) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveText, setResolveText] = useState("");
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [dismissText, setDismissText] = useState("");
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateText, setEscalateText] = useState("");

  async function handleAction(action: string, data: Record<string, unknown> = {}) {
    setIsActionLoading(action);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, action, ...data }),
      });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || "Action failed");
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setIsActionLoading(null);
    }
  }

  const evidence = parseEvidence(report.evidence);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reports", href: "/admin/reports" },
          { label: `#${report.id.slice(0, 8)}` },
        ]}
        title="Report Details"
        description={`Report #${report.id.slice(0, 8)} — ${getReasonLabel(report.reason)}`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <Card>
            <CardHeader
              title="Report Information"
              subtitle={`Reference: ${report.reportToken}`}
              icon={<IconFlag size={18} />}
            />
            <CardBody className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconFlag size={14} /> Reason
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{getReasonLabel(report.reason)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconShield size={14} /> Priority
                  </dt>
                  <dd className="mt-1 text-sm">
                    <span className={`font-medium ${getPriorityTone(report.priority) === "danger" ? "text-red-600" : getPriorityTone(report.priority) === "warning" ? "text-amber-600" : "text-ink-600"}`}>
                      {getPriorityLabel(report.priority)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconAlert size={14} /> Status
                  </dt>
                  <dd className="mt-1">
                    <StatusPill tone={getStatusTone(report.status)}>{getStatusLabel(report.status)}</StatusPill>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconCalendar size={14} /> Submitted
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{formatDateTime(report.createdAt)} ({relativeTime(report.createdAt)})</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconCalendar size={14} /> Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{formatDateTime(report.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                    <IconFlag size={14} /> Content Type
                  </dt>
                  <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{getContentTypeLabel(report.contentType)}</dd>
                </div>
              </dl>

              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">Description</h3>
                <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">{report.description}</p>
              </div>

              {evidence.length > 0 && (
                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">Evidence</h3>
                  <div className="space-y-2">
                    {evidence.map((e, i) => (
                      <Link key={i} href={e.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:underline dark:text-brand-300">
                        <IconExternal size={14} />
                        <span className="truncate">{e.label || e.url}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {report.anonymous && (
                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <IconAlert size={16} /> <span>Anonymous report — reporter identity hidden from moderators</span>
                  </div>
                </div>
              )}

              {!report.anonymous && (
                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">Reporter</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
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
                    {report.reporterId && (
                      <div>
                        <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                          <IconShield size={14} /> User ID
                        </dt>
                        <dd className="mt-1 text-sm font-mono text-ink-600 dark:text-ink-400">{report.reporterId}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {report.reportedUsername && (
                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">Reported User</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconUsers size={14} /> Username
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{report.reportedUsername}</dd>
                    </div>
                    {report.reportedUserId && (
                      <div>
                        <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                          <IconShield size={14} /> User ID
                        </dt>
                        <dd className="mt-1 text-sm font-mono text-ink-600 dark:text-ink-400">{report.reportedUserId}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </CardBody>
          </Card>

          {content && (
            <Card>
              <CardHeader
                title="Reported Content"
                subtitle={contentHref ? "Click to view on site" : "Content not directly accessible"}
                icon={<IconEye size={18} />}
              />
              <CardBody className="space-y-4">
                {content.imageUrl && (
                  <Image
                    src={content.imageUrl}
                    alt={content.title || content.name || "Reported content"}
                    width={800}
                    height={450}
                    className="rounded-lg max-h-64 w-auto object-cover"
                  />
                )}
                {content.bannerUrl && (
                  <Image
                    src={content.bannerUrl}
                    alt={`${content.title || content.name} banner`}
                    width={800}
                    height={200}
                    className="rounded-lg max-h-48 w-auto object-cover"
                  />
                )}
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Title</dt>
                    <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100 font-medium">{content.title || content.name}</dd>
                  </div>
                  {content.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Description</dt>
                      <dd className="mt-1 text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">{content.description}</dd>
                    </div>
                  )}
                  {content.summary && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Summary</dt>
                      <dd className="mt-1 text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">{content.summary}</dd>
                    </div>
                  )}
                  {content.submitterName && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Submitted by</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.submitterName}</dd>
                    </div>
                  )}
                  {content.creator && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Creator</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.creator}</dd>
                    </div>
                  )}
                  {content.type && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Type</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.type}</dd>
                    </div>
                  )}
                  {content.status && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Status</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.status}</dd>
                    </div>
                  )}
                  {content.rank && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Rank</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.rank}</dd>
                    </div>
                  )}
                  {content.vrchatUsername && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">VRChat Username</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.vrchatUsername}</dd>
                    </div>
                  )}
                  {content.startDateTime && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">Starts</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{formatDateTime(new Date(content.startDateTime))}</dd>
                    </div>
                  )}
                  {content.state && (
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">State</dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">{content.state}</dd>
                    </div>
                  )}
                </dl>
                {contentHref && (
                  <Link href={contentHref} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                    <IconExternal size={14} className="mr-1.5" /> View on site
                  </Link>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Audit Log" icon={<IconNote size={18} />} />
            <CardBody className="p-0">
              {report.auditLogs.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-ink-500 dark:text-ink-400">No audit entries yet</div>
              ) : (
                <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                  {report.auditLogs.map((log) => (
                    <li key={log.id} className="px-5 py-4 hover:bg-ink-50 dark:hover:bg-ink-900/40">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                          <IconShield size={14} className="text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-ink-800 dark:text-ink-100">{log.action.replace(/_/g, " ")}</span>
                            <span className="text-ink-500 dark:text-ink-400">{relativeTime(log.createdAt)}</span>
                            {log.actorName && (
                              <span className="text-ink-500 dark:text-ink-400">by {log.actorName}</span>
                            )}
                          </div>
                          {log.detail && (
                            <p className="mt-1 text-sm text-ink-700 dark:text-ink-200">{log.detail}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Staff Actions" icon={<IconShield size={18} />} />
            <CardBody className="space-y-3">
              {report.status === "OPEN" && (
                <Button
                  className="w-full"
                  onClick={() => handleAction("assign", { assigneeId: currentStaff.id })}
                  loading={isActionLoading === "assign"}
                  leftIcon={<IconUsers size={15} />}
                >
                  Assign to me
                </Button>
              )}

              {report.assignedToId && report.assignedToId !== currentStaff.id && (
                <Button variant="outline" className="w-full" onClick={() => handleAction("assign", { assigneeId: currentStaff.id })} loading={isActionLoading === "assign"} leftIcon={<IconUsers size={15} />}>
                  Reassign to me
                </Button>
              )}

              {report.assignedToId === currentStaff.id && (
                <Button variant="outline" className="w-full" onClick={() => handleAction("unassign")} loading={isActionLoading === "unassign"} leftIcon={<IconUsers size={15} />}>
                  Unassign
                </Button>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowNoteDialog(true)}
                  leftIcon={<IconNote size={15} />}
                >
                  Add Note
                </Button>

                {(report.status === "OPEN" || report.status === "IN_REVIEW") && (
                  <Button
                    variant={report.priority === "HIGH" || report.priority === "URGENT" ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => setShowEscalateDialog(true)}
                    leftIcon={<IconAlert size={15} />}
                  >
                    Escalate
                  </Button>
                )}

                {(report.status === "OPEN" || report.status === "IN_REVIEW") && (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => setShowResolveDialog(true)}
                    leftIcon={<IconCheck size={15} />}
                  >
                    Resolve
                  </Button>
                )}

                {(report.status === "OPEN" || report.status === "IN_REVIEW") && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowDismissDialog(true)}
                    leftIcon={<IconTrash size={15} />}
                  >
                    Dismiss
                  </Button>
                )}

                <select
                  defaultValue={report.status}
                  onChange={(e) => handleAction("status", { status: e.target.value })}
                  disabled={isActionLoading === "status"}
                  className="select sm:col-span-2"
                >
                  {Object.entries(REPORT_STATUSES).map(([k, v]) => (
                    <option key={k} value={k} disabled={k === report.status}>
                      {v.label}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue={report.priority}
                  onChange={(e) => handleAction("priority", { priority: e.target.value })}
                  disabled={isActionLoading === "priority"}
                  className="select sm:col-span-2"
                >
                  {Object.entries(REPORT_PRIORITIES).map(([k, v]) => (
                    <option key={k} value={k} disabled={k === report.priority}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Report ID" icon={<IconFlag size={18} />} />
            <CardBody>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-500 dark:text-ink-400">ID</span>
                  <code className="font-mono text-ink-800 dark:text-ink-200">{report.id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500 dark:text-ink-400">Token</span>
                  <code className="font-mono text-ink-800 dark:text-ink-200">{report.reportToken}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500 dark:text-ink-400">Content ID</span>
                  <code className="font-mono text-ink-800 dark:text-ink-200">{report.contentId}</code>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      {showNoteDialog && (
        <NoteDialog
          open={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
          onSubmit={(note) => handleAction("note", { note })}
          loading={isActionLoading === "note"}
        />
      )}

      {showResolveDialog && (
        <ActionDialog
          open={showResolveDialog}
          onClose={() => setShowResolveDialog(false)}
          onSubmit={(resolution) => handleAction("resolve", { resolution })}
          loading={isActionLoading === "resolve"}
          title="Resolve Report"
          description="This will mark the report as resolved. Add a resolution note for the audit log."
          placeholder="Describe what action was taken..."
          buttonText="Resolve"
        />
      )}

      {showDismissDialog && (
        <ActionDialog
          open={showDismissDialog}
          onClose={() => setShowDismissDialog(false)}
          onSubmit={(resolution) => handleAction("dismiss", { resolution })}
          loading={isActionLoading === "dismiss"}
          title="Dismiss Report"
          description="This will dismiss the report without action. Add a reason for the audit log."
          placeholder="Reason for dismissal..."
          buttonText="Dismiss"
          variant="danger"
        />
      )}

      {showEscalateDialog && (
        <ActionDialog
          open={showEscalateDialog}
          onClose={() => setShowEscalateDialog(false)}
          onSubmit={(note) => handleAction("escalate", { note })}
          loading={isActionLoading === "escalate"}
          title="Escalate Report"
          description="This will escalate the report to urgent priority and mark it as escalated."
          placeholder="Reason for escalation..."
          buttonText="Escalate"
          variant="warning"
        />
      )}

      <Link href="/admin/reports" className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
        <IconArrowLeft size={16} /> Back to Reports
      </Link>
    </div>
  );
}

function NoteDialog({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (note: string) => void; loading: boolean }) {
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSubmit(note.trim());
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-2xl p-5 w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-2">Add Internal Note</h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">This note is only visible to staff and will be added to the audit log.</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add a note for the moderation team..."
            className="textarea w-full resize-y mb-4"
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Add Note</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionDialog({
  open,
  onClose,
  onSubmit,
  loading,
  title,
  description,
  placeholder,
  buttonText,
  variant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  loading: boolean;
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  variant?: "primary" | "danger" | "warning";
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text.trim());
    setText("");
    onClose();
  };

  const buttonVariant = variant === "danger" ? "danger" : variant === "warning" ? "primary" : variant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-2xl p-5 w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">{description}</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={placeholder}
            className="textarea w-full resize-y mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant={buttonVariant} loading={loading}>{buttonText}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}