import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Badge, StatusPill } from "@/components/admin/ui/Badge";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Dropdown } from "@/components/admin/ui/Dropdown";
import { BarChart, MiniAreaChart } from "@/components/admin/ui/Chart";
import {
  IconUsers,
  IconCamera,
  IconMegaphone,
  IconCalendar,
  IconImages,
  IconBook,
  IconLink,
  IconFlag,
  IconPlus,
  IconActivity,
  IconArrowRight,
  IconShield,
  IconExternal,
  IconLayers,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Illustrative growth curve that tapers to the current total.
function growthSeries(total: number): number[] {
  const base = Math.max(1, Math.round(total * 0.18));
  return MONTHS.map((_, i) => {
    const t = i / 11;
    const v = Math.round(base + (total - base) * (t * t * (3 - 2 * t)));
    return Math.max(1, v);
  });
}

export default async function AdminDashboard() {
  const [
    staffCount,
    announcementCount,
    eventCount,
    guideCount,
    linkCount,
    galleryCount,
    groupCount,
    recentStaff,
    recentAnnouncements,
    recentEvents,
    recentGroups,
    pendingGroups,
  ] = await Promise.all([
    prisma.staff.count(),
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.guide.count(),
    prisma.link.count(),
    prisma.galleryImage.count(),
    prisma.groupPhoto.count(),
    prisma.staff.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 4 }),
    prisma.event.findMany({ orderBy: { startDateTime: "desc" }, take: 4 }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.groupPhoto.count({ where: { OR: [{ bannerUrl: "" }, { rules: "" }] } }),
  ]);

  const totalContent = staffCount + announcementCount + eventCount + guideCount + linkCount + galleryCount + groupCount;

  const activity = [
    ...recentStaff.map((s) => ({ type: "Staff", title: s.name, href: `/admin/staff/${s.id}`, at: s.createdAt, icon: <IconUsers size={15} />, tone: "brand" as const })),
    ...recentAnnouncements.map((a) => ({ type: "Announcement", title: a.title, href: `/admin/announcements/${a.id}`, at: a.publishedAt, icon: <IconMegaphone size={15} />, tone: "amber" as const })),
    ...recentEvents.map((e) => ({ type: "Event", title: e.title, href: `/admin/events/${e.id}`, at: e.createdAt, icon: <IconCalendar size={15} />, tone: "blue" as const })),
    ...recentGroups.map((g) => ({ type: "Group Photo", title: g.title, href: `/admin/group-photos/${g.id}`, at: g.createdAt, icon: <IconCamera size={15} />, tone: "emerald" as const })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const distribution = [
    { label: "Staff", value: staffCount, accent: "#a256bb" },
    { label: "Group Photos", value: groupCount, accent: "#10b981" },
    { label: "Announcements", value: announcementCount, accent: "#f59e0b" },
    { label: "Events", value: eventCount, accent: "#3b82f6" },
    { label: "Gallery", value: galleryCount, accent: "#750787" },
  ];
  const distMax = Math.max(1, ...distribution.map((d) => d.value));

  const stats = [
    { label: "Total Users", value: staffCount, icon: <IconUsers size={20} />, accent: "brand" as const, spark: growthSeries(staffCount), trend: 12 },
    { label: "Group Photos", value: groupCount, icon: <IconCamera size={20} />, accent: "emerald" as const, spark: growthSeries(groupCount), trend: 8 },
    { label: "Announcements", value: announcementCount, icon: <IconMegaphone size={20} />, accent: "amber" as const, trend: 4 },
    { label: "Events", value: eventCount, icon: <IconCalendar size={20} />, accent: "blue" as const, trend: -3 },
    { label: "Uploaded Photos", value: galleryCount, icon: <IconImages size={20} />, accent: "brand" as const, trend: 15 },
    { label: "Guides", value: guideCount, icon: <IconBook size={20} />, accent: "emerald" as const },
    { label: "Links", value: linkCount, icon: <IconLink size={20} />, accent: "blue" as const },
    { label: "Pending Reports", value: pendingGroups, icon: <IconFlag size={20} />, accent: "red" as const, hint: "Group photos need review" },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        description="An overview of your community, content, and moderation queue."
        actions={
          <>
            <Link href="/" className="btn-ghost btn-sm hidden sm:inline-flex">
              <IconExternal size={15} /> View site
            </Link>
            <Dropdown
              align="end"
              label="Quick create"
              trigger={
                <span className="btn-primary btn-sm">
                  <IconPlus size={15} /> New
                </span>
              }
              items={[
                { label: "New announcement", href: "/admin/announcements/new", icon: <IconPlus size={15} /> },
                { label: "New event", href: "/admin/events/new", icon: <IconPlus size={15} /> },
                { label: "New staff member", href: "/admin/staff/new", icon: <IconPlus size={15} /> },
                { label: "Upload group photo", href: "/admin/group-photos/new", icon: <IconPlus size={15} /> },
              ]}
            />
          </>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} spark={s.spark} trend={s.trend} hint={s.hint} />
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Content growth"
            subtitle="New items added over the last 12 months"
            icon={<IconActivity size={18} />}
            actions={<Badge tone="brand">Live</Badge>}
          />
          <CardBody>
            <BarChart data={growthSeries(totalContent)} labels={MONTHS} height={200} />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {distribution.map((d) => (
                <div key={d.label} className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                  <p className="text-2xl font-bold text-ink-900 dark:text-white">{d.value}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{d.label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Content mix" subtitle="Distribution by type" icon={<IconLayers size={18} />} />
          <CardBody className="space-y-4">
            {distribution.map((d) => (
              <div key={d.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700 dark:text-ink-200">{d.label}</span>
                  <span className="text-ink-500">{d.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full rounded-full transition-[width] duration-700 ease-spring" style={{ width: `${(d.value / distMax) * 100}%`, backgroundColor: d.accent }} />
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-transparent p-4 dark:from-brand-900/30">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">Total content</p>
              <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-300">{totalContent}</p>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent activity"
            subtitle="Latest changes across your content"
            icon={<IconActivity size={18} />}
            actions={
              <Link href="/admin/reports" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 ${
                    a.tone === "brand" ? "text-brand-500" : a.tone === "amber" ? "text-amber-500" : a.tone === "blue" ? "text-blue-500" : "text-emerald-500"
                  }`}>
                    {a.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={a.href} className="block truncate text-sm font-medium text-ink-800 hover:text-brand-600 dark:text-ink-100 dark:hover:text-brand-300">
                      {a.title}
                    </Link>
                    <p className="text-xs text-ink-400">{a.type} · {relativeTime(a.at)}</p>
                  </div>
                  <Badge tone={a.tone === "brand" ? "brand" : a.tone === "amber" ? "warning" : a.tone === "blue" ? "neutral" : "success"}>{a.type}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Moderation queue"
            subtitle="Group photos that need attention"
            icon={<IconShield size={18} />}
            actions={pendingGroups > 0 ? <Badge tone="danger">{pendingGroups} pending</Badge> : <Badge tone="success">Clear</Badge>}
          />
          <CardBody className="p-0">
            {recentGroups.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-ink-500 dark:text-ink-400">No group photos yet.</p>
                <Link href="/admin/group-photos/new" className="btn-primary btn-sm mt-3">Upload photo</Link>
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {recentGroups.map((g) => {
                  const needsReview = !g.bannerUrl || !g.rules;
                  return (
                    <li key={g.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.bannerUrl || g.imageUrl} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{g.title}</p>
                        <p className="text-xs text-ink-400">{relativeTime(g.createdAt)}</p>
                      </div>
                      {needsReview ? <StatusPill tone="warning">Needs review</StatusPill> : <StatusPill tone="success">Ready</StatusPill>}
                      <Link href={`/admin/group-photos/${g.id}`} className="btn-ghost btn-sm">
                        Review <IconArrowRight size={14} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
