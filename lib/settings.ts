import "server-only";
import { prisma } from "@/lib/db";

const DEFAULT_SETTINGS: Record<string, string> = {
  siteTagline: "",
  homeIntro: "",
  homeFeaturedTitle: "",
  aboutContent: "",
  supportMessage: "",
  supportEmail: "",
  discordInvite: "",
  vrchatGroupUrl: "",
  socialDiscord: "",
  socialTwitter: "",
  socialInstagram: "",
  socialTiktok: "",
  socialYoutube: "",
  discordBotToken: "",
  discordAnnouncementChannelId: "",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (row) return row.value;
  return DEFAULT_SETTINGS[key] ?? "";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function setManySettings(values: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    await setSetting(key, value);
  }
}
