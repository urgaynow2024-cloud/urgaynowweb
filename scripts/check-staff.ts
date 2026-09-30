import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findMany({ orderBy: { sortOrder: "asc" } });
  console.log(JSON.stringify(staff, null, 2));
  await prisma.$disconnect();
}

main();