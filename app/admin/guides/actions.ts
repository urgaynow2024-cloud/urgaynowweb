"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

function generateSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function createGuide(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "GENERAL").trim().toUpperCase();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  let slug = String(formData.get("slug") || "").trim().toLowerCase();
  const relatedGuides = String(formData.get("relatedGuides") || "").trim();

  if (!question) fail("/admin/guides/new");
  if (!slug) slug = generateSlug(question);

  const relatedIds = relatedGuides
    ? relatedGuides.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  await prisma.guide.create({
    data: {
      category: category as any,
      question,
      answer,
      sortOrder,
      slug,
      relatedGuides: relatedIds.length > 0 ? { connect: relatedIds.map((id) => ({ id })) } : undefined,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/guides");
  redirect("/admin/guides");
}

export async function updateGuide(id: string, formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "GENERAL").trim().toUpperCase();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  let slug = String(formData.get("slug") || "").trim().toLowerCase();
  const relatedGuides = String(formData.get("relatedGuides") || "").trim();

  if (!question) fail(`/admin/guides/${id}`);
  if (!slug) slug = generateSlug(question);

  const relatedIds = relatedGuides
    ? relatedGuides.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  await prisma.guide.update({
    where: { id },
    data: {
      category: category as any,
      question,
      answer,
      sortOrder,
      slug,
      relatedGuides: relatedIds.length > 0 ? { set: relatedIds.map((id) => ({ id })) } : { set: [] },
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/guides");
  redirect("/admin/guides");
}

export async function deleteGuide(id: string) {
  await requireAdmin();
  await prisma.guide.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/guides");
  redirect("/admin/guides");
}