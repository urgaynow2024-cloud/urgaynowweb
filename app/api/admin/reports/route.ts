import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { VALID_STATUSES, VALID_PRIORITIES, VALID_REASONS, getReasonLabel } from "@/lib/reports";

export const runtime = "nodejs";

async function notifyReporterOfResolution(report: {
  id: string;
  reportToken: string;
  reporterEmail: string | null;
  reporterName: string;
  reason: string;
  status: string;
  resolution: string;
  anonymous: boolean;
}) {
  if (!report.reporterEmail || report.anonymous) return;

  try {
    const webhookUrl = (await getSetting("discordReportsWebhookUrl")).trim();
    if (!webhookUrl) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
    const trackUrl = `${siteUrl}/report/track/${report.reportToken}`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `📋 **Your report has been ${report.status.toLowerCase()}**`,
        embeds: [{
          title: `Report #${report.id.slice(0, 8)}`,
          description: `Your report for **${getReasonLabel(report.reason)}** has been ${report.status.toLowerCase()}.`,
          color: report.status === "RESOLVED" ? 0x22c55e : 0x6b7280,
          fields: [
            { name: "Resolution", value: report.resolution || "No details provided", inline: false },
          ],
          timestamp: new Date().toISOString(),
          url: trackUrl,
          footer: { text: "Ur Gay Now Reports" },
        }],
      }),
    });
  } catch {
    // Don't fail the action if notification fails
  }
}

async function requireStaff() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff) {
    return { session: null, error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { session, staff, error: null };
}

export async function PATCH(req: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { session, staff } = auth;
  const body = await req.json().catch(() => ({}));
  const { reportId, action, ...data } = body;

  if (!reportId) {
    return NextResponse.json({ success: false, error: "Missing reportId" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ 
    where: { id: reportId },
    select: {
      id: true,
      reportToken: true,
      reporterEmail: true,
      reporterName: true,
      reason: true,
      status: true,
      resolution: true,
      anonymous: true,
    }
  });
  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
  }

  try {
    let updatedReport;
    let auditAction: string;
    let auditDetail: string;

    switch (action) {
      case "assign": {
        const { assigneeId } = data;
        if (!assigneeId) {
          return NextResponse.json({ success: false, error: "Missing assigneeId" }, { status: 400 });
        }
        const assignee = await prisma.staff.findUnique({ where: { id: assigneeId } });
        if (!assignee) {
          return NextResponse.json({ success: false, error: "Assignee not found" }, { status: 404 });
        }
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { assignedToId: assigneeId, status: "IN_REVIEW" },
        });
        auditAction = "ASSIGNED";
        auditDetail = `Assigned to ${assignee.name}`;
        break;
      }

      case "unassign": {
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { assignedToId: null, status: "OPEN" },
        });
        auditAction = "UNASSIGNED";
        auditDetail = "Unassigned";
        break;
      }

      case "status": {
        const { status } = data;
        if (!status || !VALID_STATUSES.has(status)) {
          return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }
        const updateData: Record<string, unknown> = { status };
        if (status === "RESOLVED" || status === "DISMISSED") {
          updateData.resolvedById = staff.id;
          updateData.resolvedAt = new Date();
          updateData.resolution = data.resolution || "";
        }
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: updateData,
        });
        auditAction = "STATUS_CHANGED";
        auditDetail = `Status changed to ${status}`;
        break;
      }

      case "priority": {
        const { priority } = data;
        if (!priority || !VALID_PRIORITIES.has(priority)) {
          return NextResponse.json({ success: false, error: "Invalid priority" }, { status: 400 });
        }
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { priority },
        });
        auditAction = "PRIORITY_CHANGED";
        auditDetail = `Priority changed to ${priority}`;
        break;
      }

      case "note": {
        const { note } = data;
        if (!note || !note.trim()) {
          return NextResponse.json({ success: false, error: "Note cannot be empty" }, { status: 400 });
        }
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { updatedAt: new Date() },
        });
        auditAction = "NOTE_ADDED";
        auditDetail = note.trim();
        break;
      }

      case "resolve": {
        const { resolution } = data;
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "RESOLVED",
            resolvedById: staff.id,
            resolvedAt: new Date(),
            resolution: resolution || "",
          },
        });
        auditAction = "RESOLVED";
        auditDetail = resolution || "Report resolved";
        break;
      }

      case "dismiss": {
        const { resolution } = data;
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "DISMISSED",
            resolvedById: staff.id,
            resolvedAt: new Date(),
            resolution: resolution || "Report dismissed",
          },
        });
        auditAction = "DISMISSED";
        auditDetail = resolution || "Report dismissed";
        break;
      }

      case "escalate": {
        const { note } = data;
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "ESCALATED",
            priority: "URGENT",
          },
        });
        auditAction = "ESCALATED";
        auditDetail = note || "Report escalated";
        break;
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await prisma.reportAuditLog.create({
      data: {
        reportId,
        action: auditAction,
        actorId: staff.id,
        actorName: staff.name,
        detail: auditDetail,
      },
    });

    if (action === "resolve" || action === "dismiss" || (action === "status" && (data.status === "RESOLVED" || data.status === "DISMISSED"))) {
      await notifyReporterOfResolution({
        id: report.id,
        reportToken: report.reportToken,
        reporterEmail: report.reporterEmail,
        reporterName: report.reporterName,
        reason: report.reason,
        status: updatedReport.status,
        resolution: updatedReport.resolution,
        anonymous: report.anonymous,
      });
    }

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[admin/reports] action failure", { reportId, action, message });
    return NextResponse.json({ success: false, error: "Action failed" }, { status: 500 });
  }
}