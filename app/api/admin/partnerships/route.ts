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
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const where: Prisma.PartnerApplicationWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status as "PENDING" | "APPROVED" | "REJECTED";
  }

  const [applications, totalCount] = await Promise.all([
    prisma.partnerApplication.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        discord: true,
        website: true,
        description: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        rejectionReason: true,
        createdAt: true,
      },
    }),
    prisma.partnerApplication.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return NextResponse.json({
    success: true,
    applications,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages,
    },
  });
}
