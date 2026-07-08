"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createPartner(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const link = String(formData.get("link") || "").trim();
  const tag = String(formData.get("tag") || "Partner").trim() || "Partner";
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!name) fail("/admin/partners/new");

  try {
    await prisma.partner.create({
      data: { name, logoUrl, description, link, tag, sortOrder },
    });
  } catch {
    fail("/admin/partners/new");
  }
  redirect("/admin/partners");
}

export async function updatePartner(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const link = String(formData.get("link") || "").trim();
  const tag = String(formData.get("tag") || "Partner").trim() || "Partner";
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!name) fail(`/admin/partners/${id}`);

  try {
    await prisma.partner.update({
      where: { id },
      data: { name, logoUrl, description, link, tag, sortOrder },
    });
  } catch {
    fail(`/admin/partners/${id}`);
  }
  redirect("/admin/partners");
}

export async function deletePartner(id: string) {
  await requireAdmin();
  await prisma.partner.delete({ where: { id } });
  redirect("/admin/partners");
}
