"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseSocials, stringifySocials } from "@/lib/utils";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createPartner(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const links = parseSocials(String(formData.get("links") || "[]"));
  const tag = String(formData.get("tag") || "Partner").trim() || "Partner";
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!name) fail("/admin/partners/new");

  try {
    await prisma.partner.create({
      data: { name, logoUrl, description, links: stringifySocials(links), tag, sortOrder },
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
  const links = parseSocials(String(formData.get("links") || "[]"));
  const tag = String(formData.get("tag") || "Partner").trim() || "Partner";
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!name) fail(`/admin/partners/${id}`);

  try {
    await prisma.partner.update({
      where: { id },
      data: { name, logoUrl, description, links: stringifySocials(links), tag, sortOrder },
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
