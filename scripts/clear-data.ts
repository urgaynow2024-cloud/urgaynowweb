import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all content...");
  await prisma.galleryImage.deleteMany();
  await prisma.groupPhoto.deleteMany();
  await prisma.link.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.setting.deleteMany();
  console.log("All fake/sample data removed. Database is clean.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
