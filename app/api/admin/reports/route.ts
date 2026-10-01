import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  VALID_PRIORITIES,
  VALID_STATUSES,
  type ReportStatus,
} from "@/lib/reports";
import { authorizeReportStaff, staffAuthErrorResponse } from "@/lib/report-auth";
import type { ReportPermission } from "@/lib/report-access";
import { sendReportWebhook } from "@/lib/report-webhook";

export const runtime = "nodejs";

/** Which staff permission each report action requires. */
const ACTION_PERMISSIONS: Record<string, ReportPermission> = {
  assign: "reports.assign",
  unassign: "reports.assign",
  status: "reports.review",
  priority: "reports.review",
  note: "reports.notes",
  escalate: "reports.escalate",
  resolve: "reports.resolve",
  dismiss: "reports.dismiss",
  action: "reports.resolve",
  retryWebhook: "reports.webhookRetry",
};

const TERMINAL_STATUSES: ReportStatus[] = ["RESOLVED", "DISMISSED"];

async function addAuditEntry(
  reportId: string,
  action: string,
  actor: { id: string; name: string },
  detail: string,
) {
  await prisma.reportAuditLog.create({
    data: { reportId, action, actorId: actor.id, actorName: actor.name, detail: detail.slice(0, 2000) },
  });
}

export async function PATCH(req: Request) {
  let body: {
    reportId?: string;
    action?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    note?: string;
    resolution?: string;
    resolutionNote?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";

  // Server-side authorization comes before anything else that could reveal
  // report state. Never trust a client-provided staff id, role, or permission.
  if (!action || !(action in ACTION_PERMISSIONS)) {
    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  }

  const auth = await authorizeReportStaff(req, ACTION_PERMISSIONS[action]);
  if (!auth.ok) return staffAuthErrorResponse(auth);
  const staff = auth.staff;

  if (!reportId || !/^[a-z0-9]{15,32}$/i.test(reportId)) {
    return NextResponse.json({ success: false, error: "Invalid report id." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      priority: true,
      reason: true,
      source: true,
      anonymous: true,
      reportedPerson: true,
      reportedUsername: true,
      assignedToId: true,
      reference: true,
      evidence: true,
      links: true,
      webhookStatus: true,
    },
  });

  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found." }, { status: 404 });
  }

  try {
    switch (action) {
      case "assign": {
        const assigneeId = typeof body.assigneeId === "string" ? body.assigneeId.trim() : "";
        if (!assigneeId) {
          return NextResponse.json({ success: false, error: "Missing assignee." }, { status: 400 });
        }
        const assignee = await prisma.staff.findUnique({
          where: { id: assigneeId },
          select: { id: true, name: true },
        });
        if (!assignee) {
          return NextResponse.json({ success: false, error: "Assignee not found." }, { status: 404 });
        }
        await prisma.report.update({
          where: { id: reportId },
          data: {
            assignedToId: assignee.id,
            status: report.status === "OPEN" ? "IN_REVIEW" : report.status,
          },
        });
        await addAuditEntry(
          reportId,
          "ASSIGNED",
          staff,
          `Assigned to ${assignee.name}${report.status === "OPEN" ? " and moved to Reviewing" : ""}.`,
        );
        break;
      }

      case "unassign": {
        await prisma.report.update({
          where: { id: reportId },
          data: { assignedToId: null },
        });
        await addAuditEntry(reportId, "UNASSIGNED", staff, "Unassigned by staff.");
        break;
      }

      case "status": {
        const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
        if (!status || !VALID_STATUSES.has(status)) {
          return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
        }
        if (status === report.status) {
          return NextResponse.json(
            { success: false, error: "That is already the current status." },
            { status: 400 },
          );
        }
        if (status === "DISMISSED" && !staff.permissions.includes("reports.dismiss")) {
          return NextResponse.json(
            { success: false, error: "Your role cannot dismiss reports." },
            { status: 403 },
          );
        }
        if (status === "RESOLVED" && !staff.permissions.includes("reports.resolve")) {
          return NextResponse.json(
            { success: false, error: "Your role cannot resolve reports." },
            { status: 403 },
          );
        }

        const isTerminal = TERMINAL_STATUSES.includes(status as ReportStatus);
        const updateData: Record<string, unknown> = { status };
        if (isTerminal) {
          const resolution =
            typeof body.resolution === "string" ? body.resolution.trim().slice(0, 2000) : "";
          updateData.resolution = resolution;
          updateData.resolvedById = staff.id;
          updateData.resolvedAt = new Date();
        }

        await prisma.report.update({ where: { id: reportId }, data: updateData });
        await addAuditEntry(
          reportId,
          "STATUS_CHANGED",
          staff,
          `Status changed from ${report.status} to ${status}.`,
        );

        if (isTerminal) {
          await notifyStaffOfClosure(report, status, staff.name);
        }
        break;
      }

      case "priority": {
        const priority = typeof body.priority === "string" ? body.priority.trim().toUpperCase() : "";
        if (!priority || !VALID_PRIORITIES.has(priority)) {
          return NextResponse.json({ success: false, error: "Invalid priority." }, { status: 400 });
        }
        if (priority === report.priority) {
          return NextResponse.json(
            { success: false, error: "That is already the current priority." },
            { status: 400 },
          );
        }
        await prisma.report.update({ where: { id: reportId }, data: { priority } });
        await addAuditEntry(
          reportId,
          "PRIORITY_CHANGED",
          staff,
          `Priority changed from ${report.priority} to ${priority}.`,
        );
        break;
      }

      case "note": {
        const note = typeof body.note === "string" ? body.note.trim() : "";
        if (!note) {
          return NextResponse.json({ success: false, error: "Note cannot be empty." }, { status: 400 });
        }
        await addAuditEntry(reportId, "NOTE_ADDED", staff, note);
        break;
      }

      case "action": {
        const note = typeof body.note === "string" ? body.note.trim() : "";
        if (note.length < 3) {
          return NextResponse.json(
            { success: false, error: "Describe the action you took." },
            { status: 400 },
          );
        }
        await prisma.report.update({ where: { id: reportId }, data: { updatedAt: new Date() } });
        await addAuditEntry(reportId, "ACTION_RECORDED", staff, note);
        break;
      }

      case "escalate": {
        const note = typeof body.note === "string" ? body.note.trim() : "";
        await prisma.report.update({
          where: { id: reportId },
          data: { status: "ESCALATED", priority: "URGENT" },
        });
        await addAuditEntry(
          reportId,
          "ESCALATED",
          staff,
          note ? `Escalated to urgent: ${note}` : "Escalated to urgent priority.",
        );
        break;
      }

      case "resolve": {
        const resolution =
          typeof body.resolution === "string" ? body.resolution.trim().slice(0, 2000) : "";
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "RESOLVED",
            resolvedById: staff.id,
            resolvedAt: new Date(),
            resolution,
          },
        });
        await addAuditEntry(reportId, "RESOLVED", staff, resolution || "Report resolved.");
        await notifyStaffOfClosure(report, "RESOLVED", staff.name);
        break;
      }

      case "dismiss": {
        const resolution =
          typeof body.resolution === "string" ? body.resolution.trim().slice(0, 2000) : "";
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "DISMISSED",
            resolvedById: staff.id,
            resolvedAt: new Date(),
            resolution,
          },
        });
        await addAuditEntry(reportId, "DISMISSED", staff, resolution || "Report dismissed.");
        await notifyStaffOfClosure(report, "DISMISSED", staff.name);
        break;
      }

      case "retryWebhook": {
        if (report.webhookStatus === "SENT") {
          return NextResponse.json(
            { success: false, error: "The staff notification was already delivered." },
            { status: 400 },
          );
        }
        const evidenceCount = await prisma.reportEvidence.count({ where: { reportId } });
        const result = await sendReportWebhook(
          {
            reference: report.reference,
            id: report.id,
            category: report.reason,
            status: report.status,
            priority: report.priority,
            source: report.source,
            reportedPerson: report.reportedPerson,
            reportedUsername: report.reportedUsername,
            anonymous: report.anonymous,
            evidenceCount,
            linkCount: countLinks(report.links),
            action: "retried",
          },
          undefined,
        );

        await prisma.report.update({
          where: { id: reportId },
          data: {
            webhookStatus: result.status,
            webhookError: (result.error ?? "").slice(0, 500),
            webhookSentAt: result.status === "SENT" ? new Date() : null,
            webhookAttempts: { increment: 1 },
          },
        });

        await addAuditEntry(
          reportId,
          result.status === "SENT" ? "WEBHOOK_SENT" : "WEBHOOK_FAILED",
          staff,
          result.status === "SENT"
            ? "Staff notification delivered on manual retry."
            : `Retry failed (${result.status}): ${(result.error ?? "unknown").slice(0, 200)}`,
        );

        if (result.status !== "SENT") {
          return NextResponse.json(
            {
              success: false,
              error:
                result.status === "SKIPPED"
                  ? "No report webhook is configured on this deployment."
                  : "The Discord webhook could not be reached.",
              webhookStatus: result.status,
            },
            { status: 502 },
          );
        }
        break;
      }
    }

    const updated = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reference: true,
        status: true,
        priority: true,
        assignedToId: true,
        webhookStatus: true,
        resolution: true,
        resolvedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    console.error("[admin/reports] action failed", {
      reportId,
      action,
      staff: staff.id,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: "The action could not be completed." },
      { status: 500 },
    );
  }
}

/**
 * Notify the staff channel that a report was closed. This goes to staff only —
 * reporters follow progress on their private tracking link, so no reporter
 * details or private moderation content are ever posted to Discord.
 */
async function notifyStaffOfClosure(
  report: { id: string; reference: string | null; reason: string; source: string },
  status: string,
  staffName: string,
) {
  const evidenceCount = await prisma.reportEvidence.count({ where: { reportId: report.id } });
  await sendReportWebhook({
    reference: report.reference,
    id: report.id,
    category: report.reason,
    status,
    priority: "NORMAL",
    source: report.source,
    reportedPerson: null,
    reportedUsername: null,
    anonymous: true,
    evidenceCount,
    linkCount: 0,
    action: status === "RESOLVED" ? "resolved" : "status",
    statusNote: `Closed by ${staffName}`,
  });
}

function countLinks(json: string): number {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/** Staff-only report detail for the dashboard (never exposes the raw evidence bytes). */
export async function GET(req: Request) {
  const auth = await authorizeReportStaff(req, "reports.view");
  if (!auth.ok) return staffAuthErrorResponse(auth);

  const url = new URL(req.url);
  const reportId = url.searchParams.get("id")?.trim() ?? "";
  if (!/^[a-z0-9]{15,32}$/i.test(reportId)) {
    return NextResponse.json({ success: false, error: "Invalid report id." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      reference: true,
      reportToken: true,
      status: true,
      priority: true,
      reason: true,
      source: true,
      description: true,
      reporterName: true,
      reporterEmail: true,
      anonymous: true,
      reportedPerson: true,
      reportedDiscord: true,
      incidentAt: true,
      links: true,
      evidence: true,
      contentType: true,
      contentId: true,
      reportedUsername: true,
      resolution: true,
      webhookStatus: true,
      createdAt: true,
      evidenceFiles: {
        select: { id: true, fileName: true, contentType: true, size: true, createdAt: true },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found." }, { status: 404 });
  }

  await prisma.report
    .update({ where: { id: reportId }, data: { lastViewedAt: new Date() } })
    .catch(() => undefined);

  return NextResponse.json({ success: true, report });
}