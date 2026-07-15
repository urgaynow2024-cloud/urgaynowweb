import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const meta = await prisma.$queryRawUnsafe(
    `SELECT current_database() AS db, current_user AS usr, version()`
  );
  console.log("META:", JSON.stringify(meta, null, 2));

  const tbls = await prisma.$queryRawUnsafe(
    `SELECT table_schema, table_name FROM information_schema.tables
     WHERE table_schema NOT IN ('pg_catalog','information_schema')
     ORDER BY table_schema, table_name`
  );
  console.log("TABLES:", tbls.length);
  for (const t of tbls) {
    let n = -1;
    try {
      const r = await prisma.$queryRawUnsafe(
        `SELECT count(*)::int AS n FROM "${t.table_schema}"."${t.table_name}"`
      );
      n = r[0].n;
    } catch (e) {
      n = "ERR";
    }
    console.log(`  ${t.table_schema}.${t.table_name} = ${n}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("FAILED:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
