import "server-only";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";

/** Cache tag shared by every settings read; cleared on every settings write. */
const SETTINGS_TAG = "site-settings";

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
  discordReportsWebhookUrl: "",
};

const readSetting = unstable_cache(
  async (key: string): Promise<string> => {
    // Reads are wrapped in safeQuery so a database outage degrades gracefully to
    // the default value instead of throwing and crashing the whole page/route.
    const row = await safeQuery(
      () => prisma.setting.findUnique({ where: { key } }),
      null,
    );
    if (row) return row.value;
    return DEFAULT_SETTINGS[key] ?? "";
  },
  ["setting"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

/**
 * Public, non-sensitive site settings (taglines, invite URLs, contact details).
 *
 * These are read on almost every page but only ever change through the admin
 * settings form, so the result is cached and tagged. Every write below clears
 * the tag, so an admin edit still shows up immediately. React's cache() also
 * collapses duplicate reads of the same key within a single render pass.
 */
export const getSetting = cache(readSetting);

/**
 * Reads several settings in one query. Prefer this over calling getSetting in a
 * loop: the homepage needed four settings and the layout header a fifth read of
 * one of them, which meant five separate database round-trips per render.
 * Unknown keys resolve to their default (or an empty string) exactly as
 * getSetting would, and a database failure degrades the same way.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const key of keys) result[key] = DEFAULT_SETTINGS[key] ?? "";
  if (keys.length === 0) return result;

  const rows = await unstable_cache(
    () =>
      safeQuery(
        () =>
          prisma.setting.findMany({
            where: { key: { in: [...new Set(keys)] } },
            select: { key: true, value: true },
          }),
        [],
      ),
    ["settings-batch", ...keys],
    { tags: [SETTINGS_TAG], revalidate: 300 },
  )();

  for (const row of rows) result[row.key] = row.value;
  return result;
}

const readAllSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await safeQuery(() => prisma.setting.findMany(), []);
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  },
  ["all-settings"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

export const getAllSettings = cache(readAllSettings);

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  revalidateTag(SETTINGS_TAG);
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
  revalidateTag(SETTINGS_TAG);
}
