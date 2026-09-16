import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteUpdate, retryUpdateWebhook } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconMegaphone, IconPlus, IconSearch, IconEdit, IconTrash, IconRefresh } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { Suspense } from "react";

export const metadata = { title: "Updates", robots: { index: false, follow: false } };

const typeTone: Record<string, "danger" | "brand" | "neutral"> = {
  MAJOR: "danger",
  MINOR: "brand",
  PATCH: "neutral",
};

export default async function AdminUpdatesList({
  searchParams,
}: {
  searchParams: { q?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";

  let items: Awaited<ReturnType<typeof prisma.update.findMany>> = [];
  try {
    items = await prisma.update.findMany({
      ...(q
        ? {
            where: {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { version: { contains: q, mode: "insensitive" } },
              ],
            },
          }
        : {}),
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.error("Failed to load updates:", e);
  }

  return (
    <AdminLayout>
      <Suspense fallback={null}>
        <ErrorAnnouncer />
      </Suspense>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Updates" }]}
        title="Updates & changelog"
        description="Manage website releases and the public changelog."
        actions={
          <Link href="/admin/updates/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> New update
          </Link>
        }
      />

      <Card className="animate-fade-in overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title, version, or summary…" className="input pl-9" />
          </div>
          {q && <Link href="/admin/updates" className="btn-ghost btn-sm">Clear</Link>}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — please check the form and try again.
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconMegaphone size={28} />}
              title={q ? "No updates match your search" : "No updates yet"}
              description={q ? "Try a different search." : "Create your first changelog entry to get started."}
              action={!q ? <Link href="/admin/updates/new" className="btn-primary"><IconPlus size={16} /> New update</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Published</th>
                  <th className="px-5 py-3">Discord</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/40">
                    <td className="px-5 py-3 font-mono text-ink-900 dark:text-white">{u.version}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink-900 dark:text-white">{u.title}</div>
                      {u.summary && <div className="text-xs text-ink-400 line-clamp-1">{u.summary}</div>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={typeTone[u.type] ?? "neutral"}>{u.type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">
                      {u.publishedAt ? u.publishedAt.toLocaleDateString("en-GB") : "Draft"}
                    </td>
                    <td className="px-5 py-3">
                      {u.discordPostStatus === "sent" ? (
                        <Badge tone="success">Sent</Badge>
                      ) : u.discordPostStatus === "failed" ? (
                        <Badge tone="danger">Failed</Badge>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {u.discordPostStatus === "failed" && (
                          <form action={retryUpdateWebhook.bind(null, u.id)}>
                            <button type="submit" className="btn-ghost btn-sm" title="Retry Discord post">
                              <IconRefresh size={14} /> Retry
                            </button>
                          </form>
                        )}
                        <Link href={`/admin/updates/${u.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={() => deleteUpdate(u.id)}
                          message={`Delete "${u.title}" (v${u.version})? This cannot be undone.`}
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