const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.update
  .findMany({
    select: {
      id: true, version: true, slug: true, title: true, summary: true,
      whatsNew: true, improvements: true, bugFixes: true, securityNotes: true,
      type: true, category: true, releaseStatus: true, publishedAt: true,
      sourceCommit: true, sourceBranch: true, deploymentId: true,
      generatedAutomatically: true, createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })
  .then((rows) => {
    console.log("Update rows:", rows.length);
    for (const r of rows) {
      console.log("\n=== v" + r.version + " ===");
      console.log("  id:          ", r.id);
      console.log("  slug:        ", r.slug);
      console.log("  title:       ", r.title);
      console.log("  summary:     ", r.summary);
      console.log("  whatsNew:    ", JSON.stringify(r.whatsNew));
      console.log("  improvements:", JSON.stringify(r.improvements));
      console.log("  bugFixes:    ", JSON.stringify(r.bugFixes));
      console.log("  security:    ", JSON.stringify(r.securityNotes));
      console.log("  type/cat:    ", r.type, "/", r.category, "| auto:", r.generatedAutomatically);
      console.log("  publishedAt: ", r.publishedAt ? r.publishedAt.toISOString() : "null");
      console.log("  commit:      ", r.sourceCommit);
      console.log("  deploymentId:", r.deploymentId);
    }
  })
  .finally(() => prisma.$disconnect());