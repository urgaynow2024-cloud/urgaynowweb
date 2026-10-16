import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

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

const VALID_STATUSES = ["OPEN", "IN_REVIEW", "WAITING_INFO", "RESOLVED", "DISMISSED", "CLOSED"];
const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

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
    return NextResponse.json({ success: false, error: "Invalid ticket id." }, { status: 400 });
  }

  let body: { status?: string; priority?: string; assignedStaffId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const ticket = await prisma.supportRequest.findUnique({
    where: { id },
    select: { id: true, ticketNumber: true, status: true },
  });
  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
  }

  const updateData: { status?: string; priority?: string; assignedStaffId?: string | null } = {};

  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
    }
    updateData.status = body.status;
  }
  if (typeof body.priority === "string") {
    if (!VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ success: false, error: "Invalid priority." }, { status: 400 });
    }
    updateData.priority = body.priority;
  }
  if (typeof body.assignedStaffId === "string") {
    if (body.assignedStaffId) {
      const assignee = await prisma.staff.findUnique({
        where: { id: body.assignedStaffId },
        select: { id: true },
      });
      if (!assignee) {
        return NextResponse.json({ success: false, error: "Assignee not found." }, { status: 404 });
      }
      updateData.assignedStaffId = body.assignedStaffId;
    } else {
      updateData.assignedStaffId = null;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
  }

  try {
    const updated = await prisma.supportRequest.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        ticketNumber: true,
        category: true,
        subject: true,
        description: true,
        contactMethod: true,
        contactInfo: true,
        status: true,
        priority: true,
        assignedStaffId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: "Ticket updated successfully.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[admin/support/tickets/patch] failed", { ticketId: id, message });
    return NextResponse.json(
      { success: false, error: "Could not update ticket. Please try again." },
      { status: 500 },
    );
  }
}
