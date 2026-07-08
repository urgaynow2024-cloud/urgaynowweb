import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGalleryImage } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconImages, IconPlus, IconSearch, IconEdit } from "@/components/admin/ui/icons";

export const metadata = { title: "Gallery", robots: { index: false, follow: false } };

export default async function AdminGalleryList({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  const items = await prisma.galleryImage.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Gallery" }]}
        title="Gallery"
        description="Manage image uploads."
        actions={
          <Link href="/admin/gallery/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add image
          </Link>
        }
      />

      <Card className="animate-fade-in">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title…" className="input pl-9" />
          </div>
          {q && (
            <Link href="/admin/gallery" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {items.length === 0 ? (
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
            {items.map((g) => (
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
    </div>
  );
}
