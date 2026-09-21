"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invalidateThemeCache } from "@/lib/theme-resolver";
import { THEME_REGISTRY, THEME_ORDER } from "@/lib/themes";

export async function getThemeSettings() {
  await requireAdmin();
  const siteTheme = await prisma.siteTheme.findFirst({
    include: { schedules: { orderBy: { priority: "asc" } } },
  });

  const themes = THEME_ORDER.map((id) => THEME_REGISTRY[id]).filter(Boolean);

  return {
    mode: (siteTheme?.mode ?? "MANUAL") as "MANUAL" | "AUTOMATIC",
    manualThemeId: siteTheme?.manualThemeId ?? "default",
    schedules: (siteTheme?.schedules ?? []).map((s) => ({
      id: s.id,
      themeId: s.themeId,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      enabled: s.enabled,
      priority: s.priority,
    })),
    themes,
  };
}

export async function updateThemeSettings(formData: FormData) {
  await requireAdmin();

  const mode = String(formData.get("mode") || "MANUAL") as "MANUAL" | "AUTOMATIC";
  const manualThemeId = String(formData.get("manualThemeId") || "default");

  const siteTheme = await prisma.siteTheme.findFirst();

  if (siteTheme) {
    await prisma.siteTheme.update({
      where: { id: siteTheme.id },
      data: { mode, manualThemeId },
    });
  } else {
    await prisma.siteTheme.create({
      data: { mode, manualThemeId },
    });
  }

  invalidateThemeCache();
  revalidatePath("/", "layout");
  redirect("/admin/settings/appearance?saved=1");
}

export async function updateThemeSchedule(formData: FormData) {
  await requireAdmin();

  const scheduleId = String(formData.get("scheduleId") || "");
  const themeId = String(formData.get("themeId") || "");
  const start = String(formData.get("start") || "");
  const end = String(formData.get("end") || "");
  const enabled = formData.get("enabled") === "on";
  const priority = parseInt(String(formData.get("priority") || "0"), 10);

  if (!themeId || !start || !end) {
    redirect("/admin/settings/appearance?error=missing_fields");
  }

  const siteTheme = await prisma.siteTheme.findFirst();
  if (!siteTheme) {
    redirect("/admin/settings/appearance?error=no_site_theme");
  }

  if (scheduleId) {
    await prisma.themeSchedule.update({
      where: { id: scheduleId },
      data: { themeId, start: new Date(start), end: new Date(end), enabled, priority },
    });
  } else {
    await prisma.themeSchedule.create({
      data: { themeId, start: new Date(start), end: new Date(end), enabled, priority, siteThemeId: siteTheme.id },
    });
  }

  invalidateThemeCache();
  revalidatePath("/", "layout");
  redirect("/admin/settings/appearance?saved=1");
}

export async function deleteThemeSchedule(scheduleId: string) {
  await requireAdmin();
  await prisma.themeSchedule.delete({ where: { id: scheduleId } });
  invalidateThemeCache();
  revalidatePath("/", "layout");
  redirect("/admin/settings/appearance?saved=1");
}

export async function previewTheme(themeId: string) {
  await requireAdmin();
  // This is used for preview - the client will handle session preview
  // We just validate the theme exists
  if (!THEME_REGISTRY[themeId]) {
    return { success: false, error: "Invalid theme" };
  }
  return { success: true, themeId };
}