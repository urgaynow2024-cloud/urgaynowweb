"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidTimeZone, zonedDateTimeToUtc, getEventState } from "@/lib/event-utils";
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

function parseEventTimes(startRaw: string, endRaw: string, timezone: string): { startDateTime: Date; endDateTime: Date | null } | null {
  if (!isValidTimeZone(timezone)) return null;
  const startDateTime = zonedDateTimeToUtc(startRaw, timezone);
  const endDateTime = endRaw ? zonedDateTimeToUtc(endRaw, timezone) : null;
  if (!startDateTime || (endRaw && !endDateTime)) return null;
  if (endDateTime && endDateTime <= startDateTime) return null;
  return { startDateTime, endDateTime };
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "event";
  let slug = base;
  let suffix = 2;
  while (await prisma.event.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function isUniqueSlugError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function parseTags(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const vrchatWorldUrl = String(formData.get("vrchatWorldUrl") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const startRaw = String(formData.get("startDateTime") || "");
  const endRaw = String(formData.get("endDateTime") || "");
  const timezone = String(formData.get("timezone") || "UTC").trim() || "UTC";
  const hostName = String(formData.get("hostName") || "").trim();
  const category = String(formData.get("category") || "Other").trim() || "Other";
  const tags = parseTags(String(formData.get("tags") || ""));
  const rules = String(formData.get("rules") || "").trim();
  const published = formData.get("published") === "on";
  const postToDiscord = formData.get("postToDiscord") === "on";
  const discordRoleIds = parseDiscordRoleIds(String(formData.get("discordRoleIds") || "[]"));

  if (!title || !startRaw) fail("/admin/events/new");
  const times = parseEventTimes(startRaw, endRaw, timezone);
  if (!times) fail("/admin/events/new");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await uniqueSlug(title);
    try {
      const event = await prisma.event.create({
        data: {
          title,
          slug,
          summary,
          description,
          location,
          vrchatWorldUrl,
          coverImage,
          timezone,
          hostName,
          category,
          tags,
          rules,
          publishedAt: published ? new Date() : null,
          ...times,
          status: getEventState({ startDateTime: times.startDateTime, endDateTime: times.endDateTime }),
          published,
          discordPosted: false,
          discordPostStatus: "pending",
          discordRoleIds,
        },
      });
      if (published && postToDiscord) {
        await postEventWebhook(event.id);
      }
      break;
    } catch (error) {
      if (!isUniqueSlugError(error) || attempt === 2) fail("/admin/events/new");
    }
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

async function postEventWebhook(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const result = await sendContentWebhook("DISCORD_EVENTS_WEBHOOK_URL", {
    surface: "EVENT",
    title: event.title,
    summary: event.summary || event.title,
    url: `${siteUrl}/events/${event.slug}`,
    roleIds: event.discordRoleIds,
    fields: [
      { name: "When", value: new Date(event.startDateTime).toLocaleString("en-GB", { timeZone: event.timezone }), inline: true },
      { name: "Category", value: event.category, inline: true },
      ...(event.location ? [{ name: "Location", value: event.location }] : []),
      ...(event.vrchatWorldUrl ? [{ name: "VRChat World", value: event.vrchatWorldUrl }] : []),
      ...(event.hostName ? [{ name: "Host", value: event.hostName }] : []),
    ],
    timestamp: event.publishedAt?.toISOString(),
  });
  await prisma.event.update({
    where: { id: eventId },
    data: {
      discordPosted: result.ok,
      discordPostStatus: result.ok ? "sent" : "failed",
      discordPostedAt: result.ok ? new Date() : null,
    },
  });
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) fail(`/admin/events/${id}`);

  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const vrchatWorldUrl = String(formData.get("vrchatWorldUrl") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const startRaw = String(formData.get("startDateTime") || "");
  const endRaw = String(formData.get("endDateTime") || "");
  const timezone = String(formData.get("timezone") || "UTC").trim() || "UTC";
  const hostName = String(formData.get("hostName") || "").trim();
  const category = String(formData.get("category") || "Other").trim() || "Other";
  const tags = parseTags(String(formData.get("tags") || ""));
  const rules = String(formData.get("rules") || "").trim();
  const published = formData.get("published") === "on";
  const postToDiscord = formData.get("postToDiscord") === "on";
  const discordRoleIds = parseDiscordRoleIds(String(formData.get("discordRoleIds") || "[]"));

  if (!title || !startRaw) fail(`/admin/events/${id}`);
  const times = parseEventTimes(startRaw, endRaw, timezone);
  if (!times) fail(`/admin/events/${id}`);
  const slug = existing.slug === slugify(title) ? existing.slug : await uniqueSlug(title, id);

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        description,
        location,
        vrchatWorldUrl,
        coverImage,
        timezone,
        hostName,
        category,
        tags,
        rules,
        published,
        publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
        ...times,
        status: getEventState({
          startDateTime: times.startDateTime,
          endDateTime: times.endDateTime,
          archivedAt: existing.archivedAt,
        }),
        discordRoleIds,
      },
    });
    if (published && postToDiscord) {
      await postEventWebhook(id);
    }
  } catch {
    fail(`/admin/events/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function retryEventWebhook(id: string) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) redirect("/admin/events");
  await postEventWebhook(id);
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function archiveEvent(id: string) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) redirect("/admin/events");
  try {
    await prisma.event.update({
      where: { id },
      data: { archivedAt: new Date(), status: "ARCHIVED" },
    });
  } catch {
    redirect("/admin/events");
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function restoreEvent(id: string) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) redirect("/admin/events");
  try {
    await prisma.event.update({
      where: { id },
      data: { archivedAt: null, status: getEventState({ startDateTime: event.startDateTime, endDateTime: event.endDateTime }) },
    });
  } catch {
    redirect("/admin/events");
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function setEventPublished(id: string, published: boolean) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) redirect("/admin/events");
  try {
    await prisma.event.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? (event.publishedAt ?? new Date()) : null,
        status: published
          ? getEventState({
              startDateTime: event.startDateTime,
              endDateTime: event.endDateTime,
              archivedAt: event.archivedAt,
            })
          : event.status,
      },
    });
  } catch {
    redirect("/admin/events");
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) redirect("/admin/events");
  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    redirect("/admin/events");
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}
