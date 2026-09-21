/**
 * Publishes the existing "Report System & Support Ticket Overhaul" changelog DRAFT.
 *
 * Mirrors what the admin `updateUpdate` action does when a staff member toggles
 * "published" on: publishedAt is set to now() (preserving an existing date) and
 * releaseStatus is set to PUBLISHED. Idempotent — safe to run repeatedly.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.update.findUnique({
    where: { slug: "report-system-support-ticket-overhaul" },
  });

  if (!existing) {
    console.log("Draft not found — nothing to publish.");
    return;
  }

  if (existing.publishedAt) {
    console.log("Already published:", existing.publishedAt);
    return;
  }

  const published = await prisma.update.update({
    where: { slug: "report-system-support-ticket-overhaul" },
    data: {
      publishedAt: new Date(),
      releaseStatus: "PUBLISHED",
    },
  });

  console.log("Published update:");
  console.log({
    id: published.id,
    slug: published.slug,
    version: published.version,
    title: published.title,
    publishedAt: published.publishedAt,
    releaseStatus: published.releaseStatus,
  });
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });