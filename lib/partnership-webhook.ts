import "server-only";

import { getSetting } from "@/lib/settings";
import { isAllowedDiscordWebhook, normalizeWebhookUrl } from "@/lib/report-webhook-url";

export const PARTNERSHIP_WEBHOOK_ENV_VARS = [
  "DISCORD_PARTNERSHIP_WEBHOOK_URL",
  "UGN_PARTNERSHIP_WEBHOOK_URL",
] as const;

const BRAND_COLOR = 0x750787;

export type PartnershipWebhookResult = {
  status: "SENT" | "FAILED" | "SKIPPED";
  error?: string;
  messageId?: string;
};

export type PartnershipWebhookInput = {
  id: string;
  name: string;
  email: string;
  discord?: string | null;
  website?: string | null;
  description: string;
  status: string;
  action: "submitted" | "approved" | "rejected";
  reviewerName?: string | null;
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").replace(/\/$/, "");
}

/** Resolve the configured partnership webhook URL. Never logged, never exposed to client. */
export async function resolvePartnershipWebhookUrl(): Promise<string> {
  for (const name of PARTNERSHIP_WEBHOOK_ENV_VARS) {
    const value = normalizeWebhookUrl(process.env[name] || "");
    if (value) return value;
  }
  try {
    return normalizeWebhookUrl(await getSetting("discordPartnershipWebhookUrl"));
  } catch {
    return "";
  }
}

/**
 * Send a partnership notification to Discord. Never throws.
 */
export async function sendPartnershipWebhook(
  application: PartnershipWebhookInput,
): Promise<PartnershipWebhookResult> {
  try {
    const rawUrl = await resolvePartnershipWebhookUrl();

    if (!rawUrl) {
      return { status: "SKIPPED", error: "No partnership webhook is configured" };
    }
    if (!isAllowedDiscordWebhook(rawUrl)) {
      return { status: "FAILED", error: "Configured webhook URL is not a Discord webhook" };
    }

    const dashboardUrl = `${siteUrl()}/admin/partnerships/${application.id}`;

    const actionLabel: Record<string, string> = {
      submitted: "New partnership application",
      approved: "Partnership application approved",
      rejected: "Partnership application rejected",
    };

    const response = await fetch(rawUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Ur Gay Now Partnerships",
        embeds: [{
          title: `${application.name} â€” ${actionLabel[application.action]}`,
          description:
            application.description.slice(0, 1000) ||
            "No description provided.",
          url: dashboardUrl,
          color: BRAND_COLOR,
          fields: [
            { name: "Applicant", value: application.name, inline: true },
            { name: "Email", value: application.email, inline: true },
            { name: "Discord", value: application.discord || "Not provided", inline: true },
            { name: "Website", value: application.website || "Not provided", inline: true },
            { name: "Status", value: application.status, inline: true },
            ...(application.reviewerName
              ? [{ name: "Reviewed by", value: application.reviewerName, inline: true }]
              : []),
          ],
          footer: { text: "Ur Gay Now Partnerships" },
          timestamp: new Date().toISOString(),
        }],
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
