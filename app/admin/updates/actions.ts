"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { execSync } from "child_process";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { normalizeUpdateCategory } from "@/lib/update-utils";
import { sendContentWebhook } from "@/lib/discord-webhook";
import {
  getCommitsBetween,
  classifyCommits as classifyCommitsRG,
  determineVersionType,
  getLatestPublishedVersion,
  incrementVersion,
  generateReleaseInfo,
  getPreviousReleaseCommit,
} from "@/lib/release-generator";

function fail(path: string): never {
  redirect(`${path}?error=1`);
}

function parseDiscordRoleIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id)).filter(Boolean);
  } catch {
    return [];
  }
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "update";
  let slug = base;
  let suffix = 2;
  while (await prisma.update.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function postUpdateWebhook(updateId: string) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update || !update.publishedAt) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const result = await sendContentWebhook("DISCORD_UPDATES_WEBHOOK_URL", {
    surface: "UPDATE",
    title: update.title,
    summary: update.summary || update.title,
    url: `${siteUrl}/updates/${update.slug}`,
    roleIds: [],
    fields: [
      { name: "Version", value: update.version, inline: true },
      { name: "Type", value: update.type, inline: true },
      { name: "Released", value: update.publishedAt.toLocaleString("en-GB"), inline: true },
    ],
    timestamp: update.publishedAt.toISOString(),
  });
  await prisma.update.update({
    where: { id: updateId },
    data: {
      discordPostedAt: result.ok ? new Date() : null,
      discordPostStatus: result.ok ? "sent" : "failed",
    },
  });
}

function execGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: "utf-8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

function classifyCommits(commits: Array<{ sha: string; subject: string; body: string }>) {
  const result = { breaking: [] as string[], features: [] as string[], fixes: [] as string[], improvements: [] as string[], other: [] as string[] };
  for (const commit of commits) {
    const subject = commit.subject.toLowerCase();
    const fullMessage = `${commit.subject}\n${commit.body}`.toLowerCase();
    const isBreaking = subject.includes("breaking change") || subject.startsWith("!") || fullMessage.includes("breaking change:");
    if (isBreaking) { result.breaking.push(commit.subject); continue; }
    if (subject.startsWith("feat:")) result.features.push(commit.subject);
    else if (subject.startsWith("fix:")) result.fixes.push(commit.subject);
    else if (subject.startsWith("perf:") || subject.startsWith("refactor:")) result.improvements.push(commit.subject);
    else result.other.push(commit.subject);
  }
  return result;
}

function formatCommitList(items: string[]): string {
  return items.length > 0 ? items.map((s) => `- ${s}`).join("\n") : "";
}

function sanitize(text: string): string {
  return text
    .replace(/((?:password|secret|token|key|credential|api[_-]?key)\s*[:=]\s*)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}/g, "[REDACTED]")
    .replace(/sk-[A-Za-z0-9]{48}/g, "[REDACTED]")
    .replace(/xoxb-[A-Za-z0-9-]{50,}/g, "[REDACTED]")
    .replace(/[A-Za-z0-9+/]{40,}={0,2}/g, "[REDACTED]");
}

export async function regenerateSummary(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.update.findUnique({ where: { id } });
  if (!existing || !existing.generatedAutomatically || !existing.sourceCommit) {
    redirect(`/admin/updates/${id}?error=1`);
  }

  const previousSha = existing.sourcePreviousCommit ?? execGit("rev-list --max-parents=0 HEAD");
  const headSha = existing.sourceCommit;

  const format = "%H|%s|%b";
  const log = execGit(`log --format="${format}" ${previousSha}..${headSha}`);
  const commits = log ? log.split("\n").map((line) => {
    const [sha, subject, body] = line.split("|");
    return { sha, subject, body: body || "" };
  }) : [];

  const classified = classifyCommits(commits);
  const summary = `${commits.length} change${commits.length !== 1 ? "s" : ""} in this release`;
  const whatsNew = formatCommitList(classified.features);
  const improvements = formatCommitList([...classified.improvements, ...classified.other]);
  const bugFixes = formatCommitList(classified.fixes);

  try {
    await prisma.update.update({
      where: { id },
      data: {
        summary: sanitize(summary),
        whatsNew: sanitize(whatsNew),
        improvements: sanitize(improvements),
        bugFixes: sanitize(bugFixes),
      },
    });
  } catch {
    fail(`/admin/updates/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  revalidatePath(`/updates/${existing.slug}`);
  redirect("/admin/updates");
}

export async function createUpdate(formData: FormData) {
  await requireAdmin();
  const version = String(formData.get("version") || "").trim();
  const type = String(formData.get("type") || "PATCH").trim() as "MAJOR" | "MINOR" | "PATCH";
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const whatsNew = String(formData.get("whatsNew") || "").trim();
  const improvements = String(formData.get("improvements") || "").trim();
  const bugFixes = String(formData.get("bugFixes") || "").trim();
  const securityNotes = String(formData.get("securityNotes") || "").trim();
  const images = String(formData.get("images") || "[]");
  const category = normalizeUpdateCategory(String(formData.get("category") || ""));
  const featured = formData.get("featured") === "on";
  const authorId = String(formData.get("authorId") || "").trim();
  const published = formData.get("published") === "on";
  const postToDiscord = formData.get("postToDiscord") === "on";

  if (!version || !title) fail("/admin/updates/new");

  let slug = slugify(title);
  if (!slug) fail("/admin/updates/new");
  slug = await uniqueSlug(title);

  try {
    const update = await prisma.update.create({
      data: {
        slug,
        version,
        type,
        category,
        title,
        summary,
        whatsNew,
        improvements,
        bugFixes,
        securityNotes,
        images,
        authorId,
        featured,
        publishedAt: published ? new Date() : null,
      },
    });
    if (published && postToDiscord) {
      await postUpdateWebhook(update.id);
    }
  } catch {
    fail("/admin/updates/new");
  }
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  redirect("/admin/updates");
}

export async function updateUpdate(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.update.findUnique({ where: { id } });
  if (!existing) fail(`/admin/updates/${id}`);

  const version = String(formData.get("version") || "").trim();
  const type = String(formData.get("type") || "PATCH").trim() as "MAJOR" | "MINOR" | "PATCH";
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const whatsNew = String(formData.get("whatsNew") || "").trim();
  const improvements = String(formData.get("improvements") || "").trim();
  const bugFixes = String(formData.get("bugFixes") || "").trim();
  const securityNotes = String(formData.get("securityNotes") || "").trim();
  const images = String(formData.get("images") || "[]");
  const category = normalizeUpdateCategory(String(formData.get("category") || ""));
  const featured = formData.get("featured") === "on";
  const authorId = String(formData.get("authorId") || "").trim();
  const published = formData.get("published") === "on";
  const postToDiscord = formData.get("postToDiscord") === "on";

  if (!version || !title) fail(`/admin/updates/${id}`);
  const slug = existing.slug === slugify(title) ? existing.slug : await uniqueSlug(title, id);

  try {
    await prisma.update.update({
      where: { id },
      data: {
        slug,
        version,
        type,
        category,
        title,
        summary,
        whatsNew,
        improvements,
        bugFixes,
        securityNotes,
        images,
        authorId,
        featured,
        publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
      },
    });
    if (published && postToDiscord) {
      await postUpdateWebhook(id);
    }
  } catch {
    fail(`/admin/updates/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  revalidatePath(`/updates/${slug}`);
  redirect("/admin/updates");
}

export async function retryUpdateWebhook(id: string) {
  await requireAdmin();
  const update = await prisma.update.findUnique({ where: { id } });
  if (!update) redirect("/admin/updates");
  await postUpdateWebhook(id);
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  redirect("/admin/updates");
}

export async function deleteUpdate(id: string) {
  await requireAdmin();
  const update = await prisma.update.findUnique({ where: { id } });
  if (!update) redirect("/admin/updates");
  try {
    await prisma.update.delete({ where: { id } });
  } catch {
    redirect("/admin/updates");
  }
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  redirect("/admin/updates");
}

/** Suggest the next version number based on the most recent published update. */
export async function suggestVersion(type: "MAJOR" | "MINOR" | "PATCH" = "PATCH") {
  await requireAdmin();
  const latest = await prisma.update.findFirst({ where: { publishedAt: { not: null } }, orderBy: { version: "desc" } });
  if (!latest) return "1.0.0";
  const parts = latest.version.split(".").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return "1.0.0";
  if (type === "MAJOR") {
    return `${parts[0] + 1}.0.0`;
  }
  if (type === "MINOR") {
    return `${parts[0]}.${parts[1] + 1}.0`;
  }
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAdmin();
  try {
    const update = await prisma.update.update({ where: { id }, data: { featured } });
    revalidatePath("/", "layout");
    revalidatePath("/updates");
    revalidatePath(`/updates/${update.slug}`);
  } catch {
    redirect("/admin/updates");
  }
  redirect("/admin/updates");
}

/**
 * Generate a changelog DRAFT from recent git commits.
 *
 * Spec (§5 / §7): "Development Changes → Generate Changelog Draft → Staff
 * Review → Publish → /updates". Generated entries always start as DRAFT and must
 * be reviewed before publication. Git metadata is only used as the internal
 * source for the draft — staff edit/publish it via the admin manager.
 */
export async function generateDraftFromRecentChanges() {
  await requireAdmin();

  const headSha = execGit("rev-parse HEAD").trim();
  if (!headSha) redirect("/admin/updates?error=1");

  const previousSha =
    (await getPreviousReleaseCommit()) || execGit("rev-list --max-parents=0 HEAD").trim() || headSha;
  const commits = getCommitsBetween(previousSha, headSha);
  if (commits.length === 0) redirect("/admin/updates?error=1");

  const classified = classifyCommitsRG(commits);
  const versionType = determineVersionType(classified);
  const latestVersion = await getLatestPublishedVersion();
  const newVersion = incrementVersion(latestVersion, versionType);
  const releaseInfo = generateReleaseInfo(classified, newVersion, versionType);

  const slug = await uniqueSlug(releaseInfo.title);

  try {
    await prisma.update.create({
      data: {
        slug,
        version: releaseInfo.version,
        type: releaseInfo.type,
        category: releaseInfo.type === "MAJOR" ? "NEW" : releaseInfo.type === "MINOR" ? "IMPROVEMENT" : "FIX",
        title: releaseInfo.title,
        summary: releaseInfo.summary,
        whatsNew: releaseInfo.whatsNew,
        improvements: releaseInfo.improvements,
        bugFixes: releaseInfo.bugFixes,
        securityNotes: releaseInfo.securityNotes,
        images: "[]",
        authorId: "system",
        featured: false,
        publishedAt: null,
        generatedAutomatically: true,
        releaseStatus: "DRAFT",
        sourceCommit: headSha,
        sourceBranch: execGit("rev-parse --abbrev-ref HEAD"),
      },
    });
  } catch {
    redirect("/admin/updates?error=1");
  }
  revalidatePath("/", "layout");
  revalidatePath("/updates");
  revalidatePath("/admin/updates");
  redirect("/admin/updates");
}