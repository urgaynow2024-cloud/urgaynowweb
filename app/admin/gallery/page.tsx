import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGalleryImage } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { IconImages, IconPlus, IconSearch, IconEdit, IconCamera, IconUpload } from "@/components/admin/ui/icons";

export const metadata = { title: "Media", robots: { index: false, follow: false } };

export default async function AdminGalleryList({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  const [images, groupPhotos, pendingGroups] = await Promise.all([
    prisma.galleryImage.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.groupPhoto.count({ where: { bannerUrl: "" } }),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
        title="Media"
        description="Manage gallery images and group photos. Uploads and banners are optional."
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
          <StatCard label="Gallery images" value={images.length} icon={<IconImages size={20} />} accent="brand" hint="Standalone gallery uploads" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Group photos" value={groupPhotos.length} icon={<IconCamera size={20} />} accent="emerald" hint="Community moments with optional banners" />
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
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title…" className="input pl-9" />
          </div>
          {q && (
            <Link href="/admin/gallery" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {images.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<IconImages size={28} />}
              title={q ? "No images match your search" : "No gallery images yet"}
              description={q ? "Try a different search." : "Add your first image to get started."}
              action={!q ? <Link href="/admin/gallery/new" className="btn-primary"><IconPlus size={16} /> Add image</Link> : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map((g) => (
              <div key={g.id} className="card card-hover overflow-hidden">
                <div className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={g.title} className="h-full w-full object-cover" />
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
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{g.title}</p>
                </div>
              </div>
            ))}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.bannerUrl || g.imageUrl} alt={g.title} className="h-full w-full object-cover" />
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
    </div>
  );
}
