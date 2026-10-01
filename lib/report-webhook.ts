import "server-only";

import { getSetting } from "@/lib/settings";
import { isAllowedDiscordWebhook, normalizeWebhookUrl } from "@/lib/report-webhook-url";
import {
  getPriorityLabel,
  getReasonLabel,
  getReportLabel,
  getStatusLabel,
  type ReportWebhookStatus,
} from "@/lib/reports";

/**
 * Discord staff notification for reports.
 *
 * Security rules enforced here:
 *   * The webhook URL is only ever read on the server. It is never sent to the
 *     client, never returned in an API response, and never logged.
 *   * Only non-sensitive metadata is sent. The report description, evidence,
 *     uploaded files, reporter contact details, and internal notes never leave
 *     the staff dashboard.
 *   * Delivery failures never throw. The report is already stored; the caller
 *     records the failure and staff can retry from the dashboard.
 */

export const REPORT_WEBHOOK_ENV_VARS = [
  "UGN_REPORT_WEBHOOK_URL",
  "DISCORD_REPORTS_WEBHOOK_URL",
] as const;

const BRAND_COLOR = 0x6d28d9;
const URGENT_COLOR = 0xb42335;

export type ReportWebhookResult = {
  status: ReportWebhookStatus;
  error?: string;
  messageId?: string;
};

export type ReportWebhookInput = {
  reference: string | null;
  id: string;
  category: string;
  status: string;
  priority: string;
  source: string;
  reportedPerson?: string | null;
  reportedUsername?: string | null;
  anonymous?: boolean;
  evidenceCount?: number;
  linkCount?: number;
  action?: "submitted" | "status" | "resolved" | "retried";
  statusNote?: string | null;
};

/**
 * Resolve the configured staff webhook. Returns "" when nothing is configured
 * so callers can record `SKIPPED` instead of pretending a message was sent.
 */
export async function resolveReportWebhookUrl(): Promise<string> {
  for (const name of REPORT_WEBHOOK_ENV_VARS) {
    const value = normalizeWebhookUrl(process.env[name] || "");
    if (value) return value;
  }
  try {
    return normalizeWebhookUrl(await getSetting("discordReportsWebhookUrl"));
  } catch {
    return "";
  }
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").replace(/\/$/, "");
}

function buildEmbeds(report: ReportWebhookInput, dashboardUrl: string) {
  const label = getReportLabel(report as { reference: string | null; id: string });
  const category = getReasonLabel(report.category);
  const person = report.reportedPerson || report.reportedUsername || "Not specified";
  const urgent = report.priority === "URGENT" || report.category === "SAFEGUARDING";

  const fields = [
    { name: "Category", value: category, inline: true },
    { name: "Reported person", value: truncate(person, 80), inline: true },
    { name: "Priority", value: getPriorityLabel(report.priority), inline: true },
    { name: "Status", value: getStatusLabel(report.status), inline: true },
    {
      name: "Type",
      value: report.source === "COMMUNITY" ? "Community report" : "Website content",
      inline: true,
    },
    {
      name: "Reporter",
      value: report.anonymous ? "Anonymous" : "Identified (see dashboard)",
      inline: true,
    },
    {
      name: "Attachments",
      value: `${report.evidenceCount ?? 0} file(s), ${report.linkCount ?? 0} link(s)`,
      inline: true,
    },
  ];

  const actionLabel: Record<string, string> = {
    submitted: "New report submitted",
    status: "Report updated",
    resolved: "Report closed",
    retried: "Report notification retried",
  };

  return [
    {
      title: `${label} — ${category}`,
      description:
        "Details and evidence stay in the staff dashboard. " +
        "Open the report to read the full description.",
      url: dashboardUrl,
      color: urgent ? URGENT_COLOR : BRAND_COLOR,
      fields,
      footer: { text: `Ur Gay Now — ${actionLabel[report.action ?? "submitted"]}` },
      timestamp: new Date().toISOString(),
    },
  ];
}

function truncate(value: string, max: number): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/**
 * Safe description of a webhook URL for server logs: host and path segment
 * lengths only. The webhook token is never logged.
 */
function describeUrl(value: string): Record<string, unknown> {
  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      protocol: url.protocol,
      pathSegments: url.pathname.split("/").filter(Boolean).map((s) => s.length),
      length: value.length,
    };
  } catch {
    return { parseError: true, length: value.length };
  }
}

/**
 * Send the staff notification for a report. Never throws: the return value is
 * the accurate delivery state that must be stored on the report.
 */
export async function sendReportWebhook(
  report: ReportWebhookInput,
  webhookUrlOverride?: string,
): Promise<ReportWebhookResult> {
  try {
    const rawUrl = normalizeWebhookUrl(
      webhookUrlOverride || (await resolveReportWebhookUrl()),
    );

    if (!rawUrl) {
      return { status: "SKIPPED", error: "No report webhook is configured" };
    }
    if (!isAllowedDiscordWebhook(rawUrl)) {
      console.warn("[report-webhook] rejected webhook URL", describeUrl(rawUrl));
      return { status: "FAILED", error: "Configured webhook URL is not a Discord webhook" };
    }

    const dashboardUrl = `${siteUrl()}/admin/reports/${report.id}`;

    const response = await fetch(rawUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        username: "Ur Gay Now Reports",
        embeds: buildEmbeds(report, dashboardUrl),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        status: "FAILED",
        error: `Discord webhook error (${response.status}): ${body.slice(0, 180)}`,
      };
    }

    let messageId: string | undefined;
    try {
      const json = await response.json();
      messageId = typeof json?.id === "string" ? json.id : undefined;
    } catch {
      /* Discord always returns a body here; ignore if it does not */
    }

    return { status: "SENT", messageId };
  } catch (error) {
    return {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Unknown webhook error",
    };
  }
}

/** Record the delivery attempt on the report row. Never throws. */
export async function recordWebhookResult(
  prisma: {
    report: {
      update: (args: unknown) => Promise<unknown>;
    };
  },
  reportId: string,
  result: ReportWebhookResult,
  options: { incrementAttempts?: boolean } = {},
): Promise<void> {
  try {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        webhookStatus: result.status,
        webhookError: (result.error ?? "").slice(0, 500),
        webhookSentAt: result.status === "SENT" ? new Date() : undefined,
        ...(options.incrementAttempts ? { webhookAttempts: { increment: 1 } } : {}),
      },
    });
  } catch (error) {
    console.error("[report-webhook] could not record delivery state", {
      reportId,
      status: result.status,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}