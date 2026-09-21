import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import {
  getAttentionCounts,
  getRecentActivity,
  getSiteOverview,
  getSystemHealth,
} from "@/lib/admin-dashboard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ThemeStatus } from "@/components/admin/ThemeStatus";
import { StatGridSkeleton, ListSkeleton } from "@/components/Skeleton";
import { formatDate } from "@/lib/utils";
import {
  IconUsers,
  IconCalendar,
  IconImages,
  IconMegaphone,
  IconBook,
  IconLink,
  IconActivity,
  IconClock,
  IconFlag,
  IconCamera,
  IconBell,
  IconShield,
  IconExternal,
  IconArrowRight,
  IconCheck,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const revalidate = 60;

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

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function statusTone(status: string) {
  if (status === "operational") return "badge-success";
  if (status === "attention") return "badge-warning";
  return "badge-danger";
}

async function DashboardContent({ userName }: { userName: string }) {
  const [attention, overview, activity, health] = await Promise.all([
    getAttentionCounts(),
    getSiteOverview(),
    getRecentActivity(),
    getSystemHealth(),
  ]);

  const attentionItems = [
    {
      label: "Pending community submissions",
      count: attention.pendingSubmissions,
      description: "Review member submissions before publishing",
      href: "/admin/community",
      icon: <IconClock size={20} />,
      tone: "text-amber-600 dark:text-amber-400",
      surface: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Open reports",
      count: attention.openReports,
      description: "Reports waiting for a safety review",
      href: "/admin/reports",
      icon: <IconFlag size={20} />,
      tone: "text-red-600 dark:text-red-400",
      surface: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Draft announcements",
      count: attention.draftAnnouncements,
      description: "Finish or schedule community updates",
      href: "/admin/announcements?status=drafts",
      icon: <IconMegaphone size={20} />,
      tone: "text-brand-600 dark:text-brand-300",
      surface: "bg-brand-50 dark:bg-brand-950/30",
    },
    {
      label: "Upcoming events needing attention",
      count: attention.upcomingEventsNeedingAttention,
      description: "Check publishing and Discord delivery",
      href: "/admin/events",
      icon: <IconCalendar size={20} />,
      tone: "text-brand-600 dark:text-brand-300",
      surface: "bg-brand-50 dark:bg-brand-950/30",
    },
    {
      label: "Failed Discord deliveries",
      count: attention.failedDiscordDeliveries,
      description: "Resolve failed content notifications",
      href: "/admin/announcements",
      icon: <IconBell size={20} />,
      tone: "text-red-600 dark:text-red-400",
      surface: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Missing group-photo banners",
      count: attention.missingGroupPhotoBanners,
      description: "Add banners to complete photo collections",
      href: "/admin/group-photos",
      icon: <IconCamera size={20} />,
      tone: "text-amber-600 dark:text-amber-400",
      surface: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Failed or unfinished releases",
      count: attention.unfinishedReleases,
      description: "Publish or repair release records",
      href: "/admin/updates",
      icon: <IconActivity size={20} />,
      tone: "text-red-600 dark:text-red-400",
      surface: "bg-red-50 dark:bg-red-950/30",
    },
  ];
  const attentionTotal = attentionItems.reduce((total, item) => total + item.count, 0);

  const overviewItems = [
    { label: "Staff", value: overview.staff, href: "/admin/staff", icon: <IconUsers size={22} />, description: "Team directory" },
    { label: "Events", value: overview.events, href: "/admin/events", icon: <IconCalendar size={22} />, description: "Community calendar" },
    { label: "Gallery", value: overview.gallery, href: "/admin/gallery", icon: <IconImages size={22} />, description: "Published media" },
    { label: "Submissions", value: overview.communitySubmissions, href: "/admin/community", icon: <IconShield size={22} />, description: "Community queue" },
    { label: "Announcements", value: overview.announcements, href: "/admin/announcements", icon: <IconMegaphone size={22} />, description: "News and updates" },
    { label: "Guides", value: overview.guides, href: "/admin/guides", icon: <IconBook size={22} />, description: "Help and FAQ" },
    { label: "Links", value: overview.links, href: "/admin/links", icon: <IconLink size={22} />, description: "Directory resources" },
    { label: "Updates", value: overview.updates, href: "/admin/updates", icon: <IconActivity size={22} />, description: "Release history" },
  ];

  const quickActions = [
    { label: "New announcement", href: "/admin/announcements/new", icon: <IconMegaphone size={18} /> },
    { label: "New event", href: "/admin/events/new", icon: <IconCalendar size={18} /> },
    { label: "Add staff", href: "/admin/staff/new", icon: <IconUsers size={18} /> },
    { label: "Review submissions", href: "/admin/community", icon: <IconShield size={18} /> },
    { label: "Add gallery image", href: "/admin/gallery/new", icon: <IconImages size={18} /> },
    { label: "New update", href: "/admin/updates/new", icon: <IconActivity size={18} /> },
    { label: "Add link", href: "/admin/links/new", icon: <IconLink size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-900 sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-100/60 dark:bg-brand-900/20" />
        <div className="relative">
          <p className="eyebrow">Admin control centre</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">{greeting()}, {userName}</h1>
          <p className="mt-2 max-w-2xl text-ink-500 dark:text-ink-300">
            {attentionTotal > 0 ? `You have ${attentionTotal} ${attentionTotal === 1 ? "item" : "items"} awaiting action across the community.` : "Everything is clear — the community is ready for your next move."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-ink-600 dark:bg-ink-800 dark:text-ink-300"><IconActivity size={15} /> Theme: <ThemeStatus /></span>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-ink-600 dark:bg-ink-800 dark:text-ink-300"><IconShield size={15} /> Release: {health.version}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-ink-600 dark:bg-ink-800 dark:text-ink-300"><IconClock size={15} /> Last release: {health.lastRelease ? formatDate(health.lastRelease, { month: "short", day: "numeric", year: "numeric" }) : "Not recorded"}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="needs-attention-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Priority queue</p>
            <h2 id="needs-attention-title" className="text-2xl font-bold text-ink-900 dark:text-white">Needs attention</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${attentionTotal ? "badge-warning" : "badge-success"}`}>{attentionTotal} open</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {attentionItems.map((item) => (
            <Link key={item.label} href={item.href} className={`group flex items-start gap-3 rounded-2xl border border-ink-200 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover dark:border-ink-800 ${item.surface}`}>
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.surface} ${item.tone}`}>{item.icon}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink-900 dark:text-white">{item.label}</span><span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{item.description}</span></span>
              <span className="flex shrink-0 flex-col items-end gap-1"><span className="rounded-full bg-white px-2 py-0.5 text-sm font-bold text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white">{item.count}</span><IconArrowRight size={15} className="text-ink-400 transition-transform group-hover:translate-x-0.5 dark:text-ink-500" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="site-overview-title">
        <div className="mb-4">
          <p className="eyebrow">Site overview</p>
          <h2 id="site-overview-title" className="text-2xl font-bold text-ink-900 dark:text-white">Content at a glance</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {overviewItems.map((item) => (
            <Link key={item.label} href={item.href} className="group flex items-start justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover dark:border-ink-800 dark:bg-ink-900">
              <span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">{item.icon}</span><span className="mt-3 block text-2xl font-extrabold text-ink-900 dark:text-white">{item.value}</span><span className="mt-0.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">{item.label}</span><span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{item.description}</span></span>
              <IconArrowRight size={16} className="mt-1 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500 dark:text-ink-600" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="card">
          <div className="card-header"><div><h3 className="card-title">Recent activity</h3><p className="card-subtitle">Moderation and reporting actions from your team</p></div><Link href="/admin/community" className="btn-ghost btn-sm">Open queue <IconArrowRight size={14} /></Link></div>
          <div className="card-body">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 px-6 py-12 text-center dark:border-ink-700"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-200"><IconActivity size={22} /></span><p className="font-semibold text-ink-900 dark:text-white">No recent activity</p><p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Moderation and report actions will appear here.</p></div>
            ) : (
              <div className="space-y-1">
                {activity.map((item) => (
                  <Link key={item.id} href={item.href} className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60">
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.type === "report" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300" : "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200"}`}>{item.type === "report" ? <IconFlag size={16} /> : <IconShield size={16} />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm text-ink-700 dark:text-ink-200"><strong className="font-semibold text-ink-900 dark:text-white">{item.actor}</strong> {item.action} <span className="text-ink-500 dark:text-ink-400">{item.target}</span></span><span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{relativeTime(item.at)}{item.detail ? ` · ${item.detail}` : ""}</span></span>
                    <IconArrowRight size={14} className="mt-1 shrink-0 text-ink-300 dark:text-ink-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header"><div><h3 className="card-title">Quick actions</h3><p className="card-subtitle">Start the work that matters</p></div></div>
            <div className="card-body grid gap-2 sm:grid-cols-2">
              {quickActions.map((item) => (<Link key={item.label} href={item.href} className="btn-secondary btn-sm justify-start"><span className="text-brand-600 dark:text-brand-300">{item.icon}</span>{item.label}</Link>))}
            </div>
          </div>

          <div className="card" id="health">
            <div className="card-header"><div><h3 className="card-title">System health</h3><p className="card-subtitle">Integrations and release status</p></div><span className={`badge ${statusTone(health.database.status)}`}><IconCheck size={13} /> {health.database.status}</span></div>
            <div className="card-body space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><IconShield size={16} /> Database</span><span className={`badge ${statusTone(health.database.status)}`}>{health.database.label}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><IconImages size={16} /> Storage / uploads</span><span className={`badge ${statusTone(health.storage.status)}`}>{health.storage.label}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><IconBell size={16} /> Discord webhook</span><span className={`badge ${statusTone(health.discord.status)}`}>{health.discord.label}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><IconActivity size={16} /> Deployed version</span><span className="font-semibold text-ink-900 dark:text-white">{health.version}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><IconClock size={16} /> Last successful release</span><span className="font-semibold text-ink-900 dark:text-white">{health.lastRelease ? formatDate(health.lastRelease, { month: "short", day: "numeric", year: "numeric" }) : "Not recorded"}</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end"><Link href="/" className="btn-secondary btn-sm"><IconExternal size={15} /> View live site</Link></div>
    </div>
  );
}

export default async function AdminDashboard() {
  const session = await requireAdmin();
  return (
    <AdminLayout>
      <Suspense fallback={<div className="space-y-6"><StatGridSkeleton /><ListSkeleton rows={6} /></div>}>
        <DashboardContent userName={session.name} />
      </Suspense>
    </AdminLayout>
  );
}
