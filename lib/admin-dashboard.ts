import "server-only";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { safeQuery } from "@/lib/safeQuery";

export type AttentionCounts = {
  pendingSubmissions: number;
  openReports: number;
  draftAnnouncements: number;
  upcomingEventsNeedingAttention: number;
  failedDiscordDeliveries: number;
  missingGroupPhotoBanners: number;
  unfinishedReleases: number;
};

export type SiteOverview = {
  staff: number;
  events: number;
  gallery: number;
  communitySubmissions: number;
  announcements: number;
  guides: number;
  links: number;
  updates: number;
};

export type DashboardActivity = {
  id: string;
  type: "moderation" | "report";
  actor: string;
  action: string;
  target: string;
  href: string;
  at: Date;
  detail?: string;
};

export type SystemHealth = {
  database: { status: "operational" | "unavailable"; label: string };
  storage: { status: "operational" | "attention" | "unavailable"; label: string };
  discord: { status: "operational" | "attention" | "unavailable"; label: string };
  version: string;
  lastRelease: Date | null;
};

function actionLabel(action: string) {
  return action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function getAttentionCounts(): Promise<AttentionCounts> {
  const now = new Date();
  const [
    pendingSubmissions,
    openReports,
    draftAnnouncements,
    upcomingEventsNeedingAttention,
    failedAnnouncements,
    failedEvents,
    failedUpdates,
    missingGroupPhotoBanners,
    unfinishedReleases,
  ] = await Promise.all([
    safeQuery(() => prisma.communitySubmission.count({ where: { status: "PENDING" } }), 0),
    safeQuery(() => prisma.communitySubmissionReport.count({ where: { status: { in: ["RECEIVED", "UNDER_REVIEW"] } } }), 0),
    safeQuery(() => prisma.announcement.count({ where: { state: "DRAFT" } }), 0),
    safeQuery(
      () =>
        prisma.event.count({
          where: {
            published: true,
            startDateTime: { gte: now },
            OR: [{ discordPosted: false }, { discordPostStatus: "failed" }],
          },
        }),
      0,
    ),
    safeQuery(() => prisma.announcement.count({ where: { discordPostStatus: "failed" } }), 0),
    safeQuery(() => prisma.event.count({ where: { discordPostStatus: "failed" } }), 0),
    safeQuery(() => prisma.update.count({ where: { discordPostStatus: "failed" } }), 0),
    safeQuery(() => prisma.groupPhoto.count({ where: { bannerUrl: "" } }), 0),
    safeQuery(
      () =>
        prisma.update.count({
          where: { OR: [{ discordPostStatus: "failed" }, { publishedAt: null }] },
        }),
      0,
    ),
  ]);

  return {
    pendingSubmissions,
    openReports,
    draftAnnouncements,
    upcomingEventsNeedingAttention,
    failedDiscordDeliveries: failedAnnouncements + failedEvents + failedUpdates,
    missingGroupPhotoBanners,
    unfinishedReleases,
  };
}

export async function getSiteOverview(): Promise<SiteOverview> {
  const [staff, events, gallery, communitySubmissions, announcements, guides, links, updates] =
    await Promise.all([
      safeQuery(() => prisma.staff.count(), 0),
      safeQuery(() => prisma.event.count(), 0),
      safeQuery(() => prisma.galleryImage.count(), 0),
      safeQuery(() => prisma.communitySubmission.count(), 0),
      safeQuery(() => prisma.announcement.count(), 0),
      safeQuery(() => prisma.guide.count(), 0),
      safeQuery(() => prisma.link.count(), 0),
      safeQuery(() => prisma.update.count(), 0),
    ]);

  return { staff, events, gallery, communitySubmissions, announcements, guides, links, updates };
}

export async function getRecentActivity(): Promise<DashboardActivity[]> {
  const [logs, reports] = await Promise.all([
    safeQuery<DashboardActivity[]>(
      async () => {
        const rows = await prisma.communitySubmissionModerationLog.findMany({
          take: 12,
          orderBy: { performedAt: "desc" },
          select: {
            id: true,
            action: true,
            note: true,
            performedAt: true,
            performedBy: true,
            submission: { select: { id: true, title: true } },
            staff: { select: { name: true } },
          },
        });
        return rows.map((row) => ({
          id: row.id,
          type: "moderation" as const,
          actor: row.staff?.name || row.performedBy || "System",
          action: actionLabel(row.action),
          target: row.submission.title || row.submission.id,
          href: "/admin/community",
          at: row.performedAt,
          detail: row.note || undefined,
        }));
      },
      [],
    ),
    safeQuery<DashboardActivity[]>(
      async () => {
        const rows = await prisma.communitySubmissionReport.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            reason: true,
            anonymous: true,
            reporterName: true,
            createdAt: true,
            submission: { select: { id: true, title: true } },
          },
        });
        return rows.map((row) => ({
          id: row.id,
          type: "report" as const,
          actor: row.anonymous ? "Anonymous reporter" : row.reporterName || "Reporter",
          action: "Report submitted",
          target: row.submission.title || row.submission.id,
          href: `/admin/reports/${row.id}`,
          at: row.createdAt,
          detail: row.reason.replaceAll("_", " "),
        }));
      },
      [],
    ),
  ]);

  return [...logs, ...reports]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const [databaseAvailable, latestRelease, healthChecks, failedDiscordDeliveries] = await Promise.all([
    safeQuery(async () => {
      await prisma.staff.count();
      return true;
    }, false),
    safeQuery(
      async () =>
        (await prisma.update.findFirst({
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          select: { version: true, publishedAt: true },
        })) ?? null,
      null,
    ),
    safeQuery(
      async () =>
        await prisma.healthCheck.findMany({
          orderBy: { checkedAt: "desc" },
          take: 20,
        }),
      [],
    ),
    getAttentionCounts().then((counts) => counts.failedDiscordDeliveries),
  ]);

  const latestByService = healthChecks.reduce((acc, check) => {
    if (!acc[check.serviceId]) acc[check.serviceId] = check;
    return acc;
  }, {} as Record<string, { status: string; checkedAt: Date }>);
  const storageConfigured = Boolean(env.blobStoreId && env.vercelOidc);
  const discordConfigured = Boolean(env.webhookSecret);
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    process.env.NEXT_PUBLIC_SITE_VERSION ||
    latestRelease?.version ||
    "local";

  return {
    database: {
      status: databaseAvailable ? "operational" : "unavailable",
      label: databaseAvailable ? "Connected" : "Unavailable",
    },
    storage: {
      status: storageConfigured ? "operational" : "attention",
      label: storageConfigured ? "Upload storage configured" : "Upload storage needs setup",
    },
    discord: {
      status: !discordConfigured ? "unavailable" : failedDiscordDeliveries > 0 ? "attention" : "operational",
      label: !discordConfigured ? "Discord integration not configured" : failedDiscordDeliveries > 0 ? "Failed deliveries need review" : "Discord integration healthy",
    },
    version,
    lastRelease: latestRelease?.publishedAt ?? null,
  };
}
