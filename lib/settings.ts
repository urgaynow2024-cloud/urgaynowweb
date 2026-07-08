import "server-only";
import { prisma } from "@/lib/db";

const DEFAULT_SETTINGS: Record<string, string> = {
  siteTagline: "The official community hub for Ur Gay Now.",
  homeIntro:
    "Welcome to Ur Gay Now — a welcoming, colourful, and LGBTQ+ friendly community. Find our latest announcements, events, rules, staff, guides, and more, all in one place.",
  homeFeaturedTitle: "What's happening",
  aboutContent:
    "Ur Gay Now is a vibrant, inclusive community built around friendship, self-expression, and good times in VRChat and beyond. We celebrate everyone exactly as they are.",
  supportMessage:
    "Need help? Reach out and a member of our team will get back to you as soon as possible.",
  supportEmail: "hello@urgaynow.com",
  discordInvite: "",
  vrchatGroupUrl: "",
  socialDiscord: "",
  socialTwitter: "",
  socialInstagram: "",
  socialTiktok: "",
  socialYoutube: "",
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
