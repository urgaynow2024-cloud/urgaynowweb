import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { approveGalleryImage, rejectGalleryImage } from "@/app/admin/gallery/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import { ListSkeleton } from "@/components/Skeleton";
import {
  IconShield,
  IconCamera,
  IconArrowRight,
  IconImages,
  IconCheck,
  IconX,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Moderation", robots: { index: false, follow: false } };

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

async function ModerationContent() {
  const [totalPhotos, groupPhotos, bannersCount, pendingGallery, pendingGalleryCount] =
    await Promise.all([
      prisma.groupPhoto.count(),
      prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.groupPhoto.count({ where: { bannerUrl: { not: "" } } }),
      prisma.galleryImage.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.galleryImage.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    { label: "Total group photos", value: totalPhotos, icon: <IconCamera size={20} />, accent: "brand" as const, hint: "All submitted photos" },
    { label: "Banners set", value: bannersCount, icon: <IconShield size={20} />, accent: "emerald" as const, hint: "Photos with custom banner" },
    { label: "Pending gallery", value: pendingGalleryCount, icon: <IconImages size={20} />, accent: "amber" as const, hint: "Member photos awaiting review" },
  ];

  return (
    <>
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
            title="Pending gallery submissions"
            subtitle="Member photos waiting for moderator approval"
            icon={<IconImages size={18} />}
            actions={
              <Link href="/admin/gallery?status=pending" className="btn-ghost btn-sm">
                View all <IconArrowRight size={14} />
              </Link>
            }
          />
          <CardBody className="p-0">
            {pendingGallery.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconImages size={26} />}
                  title="No submissions to review"
                  description="When members submit photos, they'll appear here for approval."
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {pendingGallery.map((g, i) => (
                  <li key={g.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <Image
                      src={g.imageUrl}
                      alt=""
                      width={56}
                      height={40}
                      priority={i === 0}
                      sizes="56px"
                      className="h-10 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{g.title}</p>
                      <p className="text-xs text-ink-400">
                        {g.submitterName ? `${g.submitterName} · ` : ""}
                        {relativeTime(g.createdAt)}
                      </p>
                    </div>
                    <StatusPill tone="warning">Pending</StatusPill>
                    <div className="flex items-center gap-2">
                      <form action={approveGalleryImage.bind(null, g.id)}>
                        <button type="submit" className="btn-success btn-sm">
                          <IconCheck size={14} /> Approve
                        </button>
                      </form>
                      <form action={rejectGalleryImage.bind(null, g.id)}>
                        <button type="submit" className="btn-danger btn-sm">
                          <IconX size={14} /> Reject
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title="Recent group photos"
            subtitle="Everything is considered ready by default"
            icon={<IconShield size={18} />}
          />
          <CardBody className="p-0">
            {groupPhotos.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconCamera size={26} />}
                  title="No group photos to review"
                  description="When members upload group photos, they'll appear here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {groupPhotos.map((g, i) => {
                  return (
                    <li key={g.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                      <Image
                        src={g.bannerUrl || g.imageUrl}
                        alt=""
                        width={56}
                        height={40}
                        priority={i === 0}
                        sizes="56px"
                        className="h-10 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{g.title}</p>
                        <p className="text-xs text-ink-400">{relativeTime(g.createdAt)}</p>
                      </div>
                      <span className={`badge ${g.bannerUrl ? "badge-success" : "badge-warning"}`}>
                        {g.bannerUrl ? "Has banner" : "No banner"}
                      </span>
                      <Link href={`/admin/group-photos/${g.id}`} className="btn-ghost btn-sm">
                        Edit <IconArrowRight size={14} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </>
  );
}

export default function ModerationPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Moderation" }]}
        title="Moderation"
        description="Review member photo submissions and group photos."
      />

      <Suspense fallback={<ListSkeleton rows={12} />}>
        <ModerationContent />
      </Suspense>
    </div>
  );
}
