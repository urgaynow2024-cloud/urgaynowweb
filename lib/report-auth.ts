import "server-only";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { getReportPermissionsForRank, type ReportPermission } from "@/lib/report-access";
import { ADMIN_RATE_LIMIT } from "@/lib/reports";
import { checkMemoryRateLimit, getClientIp } from "@/lib/request-security";

export type ReportStaff = {
  id: string;
  name: string;
  rank: string;
  roleKey: string;
  permissions: ReportPermission[];
};

export type StaffAuthResult =
  | { ok: true; staff: ReportStaff }
  | { ok: false; status: 401 | 403 | 429; message: string };

/**
 * Resolve the current staff member and verify a report permission server-side.
 *
 * Returns a discriminated result instead of throwing so callers can turn it
 * into the right HTTP response. Every report route uses this — no route trusts
 * client-provided staff IDs, roles, or permissions.
 */
export async function authorizeReportStaff(
  request: Request,
  permission: ReportPermission,
): Promise<StaffAuthResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, status: 401, message: "You must be signed in as staff." };
  }

  const staff = await safeQuery(
    () => prisma.staff.findUnique({ where: { id: session.sub } }),
    null,
  );

  if (!staff) {
    return { ok: false, status: 403, message: "Staff access required." };
  }

  const roleKey = staff.rank ?? "";
  if (!getReportPermissionsForRank(roleKey).includes(permission)) {
    return {
      ok: false,
      status: 403,
      message: "Your staff role does not have permission to do that.",
    };
  }

  // Light throttling so a compromised staff session cannot spam the queue.
  const ip = getClientIp(request);
  const limit = checkMemoryRateLimit(
    `report-admin:${staff.id}:${permission}:${ip}`,
    ADMIN_RATE_LIMIT.MAX_PER_WINDOW,
    ADMIN_RATE_LIMIT.WINDOW_MS,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      status: 429,
      message: "Too many staff actions. Please slow down and try again.",
    };
  }

  return {
    ok: true,
    staff: {
      id: staff.id,
      name: staff.name,
      rank: staff.rank,
      roleKey,
      permissions: getReportPermissionsForRank(roleKey),
    },
  };
}

/** Convert an {@link StaffAuthResult} failure into an HTTP response. */
export function staffAuthErrorResponse(result: Extract<StaffAuthResult, { ok: false }>) {
  return NextResponse.json(
    { success: false, error: result.message },
    { status: result.status },
  );
}