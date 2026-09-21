/**
 * Seeds the "Report System & Support Ticket Overhaul" changelog DRAFT.
 *
 * Spec: docs/UrGayNow_Updates_and_Staff_Improvements.md §8 "Add the Current
 * Completed Work". This is a *draft* (not published) so it is reviewed by staff
 * before going live on /updates.
 *
 * Idempotent: creates the draft by slug, or updates an existing draft in place.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WHATS_NEW = `### Report Management
- New admin report center
- Report statistics
- Advanced report filtering
- Report detail pages
- Staff assignment
- Status management
- Priority management
- Internal notes
- Resolution notes
- Dismissal reasons
- Escalation
- Audit logs

### Public Reporting
- Gallery reporting
- Community reporting
- Staff profile reporting
- Event reporting
- Shop reporting
- News/announcement reporting

### Report Tracking
- /report/me — your submitted reports
- /report/track/[token] — track a report by token
- /my-reports — personal report history

### Support Tickets
- New support contact form
- Support categories
- Unique UGN-YYYY-XXXXX ticket numbers
- Ticket statuses
- Ticket priorities
- Guest submissions
- Staff Discord notifications`;

const IMPROVEMENTS = `### Notifications
- Staff Discord notifications
- Reporter resolution notifications
- Report tracking links

### Community
- Community page data aggregation
- Approved/published filtering
- Newest-first sorting`;

const SECURITY_NOTES = `### Security
- Database-backed rate limiting
- IP and user rate limiting
- Duplicate report prevention
- Authentication checks
- Admin permission checks
- Anonymous reporting`;

async function main() {
  const update = await prisma.update.upsert({
    where: { slug: "report-system-support-ticket-overhaul" },
    create: {
      slug: "report-system-support-ticket-overhaul",
      version: "1.0.0",
      type: "MAJOR",
      category: "NEW",
      title: "Report System & Support Ticket Overhaul",
      summary:
        "Major improvements to reporting, moderation support, and user support requests across Ur Gay Now.",
      whatsNew: WHATS_NEW,
      improvements: IMPROVEMENTS,
      bugFixes: "",
      securityNotes: SECURITY_NOTES,
      images: "[]",
      authorId: "system",
      featured: false,
      publishedAt: null,
      generatedAutomatically: false,
      releaseStatus: "DRAFT",
    },
    update: {
      version: "1.0.0",
      type: "MAJOR",
      category: "NEW",
      title: "Report System & Support Ticket Overhaul",
      summary:
        "Major improvements to reporting, moderation support, and user support requests across Ur Gay Now.",
      whatsNew: WHATS_NEW,
      improvements: IMPROVEMENTS,
      bugFixes: "",
      securityNotes: SECURITY_NOTES,
      authorId: "system",
      generatedAutomatically: false,
      releaseStatus: "DRAFT",
    },
  });

  console.log("Changelog draft ready.");
  console.log({
    id: update.id,
    slug: update.slug,
    version: update.version,
    title: update.title,
    category: update.category,
    featured: update.featured,
    publishedAt: update.publishedAt,
    releaseStatus: update.releaseStatus,
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
