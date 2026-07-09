import "server-only";
import { getSetting } from "@/lib/settings";

export type DiscordMessage = {
  id: string;
  content: string;
  timestamp: string;
  attachments: { url: string; contentType?: string }[];
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

export async function fetchDiscordMessages(limit = 20): Promise<DiscordMessage[]> {
  const token = (await getSetting("discordBotToken")).trim();
  const channelId = (await getSetting("discordAnnouncementChannelId")).trim();

  if (!token || !channelId) {
    throw new Error("Discord bot token and announcement channel ID are not configured.");
  }

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

  const token = (await getSetting("discordBotToken")).trim();
  const channelId = (await getSetting("discordAnnouncementChannelId")).trim();

  const roles = new Map<string, string>();
  const channels = new Map<string, string>();

  if (token && channelId) {
    try {
      const channel = await discordFetch(
        `https://discord.com/api/v10/channels/${channelId}`,
        token,
      );
      const guildId: string | undefined = channel?.guild_id;
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
  }

  return raw
    .replace(/<@&(\d+)>/g, (_, id) => `@${roles.get(id) ?? "role"}`)
    .replace(/<#(\d+)>/g, (_, id) => `#${channels.get(id) ?? "channel"}`)
    .replace(/<@!?(\d+)>/g, "@user")
    .replace(/<a?:([a-zA-Z0-9_]+):\d+>/g, ":$1:");
}
