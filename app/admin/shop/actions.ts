"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function cleanGalleryUrls(formData: FormData): string[] {
  return (formData.getAll("galleryUrls") as string[])
    .map((s) => String(s || "").trim())
    .filter((s) => s.length > 0);
}

export async function createShopDesign(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const galleryUrls = cleanGalleryUrls(formData);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") || "0"), 10) || 0;

  if (!name || !imageUrl) redirect("/admin/shop/new?error=1");

  await prisma.shopDesign.create({
    data: {
      name,
      description: description || null,
      category,
      imageUrl,
      imageAlt,
      galleryUrls,
      featured,
      published,
      sortOrder,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/about");
  redirect("/admin/shop");
}

export async function updateShopDesign(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageAlt = String(formData.get("imageAlt") || "").trim() || null;
  const galleryUrls = cleanGalleryUrls(formData);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") || "0"), 10) || 0;

  if (!name || !imageUrl) redirect(`/admin/shop/${id}?error=1`);

  await prisma.shopDesign.update({
    where: { id },
    data: {
      name,
      description: description || null,
      category,
      imageUrl,
      imageAlt,
      galleryUrls,
      featured,
      published,
      sortOrder,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/about");
  redirect("/admin/shop");
}

export async function updateShopDesignOrder(id: string, formData: FormData) {
  await requireAdmin();
  const order = Number.parseInt(String(formData.get("order") || "0"), 10) || 0;
  await prisma.shopDesign.update({ where: { id }, data: { sortOrder: order } });
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/about");
  redirect("/admin/shop");
}

export async function deleteShopDesign(id: string) {
  await requireAdmin();
  await prisma.shopDesign.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/about");
  redirect("/admin/shop");
}
