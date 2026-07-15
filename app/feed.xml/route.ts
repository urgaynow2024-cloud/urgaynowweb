import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";

export const revalidate = 300;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").replace(/\/$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Ur Gay Now";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: Date | string): string {
  return new Date(date).toUTCString();
}

export async function GET() {
  const items = await safeQuery(
    () =>
      prisma.announcement.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
    [],
  );

  const now = new Date();
  const pubDate = rfc822(now);

  const entries = items
    .map((a) => {
      const link = `${SITE_URL}/news/${a.slug}`;
      const description = escapeXml(a.excerpt || a.content.replace(/\s+/g, " ").slice(0, 400));
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(a.publishedAt)}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — News &amp; Announcements</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Latest news and announcements from ${escapeXml(SITE_NAME)}.</description>
    <language>en-gb</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <ttl>30</ttl>
${entries}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
