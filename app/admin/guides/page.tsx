import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGuide } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconBook, IconPlus, IconSearch, IconEdit } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Guides & FAQ", robots: { index: false, follow: false } };

export default async function AdminGuidesList({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  let items: Awaited<ReturnType<typeof prisma.guide.findMany>> = [];
  try {
    items = await prisma.guide.findMany({
      where: {
        ...(q ? { question: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
    });
  } catch (e) {
    console.error("Failed to load guides:", e);
  }

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Guides & FAQ" }]}
        title="Guides & FAQ"
        description="Manage help articles and frequently asked questions."
        actions={
          <Link href="/admin/guides/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add guide
          </Link>
        }
      />

      <Card className="animate-fade-in">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by question…" className="input pl-9" />
          </div>
          {q && (
            <Link href="/admin/guides" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconBook size={28} />}
              title={q ? "No guides match your search" : "No guides yet"}
              description={q ? "Try a different search or clear the filters." : "Add your first FAQ to get started."}
              action={!q ? <Link href="/admin/guides/new" className="btn-primary"><IconPlus size={16} /> Add guide</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Question</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((g) => (
                  <tr key={g.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <span className="font-medium text-ink-900 dark:text-white">{g.question}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral">{g.category || "General"}</Badge>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-400 md:table-cell">{g.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/guides/${g.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteGuide.bind(null, g.id)}
                          message="Delete this guide?"
                          label="Delete"
                          className="btn-danger btn-sm"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
