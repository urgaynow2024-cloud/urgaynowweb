import "server-only";
import { getSetting } from "@/lib/settings";

export type DiscordMessage = {
  id: string;
  content: string;
  timestamp: string;
  attachments: { url: string; contentType?: string }[];
};

export async function fetchDiscordMessages(limit = 20): Promise<DiscordMessage[]> {
  const token = (await getSetting("discordBotToken")).trim();
  const channelId = (await getSetting("discordAnnouncementChannelId")).trim();

  if (!token || !channelId) {
    throw new Error("Discord bot token and announcement channel ID are not configured.");
  }

  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as any[];
  return data.map((m) => ({
    id: m.id,
    content: m.content ?? "",
    timestamp: m.timestamp ?? new Date().toISOString(),
    attachments: Array.isArray(m.attachments)
      ? m.attachments.map((a: any) => ({ url: a.url, contentType: a.content_type }))
      : [],
  }));
}
