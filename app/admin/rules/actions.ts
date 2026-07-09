"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  revalidatePath("/", "layout");
  revalidatePath("/rules");
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
  revalidatePath("/", "layout");
  revalidatePath("/rules");
  redirect("/admin/rules");
}

export async function deleteRule(id: string) {
  await requireAdmin();
  await prisma.rule.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/rules");
  redirect("/admin/rules");
}

export async function bulkSaveRules(rulesJson: string) {
  await requireAdmin();
  
  const rules = JSON.parse(rulesJson) as Array<{
    id?: string;
    category: string;
    title: string;
    content: string;
    sortOrder: number;
  }>;

  await prisma.$transaction(async (tx) => {
    // Delete all existing rules
    await tx.rule.deleteMany({});
    
    // Create all new rules
    for (const rule of rules) {
      await tx.rule.create({
        data: {
          category: rule.category,
          title: rule.title,
          content: rule.content,
          sortOrder: rule.sortOrder,
        },
      });
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/rules");
  redirect("/admin/rules");
}
