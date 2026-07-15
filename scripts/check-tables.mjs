import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  try {
    const r = await p.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'StatusMetric%'`;
    console.log(r);
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}

main();
