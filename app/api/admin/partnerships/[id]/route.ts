import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendPartnershipWebhook } from "@/lib/partnership-webhook";

export const runtime = "nodejs";

const ACTION_PERMISSIONS: Record<string, string> = {
  approve: "partnerships.manage",
  reject: "partnerships.manage",
  pending: "partnerships.manage",
};

async function requireStaff() {
  const session = await getSession();
  if (!session) return { ok: false, status: 401 as const, message: "You must be signed in as staff." };

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff) return { ok: false, status: 403 as const, message: "Staff access required." };

  const allowedRanks = ["founder", "co_founder", "co_owner", "admin", "safeguarding", "moderator"];
  if (!allowedRanks.includes(staff.rank)) {
    return { ok: false, status: 403 as const, message: "Your staff role does not have permission to do that." };
  }

  return { ok: true, staff };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaff();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }
  const staff = auth.staff;
  if (!staff) {
    return NextResponse.json({ success: false, error: "Staff access required." }, { status: 403 });
  }

  const { id } = await params;
  if (!id || !/^[a-z0-9]{15,32}$/i.test(id)) {
    return NextResponse.json({ success: false, error: "Invalid application id." }, { status: 400 });
  }

  let body: { action?: string; rejectionReason?: string; internalNotes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action.trim() : "";
  if (!(action in ACTION_PERMISSIONS)) {
    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  }

  const application = await prisma.partnerApplication.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, status: true },
  });
  if (!application) {
    return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
  }

  let newStatus: "PENDING" | "APPROVED" | "REJECTED" = "PENDING";
  switch (action) {
    case "approve":
      newStatus = "APPROVED";
      break;
    case "reject":
      newStatus = "REJECTED";
      break;
    case "pending":
      newStatus = "PENDING";
      break;
    default:
      return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  }

  const updateData: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewedAt: Date;
    reviewedBy: string;
    rejectionReason?: string;
    internalNotes?: string;
  } = {
    status: newStatus,
    reviewedAt: new Date(),
    reviewedBy: staff.id,
  };

  if (action === "reject" && typeof body.rejectionReason === "string") {
    updateData.rejectionReason = body.rejectionReason.trim();
  }
  if (typeof body.internalNotes === "string") {
    updateData.internalNotes = body.internalNotes.trim();
  }

  try {
    const updated = await prisma.partnerApplication.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        discord: true,
        website: true,
        description: true,
        status: true,
        reviewedAt: true,
      },
    });

    // Send Discord notification for status change (best-effort).
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
      console.error("[partnerships/patch] webhook notification failed", {
        applicationId: updated.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });

    return NextResponse.json({
      success: true,
      application: updated,
      message: `Application ${newStatus.toLowerCase()} successfully.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[partnerships/patch] failed to update application", {
      applicationId: id,
      message,
    });
    return NextResponse.json(
      { success: false, error: "Could not update application. Please try again." },
      { status: 500 },
    );
  }
}
