import "server-only";
import { getSetting } from "@/lib/settings";

export type DiscordMessage = {
  id: string;
  content: string;
  timestamp: string;
  attachments: { url: string; contentType?: string }[];
};

export type DiscordWebhookResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

async function discordFetch(url: string, token: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord API error (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Resolve the configured Discord bot token and guild ID so we can look up
 * roles for validation and mention rendering.
 */
export async function getDiscordContext(): Promise<{
  token: string;
  channelId: string;
  guildId: string | null;
}> {
  const token = (await getSetting("discordBotToken")).trim();
  const channelId = (await getSetting("discordAnnouncementChannelId")).trim();
  if (!token || !channelId) {
    throw new Error("Discord bot token and announcement channel ID are not configured.");
  }
  let guildId: string | null = null;
  try {
    const channel = await discordFetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      token,
    );
    guildId = channel?.guild_id ?? null;
  } catch {
    /* guildId stays null; role validation will be skipped */
  }
  return { token, channelId, guildId };
}

/**
 * Fetch the guild's role list so staff can pick roles to mention.
 * Returns an array of { id, name } sorted by position.
 */
export async function listGuildRoles(): Promise<Array<{ id: string; name: string }>> {
  const { token, guildId } = await getDiscordContext();
  if (!guildId) return [];
  const roles = (await discordFetch(
    `https://discord.com/api/v10/guilds/${guildId}/roles`,
    token,
  )) as any[];
  return (roles ?? [])
    .filter((r) => r && r.id && r.name && !r.managed)
    .map((r) => ({ id: String(r.id), name: String(r.name) }))
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * Validate role IDs against the guild role list.
 * Unknown IDs are dropped; @here / @everyone are never allowed.
 */
export async function validateRoleIds(roleIds: string[]): Promise<string[]> {
  if (roleIds.length === 0) return [];
  const allowed = await listGuildRoles();
  const allowedIds = new Set(allowed.map((r) => r.id));
  return roleIds.filter((id) => allowedIds.has(id));
}

/**
 * Build the mention content line for a set of validated role IDs.
 * Returns empty string when no roles are selected.
 */
export function buildRoleMentions(roleIds: string[]): string {
  if (roleIds.length === 0) return "";
  return roleIds.map((id) => `<@&${id}>`).join(" ");
}

/**
 * Post a message to a Discord webhook URL.
 * Reads the URL from the named environment variable; throws on failure.
 */
export async function postWebhook(
  urlEnv: string,
  payload: { content?: string; embeds: any[] },
): Promise<DiscordWebhookResult> {
  const url = (process.env[urlEnv] || "").trim();
  if (!url) {
    return { ok: false, error: `${urlEnv} is not configured` };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Discord webhook error (${res.status}): ${body.slice(0, 200)}` };
    }
    // Webhook executors can return the message id in the body.
    let messageId: string | undefined;
    try {
      const json = await res.json();
      messageId = json?.id;
    } catch {
      /* no body — that's fine */
    }
    return { ok: true, messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown webhook error" };
  }
}

export async function fetchDiscordMessages(limit = 20): Promise<DiscordMessage[]> {
  const { token, channelId } = await getDiscordContext();

  const data = (await discordFetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    token,
  )) as any[];

  return data.map((m) => ({
    id: m.id,
    content: m.content ?? "",
    timestamp: m.timestamp ?? new Date().toISOString(),
    attachments: Array.isArray(m.attachments)
      ? m.attachments.map((a: any) => ({ url: a.url, contentType: a.content_type }))
      : [],
  }));
}

/**
 * Turn Discord-specific markup into readable markdown the website can render:
 *   <@&ROLE_ID>  -> @RoleName
 *   <#CHANNEL_ID>  -> #channel-name
 *   <@USER_ID>    -> @user
 *   <:emoji:ID>   -> :emoji:
 * Standard markdown (**, # headings, > quotes, lists) passes through untouched so
 * react-markdown + remark-gfm renders it. Best-effort: if the role/channel
 * lookups fail we keep the original text instead of aborting the import.
 */
export async function renderDiscordMessage(raw: string): Promise<string> {
  if (!raw) return raw;

  let roles = new Map<string, string>();
  let channels = new Map<string, string>();

  try {
    const { token, channelId, guildId } = await getDiscordContext();
    if (guildId) {
      const [roleList, channelList] = await Promise.all([
        discordFetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, token).catch(
          () => [] as any[],
        ),
        discordFetch(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          token,
        ).catch(() => [] as any[]),
      ]);
      for (const r of roleList ?? []) if (r.id && r.name) roles.set(r.id, r.name);
      for (const c of channelList ?? []) if (c.id && c.name) channels.set(c.id, c.name);
    }
  } catch {
    /* keep empty maps; fall back to raw mentions below */
  }

  return raw
    .replace(/<@&(\d+)>/g, (_, id) => `@${roles.get(id) ?? "role"}`)
    .replace(/<#(\d+)>/g, (_, id) => `#${channels.get(id) ?? "channel"}`)
    .replace(/<@!?(\d+)>/g, "@user")
    .replace(/<a?:([a-zA-Z0-9_]+):\d+>/g, ":$1:");
}
