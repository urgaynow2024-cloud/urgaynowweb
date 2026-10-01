import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { REPORT_LIMITS } from "@/lib/reports";
import { validateEvidenceFile } from "@/lib/report-validation";
import { checkMemoryRateLimit, getClientIp, hashIp } from "@/lib/request-security";
import { ensureEvidenceToken } from "@/lib/report-evidence-token";

export const runtime = "nodejs";

const UPLOAD_RATE_LIMIT = { WINDOW_MS: 60 * 60 * 1000, MAX_PER_WINDOW: 20 };
/** Unclaimed uploads are removed after this long. */
const STAGED_UPLOAD_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Stage a report evidence file.
 *
 * The bytes are written to the database, never to a public bucket, so there is
 * no shareable URL. A report can only claim uploads made by the same visitor
 * (enforced through the httpOnly evidence cookie), and only staff with the
 * `reports.evidence` permission can read them back.
 */
export async function POST(req: Request) {
  const ipHash = hashIp(getClientIp(req));

  const limit = checkMemoryRateLimit(
    `report-evidence:${ipHash}`,
    UPLOAD_RATE_LIMIT.MAX_PER_WINDOW,
    UPLOAD_RATE_LIMIT.WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: `That file could not be read. Each file must be ${Math.floor(
          REPORT_LIMITS.EVIDENCE_MAX_BYTES / (1024 * 1024),
        )}MB or smaller.`,
      },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file was provided." },
      { status: 400 },
    );
  }

  if (file.size > REPORT_LIMITS.EVIDENCE_MAX_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: `Each file must be ${Math.floor(
          REPORT_LIMITS.EVIDENCE_MAX_BYTES / (1024 * 1024),
        )}MB or smaller.`,
      },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = validateEvidenceFile(file, bytes);
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.error }, { status: 400 });
  }

  // Housekeeping: drop abandoned uploads so evidence cannot accumulate forever.
  prisma.reportEvidence
    .deleteMany({
      where: { reportId: null, createdAt: { lt: new Date(Date.now() - STAGED_UPLOAD_TTL_MS) } },
    })
    .catch(() => undefined);

  const uploaderToken = await ensureEvidenceToken();
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  // Identical file re-uploaded by the same visitor: reuse the staged row.
  const existing = await prisma.reportEvidence.findFirst({
    where: { uploaderToken, sha256, reportId: null, fileName: check.safeFileName },
    orderBy: { createdAt: "desc" },
    select: { id: true, size: true, fileName: true, contentType: true, createdAt: true },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      id: existing.id,
      fileName: existing.fileName,
      size: existing.size,
      contentType: existing.contentType,
      deduplicated: true,
    });
  }

  const row = await prisma.reportEvidence.create({
    data: {
      uploaderToken,
      fileName: check.safeFileName,
      contentType: (file.type || "application/octet-stream").toLowerCase(),
      size: file.size,
      sha256,
      data: Buffer.from(bytes),
    },
    select: { id: true, fileName: true, size: true, contentType: true },
  });

  return NextResponse.json({ success: true, ...row });
}