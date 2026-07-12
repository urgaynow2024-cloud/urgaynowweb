import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [announcements, partners, staff, events, guides, links] = await Promise.all([
    safeQuery(
      () =>
        prisma.announcement.findMany({
          where: { published: true },
          select: { slug: true, publishedAt: true },
        }),
      [] as { slug: string; publishedAt: Date }[],
    ),
    safeQuery(() => prisma.partner.findMany({ select: { id: true } }), [] as { id: string }[]),
    safeQuery(() => prisma.staff.findMany({ select: { id: true } }), [] as { id: string }[]),
    safeQuery(() => prisma.event.findMany({ select: { id: true } }), [] as { id: string }[]),
    safeQuery(() => prisma.guide.findMany({ select: { id: true } }), [] as { id: string }[]),
    safeQuery(() => prisma.link.findMany({ select: { id: true } }), [] as { id: string }[]),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/rules",
    "/staff",
    "/events",
    "/guides",
    "/links",
    "/news",
    "/gallery",
    "/shop",
    "/partners",
    "/support",
    "/search",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const announcementRoutes: MetadataRoute.Sitemap = (
    announcements as { slug: string; publishedAt: Date }[]
  ).map((a) => ({
    url: `${SITE}/news/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...announcementRoutes];
}
