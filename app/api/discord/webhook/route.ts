import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { renderDiscordMessage } from "@/lib/discord";

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
  const secret = new URL(req.url).searchParams.get("secret");
  const expected = process.env.DISCORD_WEBHOOK_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "Webhook secret is not configured (set DISCORD_WEBHOOK_SECRET)." },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content: string = body?.content ?? "";
  if (!content.trim()) {
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

  return NextResponse.json({ ok: true });
}
