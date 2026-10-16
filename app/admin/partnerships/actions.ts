"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendPartnershipWebhook } from "@/lib/partnership-webhook";

const ALLOWED_RANKS = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];

async function requireAuthorizedStaff() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff || !ALLOWED_RANKS.includes(staff.rank)) redirect("/admin");
  return staff;
}

export async function updatePartnershipStatus(
  formData: FormData,
): Promise<void> {
  const staff = await requireAuthorizedStaff();

  const id = String(formData.get("id") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const rejectionReason = String(formData.get("rejectionReason") || "").trim() || undefined;

  if (!/^[a-z0-9]{15,32}$/i.test(id)) {
    redirect(`/admin/partnerships?error=1`);
  }

  if (!["approve", "reject", "pending"].includes(action)) {
    redirect(`/admin/partnerships?error=1`);
  }

  const application = await prisma.partnerApplication.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, status: true },
  });
  if (!application) redirect(`/admin/partnerships?error=1`);

  let newStatus: "PENDING" | "APPROVED" | "REJECTED" = "PENDING";
  switch (action) {
    case "approve": newStatus = "APPROVED"; break;
    case "reject": newStatus = "REJECTED"; break;
    case "pending": newStatus = "PENDING"; break;
  }

  try {
    const updated = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: staff.id,
        ...(action === "reject" && rejectionReason ? { rejectionReason: rejectionReason.trim() } : {}),
      },
      select: { id: true, name: true, email: true, discord: true, website: true, description: true, status: true },
    });

    await sendPartnershipWebhook({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      discord: updated.discord || undefined,
      website: updated.website || undefined,
      description: updated.description,
      status: updated.status,
      action: action === "approve" ? "approved" : action === "reject" ? "rejected" : "submitted",
      reviewerName: staff.name,
    }).catch((error) => {
      console.error("[partnerships/action] webhook notification failed", {
        applicationId: updated.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });

    revalidatePath("/admin/partnerships");
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[partnerships/action] failed", { applicationId: id, message });
    redirect(`/admin/partnerships?error=1`);
  }
}
