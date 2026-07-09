"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { fetchDiscordMessages, renderDiscordMessage } from "@/lib/discord";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

function uniqueSlug(base: string): string {
  const slug = slugify(base) || "discord-announcement";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
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
        published: true,
        // Use the message's own (unix) timestamp as the publish date.
        publishedAt: new Date(m.timestamp),
        discordMessageId: m.id,
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
  const published = formData.get("published") === "on";
  const publishedAt = formData.get("publishedAt")
    ? new Date(String(formData.get("publishedAt")))
    : new Date();
  const slug = String(formData.get("slug") || "").trim() || slugify(title);

  if (!title || !slug) fail("/admin/announcements/new");

  try {
    await prisma.announcement.create({
      data: { title, slug, excerpt, content, coverImage, published, publishedAt },
    });
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
  const published = formData.get("published") === "on";
  const publishedAt = formData.get("publishedAt")
    ? new Date(String(formData.get("publishedAt")))
    : new Date();
  const slug = String(formData.get("slug") || "").trim() || slugify(title);

  if (!title || !slug) fail(`/admin/announcements/${id}`);

  try {
    await prisma.announcement.update({
      where: { id },
      data: { title, slug, excerpt, content, coverImage, published, publishedAt },
    });
  } catch {
    fail(`/admin/announcements/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/news");
  redirect("/admin/announcements");
}
