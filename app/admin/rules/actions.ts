"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createRule(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "General").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!title) fail("/admin/rules/new");
  await prisma.rule.create({ data: { category, title, content, sortOrder } });
  redirect("/admin/rules");
}

export async function updateRule(id: string, formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "General").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!title) fail(`/admin/rules/${id}`);
  await prisma.rule.update({ where: { id }, data: { category, title, content, sortOrder } });
  redirect("/admin/rules");
}

export async function deleteRule(id: string) {
  await requireAdmin();
  await prisma.rule.delete({ where: { id } });
  redirect("/admin/rules");
}
