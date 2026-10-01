import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeReportStaff, staffAuthErrorResponse } from "@/lib/report-auth";

export const runtime = "nodejs";

/**
 * Stream a report evidence file to an authorized staff member.
 *
 * Evidence has no public URL. Access requires a valid staff session *and* the
 * `reports.evidence` permission, and every successful open is written to the
 * report audit trail. The response is marked no-store so evidence cannot be
 * cached by a CDN or the browser.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const auth = await authorizeReportStaff(req, "reports.evidence");
  if (!auth.ok) return staffAuthErrorResponse(auth);

  const { evidenceId } = await params;
  if (!/^[a-z0-9]{15,32}$/i.test(evidenceId)) {
    return NextResponse.json({ success: false, error: "Invalid evidence id." }, { status: 400 });
  }

  const evidence = await prisma.reportEvidence.findUnique({
    where: { id: evidenceId },
    select: {
      id: true,
      reportId: true,
      fileName: true,
      contentType: true,
      size: true,
      data: true,
      report: { select: { reference: true } },
    },
  });

  if (!evidence || !evidence.reportId) {
    return NextResponse.json({ success: false, error: "Evidence not found." }, { status: 404 });
  }

  await prisma.reportAuditLog
    .create({
      data: {
        reportId: evidence.reportId,
        action: "EVIDENCE_VIEWED",
        actorId: auth.staff.id,
        actorName: auth.staff.name,
        detail: `Opened evidence file ${evidence.fileName}.`,
      },
    })
    .catch(() => undefined);

  const raw = evidence.data;
  const bytes = raw instanceof Uint8Array ? new Uint8Array(raw) : new Uint8Array(raw as ArrayLike<number>);

  // Only serve inline-safe types; everything else downloads with a neutral name.
  const inlineSafe = /^(image\/(png|jpeg|gif|webp|avif)|application\/pdf|text\/plain)$/.test(
    evidence.contentType,
  );

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": evidence.contentType || "application/octet-stream",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${inlineSafe ? "inline" : "attachment"}; filename="${
        evidence.fileName.replace(/[^\w.\- ]+/g, "_")
      }"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Referrer-Policy": "no-referrer",
    },
  });
}