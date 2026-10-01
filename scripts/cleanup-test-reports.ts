/**
 * Removes reports and evidence created by the automated verification runs.
 *
 * Usage: npx tsx scripts/cleanup-test-reports.ts
 *
 * Only touches rows produced by scripts/report-e2e-test.mjs (identified by the
 * test reporter email and the test target names) plus unclaimed staged uploads.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_TARGETS = [
  "Test Target",
  "WebhookDiagnostic",
  "RateLimitVerifier",
];

async function main() {
  const rateTargets = await prisma.report.findMany({
    where: { reportedPerson: { startsWith: "RateTarget" } },
    select: { id: true },
  });
  const ids = [
    ...(
      await prisma.report.findMany({
        where: {
          OR: [
            { reporterEmail: "test@example.com" },
            { reportedPerson: { in: TEST_TARGETS } },
            { id: { in: rateTargets.map((r) => r.id) } },
          ],
        },
        select: { id: true },
      })
    ).map((r) => r.id),
  ];

  if (ids.length === 0) {
    console.log("No test reports found.");
  } else {
    // Audit rows cascade with the report.
    const deleted = await prisma.report.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${deleted.count} test reports.`);
  }

  const orphanEvidence = await prisma.reportEvidence.deleteMany({
    where: { reportId: null },
  });
  console.log(`Deleted ${orphanEvidence.count} unclaimed staged evidence rows.`);

  const counter = await prisma.reportCounter.findFirst();
  const remaining = await prisma.report.count();
  console.log(`Counter value=${counter?.value}, remaining reports=${remaining}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("FAILED:", error);
    await prisma.$disconnect();
    process.exit(1);
  });