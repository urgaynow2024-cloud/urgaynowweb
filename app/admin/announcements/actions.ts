"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

function fail(path: string) {
  redirect(`${path}?error=1`);
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
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  redirect("/admin/announcements");
}
