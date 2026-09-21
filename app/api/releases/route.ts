import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createReleaseFromCommits, getPreviousReleaseCommit } from "@/lib/release-generator";
import { sendContentWebhook } from "@/lib/discord-webhook";

const CRON_SECRET = process.env.RELEASE_CRON_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { headSha, branch = "main", deploymentId } = body;

    if (!headSha) {
      return NextResponse.json({ error: "headSha is required" }, { status: 400 });
    }

    const previousSha = await getPreviousReleaseCommit();

    const existing = await prisma.update.findUnique({
      where: { sourceCommit: headSha },
    });

    if (existing) {
      return NextResponse.json({ error: "Release for this commit already exists", updateId: existing.id }, { status: 409 });
    }

    const result = await createReleaseFromCommits(headSha, previousSha, branch, deploymentId);

    if (!result) {
      return NextResponse.json({ error: "No commits to release" }, { status: 200 });
    }

    const { updateId, releaseInfo } = result;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
    const webhookResult = await sendContentWebhook("DISCORD_UPDATES_WEBHOOK_URL", {
      surface: "UPDATE",
      title: releaseInfo.title,
      summary: releaseInfo.summary,
      url: `${siteUrl}/updates/${releaseInfo.version.replace(/\./g, "-")}`,
      fields: [
        { name: "Version", value: releaseInfo.version, inline: true },
        { name: "Type", value: releaseInfo.type, inline: true },
        { name: "Released", value: new Date().toLocaleString("en-GB"), inline: true },
      ],
      timestamp: new Date().toISOString(),
    });

    await prisma.update.update({
      where: { id: updateId },
      data: {
        discordPostedAt: webhookResult.ok ? new Date() : null,
        discordPostStatus: webhookResult.ok ? "sent" : "failed",
      },
    });

    return NextResponse.json({
      success: true,
      updateId,
      version: releaseInfo.version,
      discord: webhookResult.ok ? "sent" : "failed",
    });
  } catch (error) {
    console.error("Release creation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}