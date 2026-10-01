import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const counter = await prisma.reportCounter.findFirst();
  const theme = await prisma.siteTheme.findFirst({ include: { schedules: true } });
  const reportCols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Report' ORDER BY column_name`
  );
  console.log("counter:", JSON.stringify(counter));
  console.log("theme:", JSON.stringify(theme));
  console.log("report columns:", reportCols.map((c) => c.column_name).join(","));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("FAILED:", error);
    await prisma.$disconnect();
    process.exit(1);
  });