import "server-only";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Mints the human-facing report reference (UGN-000123).
 *
 * A dedicated counter row is incremented atomically so two simultaneous
 * submissions can never receive the same reference. If a rare unique-constraint
 * collision still happens (for example after a manual database restore), the
 * value is re-read and retried.
 */

export const REPORT_COUNTER_ID = "reports";
const REFERENCE_PAD = 6;
const MAX_ATTEMPTS = 5;

export function formatReference(sequence: number): string {
  return `UGN-${String(sequence).padStart(REFERENCE_PAD, "0")}`;
}

export async function nextReportSequence(): Promise<number> {
  const counter = await prisma.reportCounter.upsert({
    where: { id: REPORT_COUNTER_ID },
    create: { id: REPORT_COUNTER_ID, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

export async function nextReportReference(): Promise<{ reference: string; sequence: number }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const sequence = await nextReportSequence();
    const reference = formatReference(sequence);

    const clash = await prisma.report.findFirst({
      where: { reference },
      select: { id: true },
    });

    if (!clash) return { reference, sequence };
  }

  // Extremely unlikely; fall back to a time-suffixed value rather than looping.
  const sequence = await nextReportSequence();
  return { reference: `${formatReference(sequence)}-${Date.now().toString(36)}`, sequence };
}

/** True when the error is a Postgres unique violation on the reference column. */
export function isReferenceConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" || error.code === "P2010")
  );
}