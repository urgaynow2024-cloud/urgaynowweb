import "server-only";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

type NotifyPayload = {
  title: string;
  body: string;
  url?: string;
};

function envFlag(name: string): boolean {
  const v = (process.env[name] ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Best-effort email via a fetch-based provider (Resend-compatible). No-op if unset. */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "status@urgaynow.com";
  if (!apiKey) return; // provider not configured
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
  } catch {
    /* non-fatal */
  }
}

/** Post a message to a Discord incoming webhook URL. */
export async function sendDiscordWebhook(webhookUrl: string, content: string): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 2000) }),
    });
  } catch {
    /* non-fatal */
  }
}

/**
 * Notify all subscribers of a status change. Honors each subscriber's channel
 * (email and/or Discord webhook). Failures are swallowed so a single bad
 * subscriber can never break an admin action.
 */
export async function notifySubscribers(payload: NotifyPayload): Promise<void> {
  if (!envFlag("STATUS_NOTIFICATIONS_ENABLED")) return;
  const subs = await prisma.statusSubscriber.findMany().catch(() => []);
  const text = `${payload.title}\n\n${payload.body}${payload.url ? `\n\n${payload.url}` : ""}`;
  const discordContent = `**${payload.title}**\n${payload.body}${payload.url ? `\n${payload.url}` : ""}`;

  await Promise.all(
    subs.map(async (s) => {
      const tasks: Promise<void>[] = [];
      if (s.email) tasks.push(sendEmail(s.email, payload.title, text));
      if (s.discordWebhook) tasks.push(sendDiscordWebhook(s.discordWebhook, discordContent));
      await Promise.all(tasks).catch(() => {});
    }),
  );
}

/** Discord webhook used for the global status announcements (optional). */
export async function announceToStatusWebhook(payload: NotifyPayload): Promise<void> {
  const url = (await getSetting("statusDiscordWebhook")).trim();
  if (!url) return;
  await sendDiscordWebhook(url, `**${payload.title}**\n${payload.body}`);
}
