/**
 * Applies a Prisma migration SQL file to the configured database.
 *
 * Usage:
 *   node scripts/apply-migration.mjs prisma/migrations/<name>/migration.sql
 *
 * The migration files in this repository are written to be idempotent, so
 * re-running this script against an already-migrated database is safe.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient();

/**
 * Split a SQL file into individual statements. Statements wrapped in dollar
 * quotes ($$ ... $$) may contain semicolons, so those regions are skipped.
 */
function splitStatements(sql) {
  const statements = [];
  let current = "";
  let inDollar = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (!inDollar && char === "$" && sql[i + 1] === "$") {
      inDollar = true;
      current += "$$";
      i++;
      continue;
    }
    if (inDollar && char === "$" && sql[i + 1] === "$") {
      inDollar = false;
      current += "$$";
      i++;
      continue;
    }

    if (char === ";" && !inDollar) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = "";
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/apply-migration.mjs <migration.sql path>");
    process.exit(1);
  }

  const path = resolve(process.cwd(), file);
  const sql = readFileSync(path, "utf8");
  const statements = splitStatements(sql);

  console.log(`Applying ${file} (${statements.length} statements)`);

  let applied = 0;
  for (const [index, statement] of statements.entries()) {
    try {
      await prisma.$executeRawUnsafe(statement);
      applied++;
    } catch (error) {
      console.error(`\nStatement ${index + 1} failed:\n${statement.slice(0, 400)}`);
      console.error(`\nError: ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
      break;
    }
  }

  console.log(`Applied ${applied}/${statements.length} statements`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("FAILED:", error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });