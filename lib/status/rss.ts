import "server-only";
import { prisma } from "@/lib/db";
import {
  type IncidentStatus,
  type MaintenanceStatus,
  INCIDENT_STATUS_META,
  MAINTENANCE_STATUS_META,
} from "@/lib/status/types";

type RssItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
};

/** Build an RSS 2.0 feed of incidents + maintenance for public subscribers. */
export async function buildStatusRss(siteUrl = "https://urgaynow.com"): Promise<string> {
  const base = siteUrl.replace(/\/$/, "");
  const incidents = await prisma.incident
    .findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 50 })
    .catch(() => []);
  const maintenances = await prisma.maintenance
    .findMany({ where: { published: true }, orderBy: { startAt: "desc" }, take: 50 })
    .catch(() => []);

  const items: RssItem[] = [
    ...incidents.map((i) => ({
      title: `[Incident: ${INCIDENT_STATUS_META[i.status as IncidentStatus].label}] ${i.title}`,
      description: i.description || i.title,
      link: `${base}/status#incident-${i.id}`,
      pubDate: new Date(i.createdAt).toUTCString(),
    })),
    ...maintenances.map((m) => ({
      title: `[Maintenance: ${MAINTENANCE_STATUS_META[m.status as MaintenanceStatus].label}] ${m.title}`,
      description: m.description || m.title,
      link: `${base}/status#maintenance-${m.id}`,
      pubDate: new Date(m.createdAt).toUTCString(),
    })),
  ].sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

  const itemXml = items
    .map(
      (it) =>
        `    <item>\n      <title>${escapeXml(it.title)}</title>\n      <description>${escapeXml(it.description)}</description>\n      <link>${escapeXml(it.link)}</link>\n      <guid>${escapeXml(it.link)}</guid>\n      <pubDate>${it.pubDate}</pubDate>\n    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ur Gay Now — System Status</title>
    <link>${base}/status</link>
    <description>Incidents and maintenance for the Ur Gay Now platform.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemXml}
  </channel>
</rss>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
