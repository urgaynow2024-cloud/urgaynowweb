import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Fix legacy rank values
  await prisma.staff.updateMany({
    where: { rank: "Co~Founder" },
    data: { rank: "Co-Founder" },
  });
  
  await prisma.staff.updateMany({
    where: { rank: "Co~Owner" },
    data: { rank: "Co-Owner" },
  });
  
  await prisma.staff.updateMany({
    where: { rank: "Safe~Guarding" },
    data: { rank: "Safeguarding" },
  });
  
  await prisma.staff.updateMany({
    where: { rank: "Moderator/Media" },
    data: { rank: "Moderator" },
  });
  
  await prisma.staff.updateMany({
    where: { rank: "Moderator / Media" },
    data: { rank: "Moderator" },
  });

  // Verify the changes
  const staff = await prisma.staff.findMany({ orderBy: { sortOrder: "asc" } });
  console.log(JSON.stringify(staff.map(s => ({ id: s.id, name: s.name, rank: s.rank, sortOrder: s.sortOrder })), null, 2));
  
  await prisma.$disconnect();
}

main();