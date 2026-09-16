"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { sendContentWebhook } from "@/lib/discord-webhook";

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
        title,
        summary,
        whatsNew,
        improvements,
        bugFixes,
        securityNotes,
        images,
        authorId,
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
        title,
        summary,
        whatsNew,
        improvements,
        bugFixes,
        securityNotes,
        images,
        authorId,
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