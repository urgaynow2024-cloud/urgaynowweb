"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseSocials, stringifySocials } from "@/lib/utils";

const limits = {
  name: 100,
  vrchatUsername: 50,
  rank: 80,
  bio: 1000,
  socialLabel: 50,
  socialUrl: 500,
} as const;

function fail(path: string, error = "server"): never {
  redirect(`${path}?error=${error}`);
}

function readSortOrder(value: FormDataEntryValue | null, path: string) {
  const sortOrder = Number(value ?? 0);
  if (!Number.isFinite(sortOrder) || sortOrder < 0) fail(path, "validation");
  return Math.trunc(sortOrder);
}

function readSocials(value: FormDataEntryValue | null, path: string) {
  const socials = parseSocials(String(value ?? "[]")).map((social) => ({
    label: social.label.slice(0, limits.socialLabel),
    url: social.url.slice(0, limits.socialUrl),
  }));
  if (socials.some((social) => social.url && !/^https?:\/\/.+/i.test(social.url))) {
    fail(path, "validation");
  }
  return socials;
}

function isDuplicate(error: unknown) {
  return (error as { code?: string })?.code === "P2002";
}

function refreshStaffPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/staff");
  revalidatePath("/admin/staff");
}

export async function createStaff(formData: FormData) {
  await requireAdmin();
  const path = "/admin/staff/new";
  const name = String(formData.get("name") || "").trim().slice(0, limits.name);
  const vrchatUsername = String(formData.get("vrchatUsername") || "").trim().slice(0, limits.vrchatUsername);
  const rank = String(formData.get("rank") || "Member").trim().slice(0, limits.rank) || "Member";
  const bio = String(formData.get("bio") || "").trim().slice(0, limits.bio);
  const photoUrl = String(formData.get("photoUrl") || "").trim();
  const sortOrder = readSortOrder(formData.get("sortOrder"), path);
  const socials = readSocials(formData.get("socials"), path);

  if (!name || !vrchatUsername) fail(path, "validation");

  try {
    await prisma.staff.create({
      data: {
        name,
        vrchatUsername,
        rank,
        bio,
        photoUrl,
        sortOrder,
        socials: stringifySocials(socials),
      },
    });
  } catch (error) {
    fail(path, isDuplicate(error) ? "duplicate" : "server");
  }

  refreshStaffPaths();
  redirect("/admin/staff");
}

export async function updateStaff(id: string, formData: FormData) {
  await requireAdmin();
  const path = `/admin/staff/${id}`;
  const name = String(formData.get("name") || "").trim().slice(0, limits.name);
  const vrchatUsername = String(formData.get("vrchatUsername") || "").trim().slice(0, limits.vrchatUsername);
  const rank = String(formData.get("rank") || "Member").trim().slice(0, limits.rank) || "Member";
  const bio = String(formData.get("bio") || "").trim().slice(0, limits.bio);
  const photoUrl = String(formData.get("photoUrl") || "").trim();
  const sortOrder = readSortOrder(formData.get("sortOrder"), path);
  const socials = readSocials(formData.get("socials"), path);

  if (!name || !vrchatUsername) fail(path, "validation");

  try {
    await prisma.staff.update({
      where: { id },
      data: { name, vrchatUsername, rank, bio, photoUrl, sortOrder, socials: stringifySocials(socials) },
    });
  } catch (error) {
    fail(path, isDuplicate(error) ? "duplicate" : "server");
  }

  refreshStaffPaths();
  redirect("/admin/staff");
}

export async function deleteStaff(id: string) {
  await requireAdmin();
  await prisma.staff.delete({ where: { id } });
  refreshStaffPaths();
  redirect("/admin/staff");
}

export async function duplicateStaff(id: string) {
  await requireAdmin();
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) fail("/admin/staff", "server");

  const baseUsername = staff.vrchatUsername.replace(/-copy-\d+$/i, "");
  let vrchatUsername = `${baseUsername}-copy`;
  let suffix = 2;
  while (await prisma.staff.findUnique({ where: { vrchatUsername } })) {
    vrchatUsername = `${baseUsername}-copy-${suffix}`;
    suffix += 1;
  }

  try {
    await prisma.staff.create({
      data: {
        name: `${staff.name} copy`.slice(0, limits.name),
        vrchatUsername,
        rank: staff.rank,
        bio: staff.bio,
        photoUrl: staff.photoUrl,
        socials: staff.socials,
        sortOrder: staff.sortOrder + 1,
      },
    });
  } catch (error) {
    fail("/admin/staff", isDuplicate(error) ? "duplicate" : "server");
  }

  refreshStaffPaths();
  redirect("/admin/staff");
}

export async function moveStaff(id: string, direction: "up" | "down") {
  await requireAdmin();
  const staff = await prisma.staff.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, sortOrder: true },
  });
  const index = staff.findIndex((member) => member.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  const target = staff[index];
  const neighbor = staff[neighborIndex];

  if (!target || !neighbor) redirect("/admin/staff");

  await prisma.$transaction([
    prisma.staff.update({ where: { id: target.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.staff.update({ where: { id: neighbor.id }, data: { sortOrder: target.sortOrder } }),
  ]);
  refreshStaffPaths();
  redirect("/admin/staff");
}
