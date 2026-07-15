import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { renderDiscordMessage } from "@/lib/discord";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export const runtime = "nodejs";

function uniqueSlug(base: string): string {
  const slug =
    base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "discord-announcement";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req: Request) {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    const secret = new URL(req.url).searchParams.get("secret");
    const expected = process.env.DISCORD_WEBHOOK_SECRET;

    if (!expected) {
      status = 503;
      return NextResponse.json(
        { error: "Webhook secret is not configured (set DISCORD_WEBHOOK_SECRET)." },
        { status },
      );
    }
    if (secret !== expected) {
      status = 401;
      return NextResponse.json({ error: "Unauthorized" }, { status });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      status = 400;
      return NextResponse.json({ error: "Invalid JSON body." }, { status });
    }

    const content: string = body?.content ?? "";
    if (!content.trim()) {
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ ok: true, skipped: "no text content" });
    }

    const resolved = await renderDiscordMessage(content);
    const firstLine =
      resolved.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "Discord announcement";
    const title = firstLine.length > 100 ? `${firstLine.slice(0, 97)}…` : firstLine;
    const excerpt = resolved.replace(/\s+/g, " ").slice(0, 160);
    const image = Array.isArray(body.attachments)
      ? (body.attachments as any[]).find((a: any) => (a.content_type ?? "").startsWith("image/"))
      : undefined;
    const messageId: string = String(body.id ?? "");

    await prisma.announcement.deleteMany({ where: { discordMessageId: { not: null } } });
    await prisma.announcement.create({
      data: {
        title,
        slug: uniqueSlug(title),
        excerpt,
        content: resolved,
        coverImage: image?.url ?? "",
        published: true,
        publishedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
        discordMessageId: messageId || null,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/news");

    status = 200;
    isSuccess = true;
    isFailure = false;
    return NextResponse.json({ ok: true });
  } finally {
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/discord/webhook",
      bucketStart,
      bucketSize: 1,
      value: 1,
      unit: "req",
      source: "api-middleware",
      environment: "production",
      isSuccess,
      isFailure,
    }).catch(() => {});
    if (isFailure) {
      updateMetricBucket({
        metricKey: "api_error_count:/api/discord/webhook",
        bucketStart,
        bucketSize: 1,
        value: 1,
        unit: "err",
        source: "api-middleware",
        environment: "production",
        isSuccess: false,
        isFailure: true,
      }).catch(() => {});
    }
  }
}
