"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ALLOWED_RANKS = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];

async function requireAuthorizedStaff() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff || !ALLOWED_RANKS.includes(staff.rank)) redirect("/admin");
  return staff;
}

export async function updateTicket(formData: FormData) {
  const staff = await requireAuthorizedStaff();

  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim() || undefined;
  const priority = String(formData.get("priority") || "").trim() || undefined;
  const assignedStaffId = String(formData.get("assignedStaffId") || "").trim() || null;

  if (!/^[a-z0-9]{15,32}$/i.test(id)) {
    redirect(`/admin/support/tickets?error=1`);
  }

  const updateData: Record<string, string | null> = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (assignedStaffId !== null) updateData.assignedStaffId = assignedStaffId;

  if (Object.keys(updateData).length === 0) {
    redirect(`/admin/support/tickets/${id}`);
  }

  try {
    await prisma.supportRequest.update({
      where: { id },
      data: updateData,
    });
    revalidatePath(`/admin/support/tickets/${id}`);
    revalidatePath("/admin/support/tickets");
  } catch {
    redirect(`/admin/support/tickets/${id}?error=1`);
  }

  redirect(`/admin/support/tickets/${id}`);
}
