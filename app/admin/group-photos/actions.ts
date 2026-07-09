"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function createGroupPhoto(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const bannerUrl = String(formData.get("bannerUrl") || "").trim();
  const rules = String(formData.get("rules") || "").trim();

  if (!imageUrl) redirect("/admin/group-photos/new?error=1");

  const created = await prisma.groupPhoto.create({
    data: { title, description, imageUrl, bannerUrl, rules },
  });
  revalidatePath("/", "layout");
  revalidatePath("/groups", "layout");
  redirect(`/admin/group-photos/${created.id}`);
}

/** Drag-and-drop upload entry point: creates a placeholder record and opens the editor. */
export async function createGroupPhotoQuick(formData: FormData) {
  await requireAdmin();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const bannerUrl = String(formData.get("bannerUrl") || "").trim();
  if (!imageUrl) return;
  const created = await prisma.groupPhoto.create({
    data: {
      title: "Untitled group",
      description: "",
      imageUrl,
      bannerUrl,
      rules: "",
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/groups", "layout");
  redirect(`/admin/group-photos/${created.id}`);
}

export async function updateGroupPhoto(id: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const bannerUrl = String(formData.get("bannerUrl") || "").trim();
  const rules = String(formData.get("rules") || "").trim();

  if (!imageUrl) redirect(`/admin/group-photos/${id}?error=1`);

  await prisma.groupPhoto.update({
    where: { id },
    data: { title, description, imageUrl, bannerUrl, rules },
  });
  revalidatePath("/", "layout");
  revalidatePath("/groups", "layout");
  revalidatePath(`/groups/${id}`);
  redirect("/admin/group-photos");
}

export async function deleteGroupPhoto(id: string) {
  await requireAdmin();
  await prisma.groupPhoto.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/groups", "layout");
  redirect("/admin/group-photos");
}
