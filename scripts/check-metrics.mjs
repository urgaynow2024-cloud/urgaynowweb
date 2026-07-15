import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  try {
    const count = await p.statusMetric.count();
    console.log("statusMetric rows:", count);
    const samples = await p.statusMetric.findMany({ take: 5 });
    console.log("samples:", JSON.stringify(samples, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}

main();
