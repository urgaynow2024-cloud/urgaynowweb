import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ReportDetailClient } from "@/components/admin/ReportDetailClient";
import { getReportPermissionsForRank } from "@/lib/report-access";
import { getReportContentHref } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Report Details",
  robots: { index: false, follow: false },
};

/** Staff-only page — never cached. */
export const dynamic = "force-dynamic";

async function getReportWithDetails(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      evidenceFiles: {
        select: { id: true, fileName: true, contentType: true, size: true, createdAt: true },
      },
      auditLogs: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { id: true, name: true } } },
      },
    },
  });
}

async function getReportedContent(report: Awaited<ReturnType<typeof getReportWithDetails>>) {
  if (!report || report.contentType === "NONE" || !report.contentId) return null;
  try {
    switch (report.contentType) {
      case "COMMUNITY_SUBMISSION":
        return prisma.communitySubmission.findUnique({
          where: { id: report.contentId },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            submitterName: true,
            status: true,
            type: true,
          },
        });
      case "GALLERY_IMAGE":
        return prisma.galleryImage.findUnique({
          where: { id: report.contentId },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            submitterName: true,
            status: true,
          },
        });
      case "GROUP_PHOTO":
        return prisma.groupPhoto.findUnique({
          where: { id: report.contentId },
          select: { id: true, title: true, description: true, imageUrl: true, bannerUrl: true },
        });
      case "EVENT":
        return prisma.event.findUnique({
          where: { id: report.contentId },
          select: { id: true, title: true, summary: true, coverImage: true, status: true, startDateTime: true },
        });
      case "STAFF_PROFILE":
        return prisma.staff.findUnique({
          where: { id: report.contentId },
          select: { id: true, name: true, vrchatUsername: true, photoUrl: true, rank: true },
        });
      case "SHOP_DESIGN":
        return prisma.shopDesign.findUnique({
          where: { id: report.contentId },
          select: { id: true, name: true, description: true, imageUrl: true, creator: true },
        });
      case "ANNOUNCEMENT":
        return prisma.announcement.findUnique({
          where: { id: report.contentId },
          select: { id: true, title: true, excerpt: true, coverImage: true, state: true },
        });
      case "COMMUNITY_REVIEW":
        return prisma.review.findUnique({
          where: { id: report.contentId },
          select: {
            id: true,
            displayName: true,
            content: true,
            rating: true,
            status: true,
            createdAt: true,
          },
        });
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^[a-z0-9]{15,32}$/i.test(id)) {
    notFound();
  }

  const session = await getSession();
  if (!session) {
    redirect("/admin/login?from=/admin/reports");
  }

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  const permissions = getReportPermissionsForRank(staff?.rank);
  if (!staff || !permissions.includes("reports.view")) {
    redirect("/admin");
  }

  const report = await getReportWithDetails(id);
  if (!report) {
    notFound();
  }

  const content = await getReportedContent(report);
  const contentHref = getReportContentHref(report.contentType, report.contentId);

  // Opening a report is recorded so the dashboard can show triage progress.
  await prisma.report
    .update({ where: { id: report.id }, data: { lastViewedAt: new Date() } })
    .catch(() => undefined);

  return (
    <ReportDetailClient
      report={report}
      content={content}
      contentHref={contentHref}
      currentStaff={{ id: staff.id, name: staff.name, rank: staff.rank }}
      permissions={permissions}
    />
  );
}