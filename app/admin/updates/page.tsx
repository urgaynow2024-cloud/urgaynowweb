import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteUpdate, retryUpdateWebhook } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconMegaphone, IconPlus, IconSearch, IconEdit, IconTrash, IconRefresh, IconFilter } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { Suspense } from "react";

export const metadata = { title: "Updates", robots: { index: false, follow: false } };

const typeTone: Record<string, "danger" | "brand" | "neutral"> = {
  MAJOR: "danger",
  MINOR: "brand",
  PATCH: "neutral",
};

const statusTone: Record<string, "success" | "danger" | "neutral" | "brand"> = {
  PUBLISHED: "success",
  DRAFT: "neutral",
  FAILED: "danger",
};

export default async function AdminUpdatesList({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; source?: string; status?: string; discord?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const typeFilter = searchParams.type?.trim() || "";
  const sourceFilter = searchParams.source?.trim() || "";
  const statusFilter = searchParams.status?.trim() || "";
  const discordFilter = searchParams.discord?.trim() || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { version: { contains: q, mode: "insensitive" } },
    ];
  }
  if (typeFilter) where.type = typeFilter;
  if (sourceFilter) where.generatedAutomatically = sourceFilter === "auto";
  if (statusFilter) where.releaseStatus = statusFilter;
  if (discordFilter) where.discordPostStatus = discordFilter;

  let items: Awaited<ReturnType<typeof prisma.update.findMany>> = [];
  try {
    items = await prisma.update.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.error("Failed to load updates:", e);
  }

  const hasFilters = q || typeFilter || sourceFilter || statusFilter || discordFilter;

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
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title, version, or summary…" className="input pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select name="type" className="select min-w-[140px]">
              <option value="">All types</option>
              <option value="MAJOR" selected={typeFilter === "MAJOR"}>Major</option>
              <option value="MINOR" selected={typeFilter === "MINOR"}>Minor</option>
              <option value="PATCH" selected={typeFilter === "PATCH"}>Patch</option>
            </select>
            <select name="source" className="select min-w-[140px]">
              <option value="">All sources</option>
              <option value="auto" selected={sourceFilter === "auto"}>Automatic</option>
              <option value="manual" selected={sourceFilter === "manual"}>Manual</option>
            </select>
            <select name="status" className="select min-w-[140px]">
              <option value="">All statuses</option>
              <option value="PUBLISHED" selected={statusFilter === "PUBLISHED"}>Published</option>
              <option value="DRAFT" selected={statusFilter === "DRAFT"}>Draft</option>
              <option value="FAILED" selected={statusFilter === "FAILED"}>Failed</option>
            </select>
            <select name="discord" className="select min-w-[140px]">
              <option value="">Discord status</option>
              <option value="sent" selected={discordFilter === "sent"}>Sent</option>
              <option value="failed" selected={discordFilter === "failed"}>Failed</option>
              <option value="pending" selected={discordFilter === "pending"}>Pending</option>
            </select>
            {hasFilters && <Link href="/admin/updates" className="btn-ghost btn-sm"><IconFilter size={14} className="mr-1" /> Clear</Link>}
          </div>
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
              description={q ? "Try a different search or filter." : "Create your first changelog entry to get started."}
              action={!q && !hasFilters ? <Link href="/admin/updates/new" className="btn-primary"><IconPlus size={16} /> New update</Link> : undefined}
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
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
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
                      {u.generatedAutomatically && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          Auto-generated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={typeTone[u.type] ?? "neutral"}>{u.type}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {u.generatedAutomatically ? (
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">Automatic</span>
                      ) : (
                        <span className="text-xs text-ink-500 dark:text-ink-400">Manual</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone[u.releaseStatus] ?? "neutral"}>{u.releaseStatus}</Badge>
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