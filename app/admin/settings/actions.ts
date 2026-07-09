"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setManySettings } from "@/lib/settings";

const KEYS = [
  "siteTagline",
  "homeIntro",
  "aboutContent",
  "supportMessage",
  "supportEmail",
  "discordInvite",
  "vrchatGroupUrl",
  "socialDiscord",
  "socialTwitter",
  "socialInstagram",
  "socialTiktok",
  "socialYoutube",
  "discordBotToken",
  "discordAnnouncementChannelId",
];

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const key of KEYS) {
    values[key] = String(formData.get(key) || "").trim();
  }
  await setManySettings(values);
  // Invalidate the cached public pages that read these settings so changes
  // show up immediately instead of waiting for ISR revalidation.
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/support");
  redirect("/admin/settings?saved=1");
}
