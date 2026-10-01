/**
 * Prints the newest report with its audit trail so the verification run can be
 * inspected (reference, webhook state, evidence, audit entries).
 *
 * Usage: npx tsx scripts/inspect-report-audit.ts [reference]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const reference = process.argv[2];
  const report = await prisma.report.findFirst({
    where: reference ? { reference } : undefined,
    orderBy: { referenceSeq: "desc" },
    include: {
      evidenceFiles: { select: { fileName: true, size: true, contentType: true } },
      auditLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) {
    console.log("No reports found.");
    return;
  }

  console.log("=== Report ===");
  console.log({
    reference: report.reference,
    source: report.source,
    category: report.reason,
    status: report.status,
    priority: report.priority,
    anonymous: report.anonymous,
    webhookStatus: report.webhookStatus,
    webhookAttempts: report.webhookAttempts,
    webhookError: report.webhookError || null,
    evidence: report.evidenceFiles,
    descriptionLength: report.description.length,
  });

  console.log("\n=== Audit trail ===");
  for (const entry of report.auditLogs) {
    console.log(
      `${entry.createdAt.toISOString()}  ${entry.action.padEnd(16)} ${entry.actorName}: ${entry.detail}`,
    );
  }
  console.log(`\n${report.auditLogs.length} audit entries`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("FAILED:", error);
    await prisma.$disconnect();
    process.exit(1);
  });