import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportDetailClient } from "@/components/admin/ReportDetailClient";

export const metadata: Metadata = { title: "Report Details", robots: { index: false, follow: false } };

export const revalidate = 30;

async function getReportWithDetails(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      auditLogs: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { id: true, name: true } } },
      },
    },
  });
}

async function getReportedContent(report: Awaited<ReturnType<typeof getReportWithDetails>>) {
  if (!report) return null;
  try {
    switch (report.contentType) {
      case "COMMUNITY_SUBMISSION":
        return prisma.communitySubmission.findUnique({
          where: { id: report.contentId },
          select: { id: true, title: true, description: true, imageUrl: true, submitterName: true, status: true, type: true },
        });
      case "GALLERY_IMAGE":
        return prisma.galleryImage.findUnique({
          where: { id: report.contentId },
          select: { id: true, title: true, description: true, imageUrl: true, submitterName: true, status: true },
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
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function getReportContentHref(contentType: string, contentId: string): string | null {
  switch (contentType) {
    case "COMMUNITY_SUBMISSION":
    case "COMMUNITY_PHOTO":
      return `/community/${contentId}`;
    case "GALLERY_IMAGE":
      return `/gallery`;
    case "GROUP_PHOTO":
      return `/groups/${contentId}`;
    case "EVENT":
      return `/events`;
    case "STAFF_PROFILE":
      return `/staff/${contentId}`;
    case "SHOP_DESIGN":
      return `/shop`;
    case "ANNOUNCEMENT":
      return `/news`;
    default:
      return null;
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return <div className="admin-bg min-h-screen" />;
  }

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff) {
    return <div className="admin-bg min-h-screen" />;
  }

  const report = await getReportWithDetails(id);
  if (!report) {
    notFound();
  }

  const content = await getReportedContent(report);
  const contentHref = getReportContentHref(report.contentType, report.contentId);

  return (
    <ReportDetailClient
      report={report}
      content={content}
      contentHref={contentHref}
      currentStaff={{ id: staff.id, name: staff.name }}
    />
  );
}