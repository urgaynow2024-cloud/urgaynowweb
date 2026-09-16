"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { fetchDiscordMessages, renderDiscordMessage } from "@/lib/discord";
import { sendContentWebhook } from "@/lib/discord-webhook";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

function uniqueSlug(base: string): string {
  const slug = slugify(base) || "discord-announcement";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
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

async function postAnnouncementWebhook(id: string) {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement || !announcement.publishedAt) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const result = await sendContentWebhook("DISCORD_ANNOUNCEMENTS_WEBHOOK_URL", {
    surface: "ANNOUNCEMENT",
    title: announcement.title,
    summary: announcement.excerpt || announcement.title,
    url: `${siteUrl}/news/${announcement.slug}`,
    roleIds: announcement.discordRoleIds,
    fields: [
      { name: "Published", value: announcement.publishedAt.toLocaleString("en-GB"), inline: true },
    ],
    timestamp: announcement.publishedAt.toISOString(),
  });
  await prisma.announcement.update({
    where: { id },
    data: {
      discordPosted: result.ok,
      discordPostStatus: result.ok ? "sent" : "failed",
      discordPostedAt: result.ok ? new Date() : null,
    },
  });
}

export async function importFromDiscord() {
  await requireAdmin();
  let result = "/admin/announcements?imported=1";
  try {
    const messages = await fetchDiscordMessages(1);
    if (messages.length === 0) {
      result = `/admin/announcements?importError=${encodeURIComponent("No messages found in the configured Discord channel.")}`;
      return;
    }

    const m = messages[0];
    const raw = m.content.trim();
    if (!raw) {
      result = `/admin/announcements?importError=${encodeURIComponent("The latest Discord message has no text content.")}`;
      return;
    }

    // Resolve Discord tokens (@role, #channel, :emoji:) and keep all
    // standard markdown (# headings, **bold**, > quotes, lists) intact.
    const content = await renderDiscordMessage(raw);

    const firstLine = content.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "Discord announcement";
    const title = firstLine.length > 100 ? `${firstLine.slice(0, 97)}…` : firstLine;
    const excerpt = content.replace(/\s+/g, " ").slice(0, 160);
    const image = m.attachments.find((a) => (a.contentType ?? "").startsWith("image/"));

    // Keep only the latest Discord-sourced announcement to avoid filling the database.
    await prisma.announcement.deleteMany({ where: { discordMessageId: { not: null } } });

    await prisma.announcement.create({
      data: {
        title,
        slug: uniqueSlug(title),
        excerpt,
        content,
        coverImage: image?.url ?? "",
        state: "PUBLISHED",
        // Use the message's own (unix) timestamp as the publish date.
        publishedAt: new Date(m.timestamp),
        discordMessageId: m.id,
        discordPosted: true,
      },
    });
    revalidatePath("/", "layout");
    revalidatePath("/news");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    result = `/admin/announcements?importError=${encodeURIComponent(message)}`;
  }
  redirect(result);
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const state = String(formData.get("state") || "DRAFT");
  const postToDiscord = formData.get("postToDiscord") === "on";
  const discordRoleIds = parseDiscordRoleIds(String(formData.get("discordRoleIds") || "[]"));
  const publishedAt = formData.get("publishedAt")
    ? new Date(String(formData.get("publishedAt")))
    : state === "PUBLISHED" ? new Date() : null;
  const scheduledAt = formData.get("scheduledAt")
    ? new Date(String(formData.get("scheduledAt")))
    : null;
  const categoryId = String(formData.get("categoryId") || "").trim() || null;
  const authorId = String(formData.get("authorId") || "").trim() || null;
  const pinned = formData.get("pinned") === "on";
  const slug = String(formData.get("slug") || "").trim() || slugify(title);

  if (!title || !slug) fail("/admin/announcements/new");

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        state,
        publishedAt,
        scheduledAt,
        categoryId,
        authorId,
        pinned,
        discordRoleIds,
        discordPosted: false,
        discordPostStatus: "pending",
      },
    });
    if (state === "PUBLISHED" && postToDiscord) {
      await postAnnouncementWebhook(announcement.id);
    }
  } catch {
    fail("/admin/announcements/new");
  }
  revalidatePath("/", "layout");
  revalidatePath("/news");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const state = String(formData.get("state") || "DRAFT");
  const postToDiscord = formData.get("postToDiscord") === "on";
  const discordRoleIds = parseDiscordRoleIds(String(formData.get("discordRoleIds") || "[]"));
  const publishedAt = formData.get("publishedAt")
    ? new Date(String(formData.get("publishedAt")))
    : state === "PUBLISHED" ? new Date() : null;
  const scheduledAt = formData.get("scheduledAt")
    ? new Date(String(formData.get("scheduledAt")))
    : null;
  const categoryId = String(formData.get("categoryId") || "").trim() || null;
  const authorId = String(formData.get("authorId") || "").trim() || null;
  const pinned = formData.get("pinned") === "on";
  const slug = String(formData.get("slug") || "").trim() || slugify(title);

  if (!title || !slug) fail(`/admin/announcements/${id}`);

  try {
    await prisma.announcement.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        state,
        publishedAt,
        scheduledAt,
        categoryId,
        authorId,
        pinned,
        discordRoleIds,
      },
    });
    if (state === "PUBLISHED" && postToDiscord) {
      await postAnnouncementWebhook(id);
    }
  } catch {
    fail(`/admin/announcements/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  redirect("/admin/announcements");
}

export async function retryAnnouncementWebhook(id: string) {
  await requireAdmin();
  await postAnnouncementWebhook(id);
  revalidatePath("/", "layout");
  revalidatePath("/news");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/news");
  redirect("/admin/announcements");
}
