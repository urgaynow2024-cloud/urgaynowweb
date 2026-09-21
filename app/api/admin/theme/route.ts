import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invalidateThemeCache } from "@/lib/theme-resolver";
import { revalidatePath } from "next/cache";
import { THEME_REGISTRY } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteTheme = await prisma.siteTheme.findFirst({
    include: { schedules: { orderBy: { priority: "asc" } } },
  });

  const themes = Object.values(THEME_REGISTRY).map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    description: t.description,
    previewGradient: t.previewGradient,
  }));

  return NextResponse.json({
    mode: siteTheme?.mode ?? "MANUAL",
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
  });
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const { mode, manualThemeId, schedules } = body as {
    mode: "MANUAL" | "AUTOMATIC";
    manualThemeId?: string;
    schedules?: Array<{
      id?: string;
      themeId: string;
      start: string;
      end: string;
      enabled: boolean;
      priority: number;
    }>;
  };

  if (!mode || !["MANUAL", "AUTOMATIC"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (mode === "MANUAL" && manualThemeId && !THEME_REGISTRY[manualThemeId]) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  const siteTheme = await prisma.siteTheme.findFirst();

  const data: { mode: "MANUAL" | "AUTOMATIC"; manualThemeId?: string | null } = {
    mode,
    manualThemeId: mode === "MANUAL" ? manualThemeId ?? null : null,
  };

  let result;
  if (siteTheme) {
    result = await prisma.siteTheme.update({
      where: { id: siteTheme.id },
      data: data,
      include: { schedules: true },
    });
  } else {
    result = await prisma.siteTheme.create({
      data,
      include: { schedules: true },
    });
  }

  if (schedules) {
    const existingSchedules = await prisma.themeSchedule.deleteMany({
      where: { siteThemeId: result.id },
    });

    if (schedules.length > 0) {
      await prisma.themeSchedule.createMany({
        data: schedules.map((s) => ({
          themeId: s.themeId,
          start: new Date(s.start),
          end: new Date(s.end),
          enabled: s.enabled,
          priority: s.priority,
          siteThemeId: result.id,
        })),
      });
    }
  }

  invalidateThemeCache();
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
