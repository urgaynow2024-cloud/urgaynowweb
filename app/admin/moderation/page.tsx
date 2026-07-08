import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { StatusPill } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import {
  IconShield,
  IconFlag,
  IconCamera,
  IconArrowRight,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Moderation", robots: { index: false, follow: false } };

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

export default async function ModerationPage() {
  const [totalPhotos, pending, groupPhotos] = await Promise.all([
    prisma.groupPhoto.count(),
    prisma.groupPhoto.count({ where: { OR: [{ bannerUrl: "" }, { rules: "" }] } }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  const reviewed = totalPhotos - pending;

  const stats = [
    { label: "Total group photos", value: totalPhotos, icon: <IconCamera size={20} />, accent: "brand" as const, hint: "All submitted photos" },
    { label: "Pending review", value: pending, icon: <IconFlag size={20} />, accent: "red" as const, hint: "Missing banner or rules" },
    { label: "Reviewed", value: reviewed, icon: <IconShield size={20} />, accent: "emerald" as const, hint: "Complete and ready" },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Moderation" }]}
        title="Moderation"
        description="Review group photos and content that need attention."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} hint={s.hint} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title="Moderation queue"
            subtitle="Group photos ordered by most recent"
            icon={<IconShield size={18} />}
            actions={pending > 0 ? <StatusPill tone="warning">{pending} pending</StatusPill> : <StatusPill tone="success">All clear</StatusPill>}
          />
          <CardBody className="p-0">
            {groupPhotos.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconCamera size={26} />}
                  title="No group photos to review"
                  description="When members upload group photos, they'll appear here for moderation."
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {groupPhotos.map((g) => {
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
