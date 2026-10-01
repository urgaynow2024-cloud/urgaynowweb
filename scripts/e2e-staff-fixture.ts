/**
 * Dumps the staff rows needed by scripts/report-e2e-test.mjs.
 * Test helper only — writes .e2e-staff.json in the project root.
 */
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findMany({
    select: { id: true, name: true, rank: true },
    orderBy: { name: "asc" },
  });
  writeFileSync("./.e2e-staff.json", JSON.stringify(staff, null, 2));
  console.log(`Wrote ${staff.length} staff rows to .e2e-staff.json`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("FAILED:", error);
    await prisma.$disconnect();
    process.exit(1);
  });