import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

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
  ] = await Promise.all([
    prisma.staff.count(),
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.guide.count(),
    prisma.link.count(),
    prisma.galleryImage.count(),
    prisma.groupPhoto.count(),
    prisma.staff.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.event.findMany({ orderBy: { startDateTime: "desc" }, take: 5 }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalContent = staffCount + announcementCount + eventCount + guideCount + linkCount + galleryCount + groupCount;

  const activity = [
    ...recentStaff.map((s) => ({ type: "Staff", title: s.name, href: `/admin/staff/${s.id}`, at: s.createdAt, icon: "👥" })),
    ...recentAnnouncements.map((a) => ({ type: "Announcement", title: a.title, href: `/admin/announcements/${a.id}`, at: a.publishedAt, icon: "📣" })),
    ...recentEvents.map((e) => ({ type: "Event", title: e.title, href: `/admin/events/${e.id}`, at: e.createdAt, icon: "📅" })),
    ...recentGroups.map((g) => ({ type: "Group Photo", title: g.title, href: `/admin/group-photos/${g.id}`, at: g.createdAt, icon: "📷" })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Overview of your community and content
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-secondary">
              View site →
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Staff"
            value={staffCount}
            icon="👥"
            description="Team members"
          />
          <AdminStatCard
            title="Group Photos"
            value={groupCount}
            icon="📷"
            description="Community moments"
          />
          <AdminStatCard
            title="Announcements"
            value={announcementCount}
            icon="📣"
            description="Published posts"
          />
          <AdminStatCard
            title="Events"
            value={eventCount}
            icon="📅"
            description="Scheduled events"
          />
        </div>

        {/* Content Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard
            title="Recent Activity"
            description="Latest changes across your content"
          >
            {activity.length === 0 ? (
              <AdminEmptyState
                icon="📭"
                title="No recent activity"
                description="Start creating content to see activity here"
              />
            ) : (
              <div className="space-y-3">
                {activity.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/30"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.type} · {relativeTime(item.at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard
            title="Content Overview"
            description="Total items across all categories"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalContent}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Content</p>
                </div>
                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/30">
                  <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{galleryCount}</p>
                  <p className="text-sm text-brand-600 dark:text-brand-400">Gallery Images</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Guides</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{guideCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Links</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{linkCount}</span>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Quick Actions */}
        <AdminCard title="Quick Actions" description="Create new content">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/staff/new" className="btn-secondary">
              + Add Staff
            </Link>
            <Link href="/admin/announcements/new" className="btn-secondary">
              + Announcement
            </Link>
            <Link href="/admin/events/new" className="btn-secondary">
              + Event
            </Link>
            <Link href="/admin/group-photos/new" className="btn-secondary">
              + Group Photo
            </Link>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
