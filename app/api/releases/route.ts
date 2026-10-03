import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createReleaseFromCommits,
  findReleaseByCommit,
  getPreviousReleaseCommit,
  type CommitInfo,
} from "@/lib/release-generator";
import { sendContentWebhook } from "@/lib/discord-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The only repository allowed to publish automatic website updates. */
const DEFAULT_REPOSITORY = "urgaynow2024-cloud/urgaynowweb";
const SHA_PATTERN = /^[0-9a-f]{40}$/i;
/** Deployment states that mean "this build is live in production". */
const READY_STATES = new Set(["ready", "success", "served", "active"]);
const MAX_COMMITS = 200;

function expectedRepository(): string {
  return (process.env.RELEASE_GITHUB_REPOSITORY || DEFAULT_REPOSITORY)
    .trim()
    .toLowerCase()
    .replace(/\.git$/, "");
}

/**
 * Constant-time comparison of the shared secret. Fails closed when the secret is
 * not configured, so a missing secret can never open the endpoint.
 */
function authorized(request: NextRequest): boolean {
  const secret = process.env.RELEASE_CRON_SECRET;
  if (!secret) return false;

  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}

function parseCommits(raw: unknown): CommitInfo[] {
  if (!Array.isArray(raw)) return [];

  const commits: CommitInfo[] = [];
  for (const entry of raw.slice(0, MAX_COMMITS)) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const sha = typeof item.sha === "string" ? item.sha.trim() : "";
    const subject = typeof item.subject === "string" ? item.subject.trim() : "";
    if (!subject) continue;

    commits.push({
      sha: SHA_PATTERN.test(sha) ? sha.toLowerCase() : "",
      subject,
      body: typeof item.body === "string" ? item.body : "",
      author: typeof item.author === "string" ? item.author : "",
      date: typeof item.date === "string" ? item.date : "",
    });
  }
  return commits;
}

/**
 * GET /api/releases
 * Reports the latest published release so the release workflow can calculate the
 * exact commit range for the push it is releasing. Same shared secret as POST.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latest = await prisma.update.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: {
      version: true,
      slug: true,
      sourceCommit: true,
      deploymentId: true,
      publishedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    repository: expectedRepository(),
    previousCommit: await getPreviousReleaseCommit(),
    latest: latest
      ? {
          version: latest.version,
          slug: latest.slug,
          sourceCommit: latest.sourceCommit,
          deploymentId: latest.deploymentId,
          publishedAt: latest.publishedAt?.toISOString() ?? null,
        }
      : null,
  });
}

/**
 * POST /api/releases
 *
 * Creates (or replays) the website update for one successful production
 * deployment. Called by the "Auto Release" GitHub Actions workflow after it has
 * confirmed Vercel deployed the pushed commit to production.
 *
 * Guards:
 *  - shared secret, compared in constant time, fails closed when unset
 *  - repository must be the UGN repository
 *  - a deployment state must be supplied and must be successful, so a failed
 *    build can never publish a public update
 *  - one update per commit (`sourceCommit` is unique), so replaying the same
 *    push, webhook or redeploy returns the existing record
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      headSha,
      branch = "main",
      deploymentId,
      previousSha,
      repository,
      deployment,
      commits,
    } = body as Record<string, any>;

    if (typeof headSha !== "string" || !SHA_PATTERN.test(headSha.trim())) {
      return NextResponse.json(
        { error: "headSha must be a full 40-character commit SHA" },
        { status: 400 },
      );
    }
    const commitSha = headSha.trim().toLowerCase();

    if (repository && String(repository).trim().toLowerCase().replace(/\.git$/, "") !== expectedRepository()) {
      return NextResponse.json(
        { error: "Repository is not allowed to publish releases" },
        { status: 403 },
      );
    }

    const deploymentState = String(deployment?.state ?? "").trim().toLowerCase();
    const deploymentTarget = String(deployment?.target ?? "production")
      .trim()
      .toLowerCase();

    if (deploymentTarget !== "production") {
      return NextResponse.json(
        { error: `Deployment target "${deploymentTarget}" is not production — no update created` },
        { status: 422 },
      );
    }
    if (!READY_STATES.has(deploymentState)) {
      return NextResponse.json(
        {
          error: `Deployment state "${deploymentState || "missing"}" is not a successful production build — no update created`,
          updateCreated: false,
        },
        { status: 422 },
      );
    }

    const parsedCommits = parseCommits(commits);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";

    // Idempotency lives in createReleaseFromCommits, so a redeploy refreshes the
    // deployment id on the existing record instead of bypassing it here. The
    // only case that needs an early lookup is a replay with no commit payload.
    if (parsedCommits.length === 0) {
      const existing = await findReleaseByCommit(commitSha);
      if (existing) {
        return NextResponse.json({
          ok: true,
          alreadyReleased: true,
          updateCreated: false,
          updateId: existing.id,
          version: existing.version,
          slug: existing.slug,
          url: `${siteUrl}/updates/${existing.slug}`,
        });
      }
      return NextResponse.json(
        { error: "No commits supplied for this deployment — no update created" },
        { status: 422 },
      );
    }

    const result = await createReleaseFromCommits({
      headSha: commitSha,
      commits: parsedCommits,
      branch: typeof branch === "string" ? branch : "main",
      deploymentId: typeof deploymentId === "string" ? deploymentId : null,
      previousSha: typeof previousSha === "string" ? previousSha : null,
    });

    if (!result) {
      return NextResponse.json(
        { error: "No commits supplied for this deployment — no update created" },
        { status: 422 },
      );
    }

    if (!result.created) {
      return NextResponse.json({
        ok: true,
        alreadyReleased: true,
        updateCreated: false,
        updateId: result.updateId,
        version: result.version,
        slug: result.slug,
        url: `${siteUrl}/updates/${result.slug}`,
      });
    }

    const publicUrl = `${siteUrl}/updates/${result.slug}`;

    // Clear the CDN/full-route cache for the changelog so the new entry is
    // visible immediately rather than after the 60s cache window.
    for (const path of ["/updates", "/updates/[slug]", "/"]) {
      try {
        revalidatePath(path);
      } catch {
        // A failed cache purge must not stop the update being published.
      }
    }

    // Local verification runs must not post to the live changelog channel.
// Left unset in production, every real deployment is announced.
const suppressDiscord = process.env.UGN_SKIP_DISCORD_NOTIFICATIONS === "1";
    let discord = "skipped";

    if (!suppressDiscord) {
      const webhookResult = await sendContentWebhook("DISCORD_UPDATES_WEBHOOK_URL", {
        surface: "UPDATE",
        title: result.releaseInfo.title,
        summary: result.releaseInfo.summary,
        url: publicUrl,
        fields: [
          { name: "Version", value: result.version, inline: true },
          { name: "Type", value: result.releaseInfo.type, inline: true },
          { name: "Commit", value: commitSha.slice(0, 7), inline: true },
          { name: "Released", value: new Date().toLocaleString("en-GB"), inline: true },
        ],
        timestamp: new Date().toISOString(),
      });

      discord = webhookResult.ok ? "sent" : "failed";
      await prisma.update.update({
        where: { id: result.updateId },
        data: {
          discordPostedAt: webhookResult.ok ? new Date() : null,
          discordPostStatus: webhookResult.ok ? "sent" : "failed",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      alreadyReleased: false,
      updateCreated: result.created,
      updateId: result.updateId,
      version: result.version,
      slug: result.slug,
      url: publicUrl,
      commit: commitSha,
      deploymentId: deploymentId ?? null,
      discord,
    });
  } catch (error) {
    console.error("Release creation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}