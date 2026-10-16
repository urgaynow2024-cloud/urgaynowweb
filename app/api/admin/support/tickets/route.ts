import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const PAGE_SIZE = 25;

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

export async function GET(req: Request) {
  const auth = await requireStaff();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const priority = searchParams.get("priority")?.trim() || "";
  const assigned = searchParams.get("assigned")?.trim() || "";
  const unassigned = searchParams.get("unassigned") === "true";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sort = searchParams.get("sort")?.trim() || "newest";

  const where: Prisma.SupportRequestWhereInput = {};
  if (q) {
    where.OR = [
      { ticketNumber: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { contactInfo: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (unassigned) where.assignedStaffId = null;
  else if (assigned) where.assignedStaffId = assigned;

  const orderBy: Prisma.SupportRequestOrderByWithRelationInput[] = sort === "oldest"
    ? [{ createdAt: "asc" }]
    : sort === "priority"
      ? [{ priority: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  const [tickets, totalCount] = await Promise.all([
    prisma.supportRequest.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.supportRequest.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return NextResponse.json({
    success: true,
    tickets,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages,
    },
  });
}
