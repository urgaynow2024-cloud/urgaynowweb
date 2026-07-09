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
  const entries = Object.entries(values);
  if (entries.length === 0) return;
  // Batch all upserts into a single transaction so one admin save issues one
  // round-trip to the database instead of one-per-setting (14 round-trips),
  // which thrashes the connection pool on serverless DBs and can trip rate
  // limits ("Too Many Requests").
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );
}
