"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseSocials, stringifySocials } from "@/lib/utils";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createStaff(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const vrchatUsername = String(formData.get("vrchatUsername") || "").trim();
  const rank = String(formData.get("rank") || "Member").trim();
  const bio = String(formData.get("bio") || "").trim();
  const photoUrl = String(formData.get("photoUrl") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  const socials = parseSocials(String(formData.get("socials") || "[]"));

  if (!name || !vrchatUsername) fail("/admin/staff/new");

  try {
    await prisma.staff.create({
      data: {
        name,
        vrchatUsername,
        rank: rank || "Member",
        bio,
        photoUrl,
        sortOrder,
        socials: stringifySocials(socials),
      },
    });
  } catch {
    fail("/admin/staff/new");
  }
  redirect("/admin/staff");
}

export async function updateStaff(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const vrchatUsername = String(formData.get("vrchatUsername") || "").trim();
  const rank = String(formData.get("rank") || "Member").trim();
  const bio = String(formData.get("bio") || "").trim();
  const photoUrl = String(formData.get("photoUrl") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  const socials = parseSocials(String(formData.get("socials") || "[]"));

  if (!name || !vrchatUsername) fail(`/admin/staff/${id}`);

  try {
    await prisma.staff.update({
      where: { id },
      data: { name, vrchatUsername, rank, bio, photoUrl, sortOrder, socials: stringifySocials(socials) },
    });
  } catch {
    fail(`/admin/staff/${id}`);
  }
  redirect("/admin/staff");
}

export async function deleteStaff(id: string) {
  await requireAdmin();
  await prisma.staff.delete({ where: { id } });
  redirect("/admin/staff");
}
