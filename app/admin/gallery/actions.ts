"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function createGalleryImage(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) redirect("/admin/gallery/new?error=1");
  await prisma.galleryImage.create({ data: { title, description, imageUrl } });
  redirect("/admin/gallery");
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) redirect(`/admin/gallery/${id}?error=1`);
  await prisma.galleryImage.update({ where: { id }, data: { title, description, imageUrl } });
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  await prisma.galleryImage.delete({ where: { id } });
  redirect("/admin/gallery");
}
