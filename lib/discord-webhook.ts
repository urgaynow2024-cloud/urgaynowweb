import { postWebhook, buildRoleMentions, validateRoleIds } from "@/lib/discord";

export type WebhookSurface = "EVENT" | "ANNOUNCEMENT" | "POLL" | "UPDATE";

export type WebhookPayload = {
  surface: WebhookSurface;
  title: string;
  summary: string;
  url: string;
  roleIds?: string[];
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
};

const BRAND_COLOR = 0x750787;

function embedFor(payload: WebhookPayload) {
  return {
    title: payload.title.slice(0, 256),
    description: (payload.summary || payload.title).slice(0, 256),
    color: BRAND_COLOR,
    fields: payload.fields ?? [],
    timestamp: payload.timestamp ?? new Date().toISOString(),
    url: payload.url,
    footer: { name: "Ur Gay Now" },
  };
}

/**
 * Post a branded webhook for an event/announcement/poll/update.
 * Validates role IDs against the guild, builds mentions, and records
 * delivery status on the caller's model. Never throws — failures are
 * returned so callers can mark the record `failed` without losing it.
 */
export async function sendContentWebhook(
  urlEnv: string,
  payload: WebhookPayload,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const safeRoleIds = await validateRoleIds(payload.roleIds ?? []);
  const mentions = buildRoleMentions(safeRoleIds);
  const result = await postWebhook(urlEnv, {
    content: mentions || undefined,
    embeds: [embedFor(payload)],
  });
  return result;
}