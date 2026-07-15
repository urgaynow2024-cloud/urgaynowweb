import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { deleteGalleryImage, approveGalleryImage, rejectGalleryImage } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { Badge, StatusPill } from "@/components/admin/ui/Badge";
import {
  IconImages,
  IconPlus,
  IconSearch,
  IconEdit,
  IconCamera,
  IconUpload,
  IconCheck,
  IconX,
  IconClock,
} from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Media", robots: { index: false, follow: false } };

type StatusFilter = "all" | "pending" | "approved";

export default async function AdminGalleryList({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const status = (searchParams.status === "pending" || searchParams.status === "approved"
    ? searchParams.status
    : "all") as StatusFilter;

  const [allImages, groupPhotos, pendingGroups, pendingCount, approvedCount] = await Promise.all([
    prisma.galleryImage.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.groupPhoto.count({ where: { bannerUrl: "" } }),
    prisma.galleryImage.count({ where: { status: "PENDING" } }),
    prisma.galleryImage.count({ where: { status: "APPROVED" } }),
  ]);

  const images =
    status === "all"
      ? allImages
      : allImages.filter((g) => g.status === status.toUpperCase());

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: allImages.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
  ];

  const tabHref = (key: StatusFilter) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (key !== "all") params.set("status", key);
    const qs = params.toString();
    return `/admin/gallery${qs ? `?${qs}` : ""}`;
  };

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
        title="Media"
        description="Manage gallery images and group photos. Member submissions require moderator approval."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/group-photos" className="btn-secondary btn-sm">
              <IconCamera size={16} /> Group photos
            </Link>
            <Link href="/admin/gallery/new" className="btn-primary btn-sm">
              <IconPlus size={16} /> Add image
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="animate-fade-in">
          <StatCard label="Gallery images" value={allImages.length} icon={<IconImages size={20} />} accent="brand" hint="Standalone gallery uploads" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Pending review" value={pendingCount} icon={<IconClock size={20} />} accent="amber" hint="Member submissions awaiting approval" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Missing banners" value={pendingGroups} icon={<IconUpload size={20} />} accent="amber" hint="Group photos without banners" />
        </div>
      </section>

      <Card className="mt-5 animate-fade-in">
        <CardHeader
          title="Gallery images"
          subtitle="Standalone photos"
          icon={<IconImages size={18} />}
        />
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title…" className="input pl-9" form="gallery-search" />
          </div>
          <form id="gallery-search" method="get" className="hidden" />
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={tabHref(t.key)}
                className={`btn-sm ${status === t.key ? "btn-primary" : "btn-ghost"}`}
              >
                {t.label}
                <span className="ml-1 rounded-full bg-ink-500/15 px-1.5 text-[11px]">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<IconImages size={28} />}
              title={q ? "No images match your search" : status === "pending" ? "No pending submissions" : "No gallery images yet"}
              description={
                q
                  ? "Try a different search."
                  : status === "pending"
                    ? "Member submissions will appear here for review."
                    : "Add your first image to get started."
              }
              action={!q && status !== "pending" ? <Link href="/admin/gallery/new" className="btn-primary"><IconPlus size={16} /> Add image</Link> : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map((g) => {
              const isPending = g.status === "PENDING";
              return (
                <div key={g.id} className="card card-hover overflow-hidden">
                  <div className="group relative aspect-square">
                    <Image src={g.imageUrl} alt={g.title} fill className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/60 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                      <Link href={`/admin/gallery/${g.id}`} className="btn-secondary btn-sm">
                        <IconEdit size={14} /> Edit
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteGalleryImage.bind(null, g.id)}
                        message="Delete this image?"
                        className="btn-danger btn-sm"
                      />
                    </div>
                    {isPending && (
                      <div className="absolute left-2 top-2">
                        <StatusPill tone="warning">Pending</StatusPill>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{g.title}</p>
                    {g.submitterName && (
                      <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                        by {g.submitterName}
                      </p>
                    )}
                    {isPending && (
                      <div className="mt-3 flex items-center gap-2">
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-ink-100 p-4 dark:border-ink-800">
          <CardHeader
            title="Recent group photos"
            subtitle="Community moments"
            icon={<IconCamera size={18} />}
          />
          <Link href="/admin/group-photos" className="btn-ghost btn-sm">
            View all <IconEdit size={14} />
          </Link>
        </div>
        <div className="p-4">
          {groupPhotos.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">No group photos yet.</p>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupPhotos.map((g) => (
                  <div key={g.id} className="card overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
                      <Image src={g.bannerUrl || g.imageUrl} alt={g.title} fill className="h-full w-full object-cover" />
                    <div className="absolute left-2 top-2">
                      <Badge tone={g.bannerUrl ? "success" : "warning"}>
                        {g.bannerUrl ? "Ready" : "No banner"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{g.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
