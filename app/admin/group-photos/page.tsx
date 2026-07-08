import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { GroupPhotoManager, type GroupPhotoItem } from "@/components/admin/GroupPhotoManager";
import { IconCamera, IconPlus } from "@/components/admin/ui/icons";

export const metadata = { title: "Group Photos", robots: { index: false, follow: false } };

export default async function AdminGroupPhotosList() {
  let items: GroupPhotoItem[] = [];
  let error: string | null = null;

  try {
    const rows = await prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" } });
    items = rows.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      bannerUrl: g.bannerUrl,
      rules: g.rules,
      createdAt: g.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error("Failed to fetch group photos:", e);
    error = "We couldn't load your group photos. Please try again or contact support if the problem persists.";
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Group Photos" }]}
        title="Group Photos"
        description="A media library of every group and team photo. Drag, drop, search and manage in one place."
        actions={
          <Link href="/admin/group-photos/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Upload photo
          </Link>
        }
      />

      {error ? (
        <div className="card flex items-start gap-4 border-red-200 p-6 dark:border-red-900/60">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
            <IconCamera size={20} />
          </span>
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-white">Something went wrong</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{error}</p>
          </div>
        </div>
      ) : (
        <GroupPhotoManager items={items} />
      )}
    </div>
  );
}
