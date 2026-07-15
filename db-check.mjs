import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = [
  "staff",
  "partner",
  "announcement",
  "event",
  "rule",
  "guide",
  "link",
  "galleryImage",
  "groupPhoto",
  "setting",
  "shopDesign",
  "statusService",
  "incident",
  "maintenance",
  "statusSubscriber",
];

async function main() {
  console.log("Connected. Row counts per model:");
  const results = {};
  for (const t of tables) {
    try {
      results[t] = await prisma[t].count();
    } catch (e) {
      results[t] = "ERR: " + e.message;
    }
  }
  console.table(results);

  const settings = await prisma.setting.findMany();
  console.log("Setting rows:", settings.length);
  for (const s of settings) {
    const v = s.value.length > 40 ? s.value.slice(0, 40) + "…" : s.value;
    console.log(`  - ${s.key} = "${v}"`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("VERIFY FAILED:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
