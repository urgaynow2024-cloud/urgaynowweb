"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { normalizeUrl, isValidUrl } from "@/lib/links";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

const CATEGORIES = ["Community", "VRChat", "Socials", "Support", "Creators/Partners", "Other"];

function coerceBool(value: FormDataEntryValue | null): boolean {
  const v = value === null ? "" : String(value).toLowerCase();
  return v === "true" || v === "on" || v === "1";
}

function coerceOrder(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function coerceCategory(value: FormDataEntryValue | null): string {
  const v = value ? String(value).trim() : "";
  return CATEGORIES.includes(v) ? v : "Other";
}

interface LinkFormValues {
  label: string;
  url: string;
  icon: string;
  description: string;
  category: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

function readValues(formData: FormData): LinkFormValues {
  const label = String(formData.get("label") || "").trim();
  const url = normalizeUrl(String(formData.get("url") || ""));
  const icon = String(formData.get("icon") || "").trim() || "link";
  const description = String(formData.get("description") || "").trim();
  const category = coerceCategory(formData.get("category"));
  const featured = coerceBool(formData.get("featured"));
  const active = coerceBool(formData.get("active"));
  const sortOrder = coerceOrder(formData.get("sortOrder"));
  return { label, url, icon, description, category, featured, active, sortOrder };
}

export async function createLink(formData: FormData) {
  await requireAdmin();
  const v = readValues(formData);
  if (!v.label || !isValidUrl(v.url)) fail("/admin/links/new");
  await prisma.link.create({
    data: {
      label: v.label,
      url: v.url,
      icon: v.icon,
      description: v.description,
      category: v.category,
      featured: v.featured,
      active: v.active,
      sortOrder: v.sortOrder,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/links");
  redirect("/admin/links");
}

export async function updateLink(id: string, formData: FormData) {
  await requireAdmin();
  const v = readValues(formData);
  if (!v.label || !isValidUrl(v.url)) fail(`/admin/links/${id}`);
  await prisma.link.update({
    where: { id },
    data: {
      label: v.label,
      url: v.url,
      icon: v.icon,
      description: v.description,
      category: v.category,
      featured: v.featured,
      active: v.active,
      sortOrder: v.sortOrder,
    },
  });
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
