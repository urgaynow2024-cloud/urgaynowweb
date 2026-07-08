"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function createGroupPhoto(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) redirect("/admin/group-photos/new?error=1");
  await prisma.groupPhoto.create({ data: { title, description, imageUrl } });
  redirect("/admin/group-photos");
}

export async function updateGroupPhoto(id: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) redirect(`/admin/group-photos/${id}?error=1`);
  await prisma.groupPhoto.update({ where: { id }, data: { title, description, imageUrl } });
  redirect("/admin/group-photos");
}

export async function deleteGroupPhoto(id: string) {
  await requireAdmin();
  await prisma.groupPhoto.delete({ where: { id } });
  redirect("/admin/group-photos");
}
