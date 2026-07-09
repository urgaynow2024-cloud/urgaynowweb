"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createLink(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const icon = String(formData.get("icon") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!label || !url) fail("/admin/links/new");
  await prisma.link.create({ data: { label, url, icon, sortOrder } });
  revalidatePath("/", "layout");
  revalidatePath("/links");
  redirect("/admin/links");
}

export async function updateLink(id: string, formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const icon = String(formData.get("icon") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!label || !url) fail(`/admin/links/${id}`);
  await prisma.link.update({ where: { id }, data: { label, url, icon, sortOrder } });
  revalidatePath("/", "layout");
  revalidatePath("/links");
  redirect("/admin/links");
}

export async function deleteLink(id: string) {
  await requireAdmin();
  await prisma.link.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/links");
  redirect("/admin/links");
}
