import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { BarChart } from "@/components/admin/ui/Chart";
import {
  IconUsers,
  IconMegaphone,
  IconCalendar,
  IconBook,
  IconLink,
  IconImages,
  IconCamera,
  IconActivity,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Reports", robots: { index: false, follow: false } };

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ReportsPage() {
  const [
    staffCount,
    announcementCount,
    eventCount,
    guideCount,
    linkCount,
    galleryCount,
    groupCount,
    recentAnnouncements,
    upcomingEvents,
  ] = await Promise.all([
    prisma.staff.count(),
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.guide.count(),
    prisma.link.count(),
    prisma.galleryImage.count(),
    prisma.groupPhoto.count(),
    prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.event.findMany({ orderBy: { startDateTime: "asc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Staff", value: staffCount, icon: <IconUsers size={20} />, accent: "brand" as const },
    { label: "News", value: announcementCount, icon: <IconMegaphone size={20} />, accent: "amber" as const },
    { label: "Events", value: eventCount, icon: <IconCalendar size={20} />, accent: "blue" as const },
    { label: "Guides", value: guideCount, icon: <IconBook size={20} />, accent: "emerald" as const },
    { label: "Links", value: linkCount, icon: <IconLink size={20} />, accent: "blue" as const },
    { label: "Gallery", value: galleryCount, icon: <IconImages size={20} />, accent: "brand" as const },
    { label: "Photos", value: groupCount, icon: <IconCamera size={20} />, accent: "emerald" as const },
  ];

  const chartData = [staffCount, announcementCount, eventCount, guideCount, linkCount, galleryCount, groupCount];
  const chartLabels = ["Staff", "News", "Events", "Guides", "Links", "Gallery", "Photos"];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
        title="Reports"
        description="Content analytics and recent activity across your community."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader title="Content by type" subtitle="Total items per content type" icon={<IconActivity size={18} />} />
          <CardBody>
            <BarChart data={chartData} labels={chartLabels} height={220} accent="#a256bb" />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader title="Recent announcements" subtitle="Latest published news" icon={<IconMegaphone size={18} />} />
          <CardBody className="p-0">
            {recentAnnouncements.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState icon={<IconMegaphone size={26} />} title="No announcements yet" description="Publish your first announcement to see it here." />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {recentAnnouncements.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/admin/announcements/${a.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{a.title}</p>
                        <p className="text-xs text-ink-400">{formatDate(a.publishedAt)}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-500">{relativeTime(a.publishedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader title="Upcoming events" subtitle="Next scheduled events" icon={<IconCalendar size={18} />} />
          <CardBody className="p-0">
            {upcomingEvents.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState icon={<IconCalendar size={26} />} title="No events scheduled" description="Create an event to see it listed here." />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {upcomingEvents.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/admin/events/${e.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{e.title}</p>
                        <p className="text-xs text-ink-400">{e.location || "No location"}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-500">{formatDate(e.startDateTime)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
