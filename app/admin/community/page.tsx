import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import {
  approveCommunitySubmission,
  rejectCommunitySubmission,
  requestChangesCommunitySubmission,
  unpublishCommunitySubmission,
  republishCommunitySubmission,
  deleteCommunitySubmission,
} from "@/app/admin/community/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import { ListSkeleton } from "@/components/Skeleton";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import {
  IconImages,
  IconCheck,
  IconX,
  IconArrowRight,
  IconClock,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Community", robots: { index: false, follow: false } };
export const revalidate = 60;

const TYPE_LABELS: Record<string, string> = {
  ARTWORK: "Artwork",
  AVATAR: "Avatar",
  SCREENSHOT: "Screenshot",
  PHOTOGRAPHY: "Photography",
  VRCHAT_WORLD: "VRChat World",
  CREATOR_PROJECT: "Creator Project",
  OTHER: "Other",
};

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

async function CommunityContent() {
  const [pending, approved, unpublished, rejected, total] = await Promise.all([
    prisma.communitySubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.communitySubmission.count({ where: { status: "APPROVED", published: true } }),
    prisma.communitySubmission.count({ where: { status: "APPROVED", published: false } }),
    prisma.communitySubmission.count({ where: { status: "REJECTED" } }),
    prisma.communitySubmission.count(),
  ]);

  const stats = [
    { label: "Needs review", value: pending.length, icon: <IconClock size={20} />, accent: "amber" as const, hint: "Pending submissions" },
    { label: "Published", value: approved, icon: <IconEye size={20} />, accent: "emerald" as const, hint: "Live on the gallery" },
    { label: "Unpublished", value: unpublished, icon: <IconEyeOff size={20} />, accent: "blue" as const, hint: "Approved but hidden" },
    { label: "Rejected", value: rejected, icon: <IconX size={20} />, accent: "red" as const, hint: "Not published" },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
            <StatCard label={s.label} value={s.value} icon={s.icon} accent={s.accent} hint={s.hint} />
          </div>
        ))}
      </section>

      <section className="mt-5">
        <Card className="animate-fade-in">
          <CardHeader
            title="Needs review"
            subtitle="Member submissions awaiting moderator approval"
            icon={<IconImages size={18} />}
            actions={
              <Link href="/admin/gallery?status=pending" className="btn-ghost btn-sm">
                View gallery queue <IconArrowRight size={14} />
              </Link>
            }
          />
          <CardBody className="p-0">
            {pending.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<IconImages size={26} />}
                  title="No submissions to review"
                  description="When members submit photos, they will appear here for approval."
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {pending.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <Image
                      src={s.imageUrl}
                      alt=""
                      width={56}
                      height={40}
                      priority={i === 0}
                      sizes="56px"
                      className="h-10 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{s.title}</p>
                      <p className="text-xs text-ink-400">
                        {TYPE_LABELS[s.type] ?? s.type}
                        {s.submitterName ? ` · ${s.submitterName}` : ""}
                        {" · "}{relativeTime(s.createdAt)}
                      </p>
                    </div>
                    <StatusPill tone="warning">Pending</StatusPill>
                    <div className="flex items-center gap-2">
                      <Link href={`/community/${s.id}`} className="btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">
                        <IconEye size={14} /> Preview
                      </Link>
                      <form action={approveCommunitySubmission.bind(null, s.id)}>
                        <input type="hidden" name="note" value="" />
                        <button type="submit" className="btn-success btn-sm">
                          <IconCheck size={14} /> Approve
                        </button>
                      </form>
                      <form action={rejectCommunitySubmission.bind(null, s.id)}>
                        <input type="hidden" name="reason" value="" />
                        <input type="hidden" name="note" value="" />
                        <button type="submit" className="btn-danger btn-sm">
                          <IconX size={14} /> Reject
                        </button>
                      </form>
                      <form action={requestChangesCommunitySubmission.bind(null, s.id)}>
                        <input type="hidden" name="note" value="" />
                        <button type="submit" className="btn-ghost btn-sm">
                          Request changes
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
    </>
  );
}

export default function CommunityPage() {
  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Community" }]}
        title="Community submissions"
        description="Review member submissions and publish them to the public gallery."
        actions={
          <Link href="/community/submit" className="btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
            <IconImages size={16} /> Public submission form
          </Link>
        }
      />

      <Suspense fallback={<ListSkeleton rows={14} />}>
        <CommunityContent />
      </Suspense>
    </AdminLayout>
  );
}