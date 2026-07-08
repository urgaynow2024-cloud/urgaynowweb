"use server";

import { redirect } from "next/navigation";
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
];

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const key of KEYS) {
    values[key] = String(formData.get(key) || "").trim();
  }
  await setManySettings(values);
  redirect("/admin/settings?saved=1");
}
