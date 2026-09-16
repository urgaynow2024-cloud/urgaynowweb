import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { StatusPill } from "@/components/admin/ui/Badge";
import {
  IconImages,
  IconArrowRight,
  IconEye,
  IconCheck,
} from "@/components/admin/ui/icons";

const TYPE_LABELS: Record<string, string> = {
  ARTWORK: "Artwork",
  AVATAR: "Avatar",
  SCREENSHOT: "Screenshot",
  PHOTOGRAPHY: "Photography",
  VRCHAT_WORLD: "VRChat World",
  CREATOR_PROJECT: "Creator Project",
  OTHER: "Other",
};

export async function CommunityPendingQueue() {
  const pending = await prisma.communitySubmission.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (pending.length === 0) {
    return (
      <div className="mt-5">
        <div className="card p-6">
          <EmptyState
            icon={<IconImages size={26} />}
            title="No pending community submissions"
            description="Member submissions appear here for review once they are submitted."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 p-4 dark:border-ink-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
              <IconImages size={18} />
            </span>
            <div>
              <h3 className="card-title">Needs review</h3>
              <p className="card-subtitle">Member submissions awaiting approval</p>
            </div>
          </div>
          <Link href="/admin/community" className="btn-ghost btn-sm">
            Manage all <IconArrowRight size={14} />
          </Link>
        </div>
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
                </p>
              </div>
              <StatusPill tone="warning">Pending</StatusPill>
              <div className="flex items-center gap-2">
                <Link href={`/community/${s.id}`} className="btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">
                  <IconEye size={14} /> Preview
                </Link>
                <Link href="/admin/community" className="btn-success btn-sm">
                  <IconCheck size={14} /> Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}