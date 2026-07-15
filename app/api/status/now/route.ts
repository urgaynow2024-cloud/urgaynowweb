import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runHealthChecks, ensureDefaultServices } from "@/lib/status/health";
import { deriveOverall } from "@/lib/status/types";
import { OVERALL_STATUS_META, type OverallStatus } from "@/lib/status/types";

// Public, unauthenticated live snapshot. Designed to stay useful even when the
// database is unreachable: if we can't read persisted service rows, we fall back
// to a fresh live probe so the status page still reflects reality during an outage.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDefaultServices();

    const services = await prisma.statusService.findMany();

    if (services.length === 0) {
      // No persisted state — probe live so the page still works.
      const { overall, results } = await runHealthChecks();
      return NextResponse.json(toSnapshot(overall, results), {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const overall = deriveOverall(services.map((s) => ({ status: s.status as any }))) as OverallStatus;
    const om = OVERALL_STATUS_META[overall as OverallStatus];
    const anyDown = services.some((s) => s.status !== "operational" && s.status !== "maintenance");
    return NextResponse.json(
      {
        overall,
        label: om.label,
        emoji: om.emoji,
        text: om.text,
        updatedAt: new Date().toLocaleTimeString(),
        degraded: anyDown,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Last-resort fallback: live probe without DB.
    try {
      const { overall } = await runHealthChecks();
      const om = OVERALL_STATUS_META[overall as OverallStatus];
      return NextResponse.json(
        { overall, label: om.label, emoji: om.emoji, text: om.text, updatedAt: new Date().toLocaleTimeString() },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return NextResponse.json(
        { overall: "major_outage", label: "Status Unavailable", emoji: "⚠️", text: "text-red-600", updatedAt: new Date().toLocaleTimeString() },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }
  }
}

export async function POST() {
  // Trigger a health-check pass (used by Vercel Cron & the admin "Run now" button).
  const { overall } = await runHealthChecks();
  const om = OVERALL_STATUS_META[overall as OverallStatus];
  return NextResponse.json({ overall, label: om.label });
}

function toSnapshot(overall: string, _results: Record<string, unknown>) {
  const om = OVERALL_STATUS_META[overall as OverallStatus];
  return {
    overall,
    label: om.label,
    emoji: om.emoji,
    text: om.text,
    updatedAt: new Date().toLocaleTimeString(),
    degraded: overall !== "operational" && overall !== "maintenance",
  };
}



