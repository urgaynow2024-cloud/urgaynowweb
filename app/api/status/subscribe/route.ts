import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; discordWebhook?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore parse errors, validated below */
  }

  const email = (body.email ?? "").trim();
  const discordWebhook = (body.discordWebhook ?? "").trim();

  if (!email && !discordWebhook) {
    return NextResponse.json({ error: "Provide an email or Discord webhook." }, { status: 400 });
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (discordWebhook && !/^https:\/\/discord\.com\/api\/webhooks\//.test(discordWebhook)) {
    return NextResponse.json({ error: "Discord webhook must start with https://discord.com/api/webhooks/." }, { status: 400 });
  }

  try {
    await prisma.statusSubscriber.upsert({
      where: email ? { email } : { email: `__discord__${discordWebhook}` },
      create: {
        email: email || null,
        discordWebhook: discordWebhook || null,
        verified: false,
      },
      update: {
        ...(discordWebhook ? { discordWebhook } : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
