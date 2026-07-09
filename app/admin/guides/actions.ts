"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createGuide(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "General").trim();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!question) fail("/admin/guides/new");
  await prisma.guide.create({ data: { category, question, answer, sortOrder } });
  revalidatePath("/", "layout");
  revalidatePath("/guides");
  redirect("/admin/guides");
}

export async function updateGuide(id: string, formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "General").trim();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!question) fail(`/admin/guides/${id}`);
  await prisma.guide.update({ where: { id }, data: { category, question, answer, sortOrder } });
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
