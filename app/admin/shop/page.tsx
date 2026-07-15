import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { deleteShopDesign, updateShopDesignOrder } from "./actions";
import { SHOP_CATEGORIES } from "./categories";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { Badge, StatusPill } from "@/components/admin/ui/Badge";
import {
  IconTag,
  IconPlus,
  IconSearch,
  IconEdit,
  IconFilter,
  IconStar,
  IconEye,
  IconEyeOff,
} from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Shop Designs", robots: { index: false, follow: false } };

type Status = "all" | "published" | "hidden" | "featured";

export default async function AdminShopList({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const status = (searchParams.status as Status) || "all";
  const category = searchParams.category?.trim() || "";

  const where: any = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (status === "published") where.published = true;
  if (status === "hidden") where.published = false;
  if (status === "featured") where.featured = true;
  if (category) where.category = category;

  const [designs, categories, total, publishedCount, hiddenCount, featuredCount] = await Promise.all([
    prisma.shopDesign.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.shopDesign.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.shopDesign.count(),
    prisma.shopDesign.count({ where: { published: true } }),
    prisma.shopDesign.count({ where: { published: false } }),
    prisma.shopDesign.count({ where: { featured: true } }),
  ]);

  const usedCategories = Array.from(
    new Set([...SHOP_CATEGORIES, ...categories.map((c) => c.category as string).filter(Boolean)]),
  );

  const filters = new URLSearchParams();
  if (q) filters.set("q", q);
  if (category) filters.set("category", category);
  const statusHref = (s: Status) => {
    const f = new URLSearchParams();
    if (q) f.set("q", q);
    if (category) f.set("category", category);
    if (s !== "all") f.set("status", s);
    const qs = f.toString();
    return qs ? `/admin/shop?${qs}` : "/admin/shop";
  };

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Shop Designs" }]}
        title="Shop Designs"
        description="Manage upcoming clothing, outfit, and accessory designs. The shop is a showcase — no checkout yet."
        actions={
          <Link href="/admin/shop/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> New design
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="animate-fade-in">
          <StatCard label="Total designs" value={total} icon={<IconTag size={20} />} accent="brand" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Published" value={publishedCount} icon={<IconEye size={20} />} accent="emerald" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Hidden" value={hiddenCount} icon={<IconEyeOff size={20} />} accent="amber" />
        </div>
        <div className="animate-fade-in">
          <StatCard label="Featured" value={featuredCount} icon={<IconStar size={20} />} accent="brand" />
        </div>
      </section>

      <Card className="mt-5 animate-fade-in">
        <CardHeader title="Designs" subtitle="Upcoming shop showcase" icon={<IconTag size={18} />} />
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 md:flex-row md:items-end">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by name…" className="input pl-9" />
          </div>
          <select name="category" defaultValue={category} className="input md:w-48">
            <option value="">All categories</option>
            {usedCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary btn-sm">Filter</button>
          {(q || category || status !== "all") && (
            <Link href="/admin/shop" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-4 dark:border-ink-800">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 dark:text-ink-400">
            <IconFilter size={15} /> Status
          </span>
          {(["all", "published", "hidden", "featured"] as Status[]).map((s) => (
            <Link
              key={s}
              href={statusHref(s)}
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
                status === s
                  ? "bg-brand-600 text-white"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {designs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<IconTag size={28} />}
              title={q || category || status !== "all" ? "No designs match your filters" : "No shop designs yet"}
              description={
                q || category || status !== "all"
                  ? "Try adjusting your search or filters."
                  : "Add your first design to start building the shop showcase."
              }
              action={
                !q && !category && status === "all" ? (
                  <Link href="/admin/shop/new" className="btn-primary">
                    <IconPlus size={16} /> New design
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {designs.map((d) => (
              <li key={d.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-800">
                  <Image src={d.imageUrl} alt={d.imageAlt || d.name} width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{d.name}</p>
                    {d.creator && (
                      <p className="truncate text-xs text-ink-400">by {d.creator}</p>
                    )}
                    {d.featured && (
                      <Badge tone="brand">
                        <IconStar size={12} /> Featured
                      </Badge>
                    )}
                    <StatusPill tone={d.published ? "success" : "warning"}>
                      {d.published ? "Published" : "Hidden"}
                    </StatusPill>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                    {d.category && <Badge tone="neutral">{d.category}</Badge>}
                    <span>{d.galleryUrls.length} gallery image{d.galleryUrls.length === 1 ? "" : "s"}</span>
                  </div>
                </div>

                <form
                  action={updateShopDesignOrder.bind(null, d.id)}
                  className="flex items-center gap-2"
                >
                  <label className="text-xs font-medium text-ink-500 dark:text-ink-400">Order</label>
                  <input
                    name="order"
                    type="number"
                    defaultValue={d.sortOrder}
                    className="input w-20 py-1.5 text-sm"
                    aria-label={`Display order for ${d.name}`}
                  />
                  <button type="submit" className="btn-ghost btn-sm">Save</button>
                </form>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/shop/${d.id}`} className="btn-secondary btn-sm">
                    <IconEdit size={14} /> Edit
                  </Link>
                  <ConfirmDeleteButton
                    action={deleteShopDesign.bind(null, d.id)}
                    message={`Delete "${d.name}"? This cannot be undone.`}
                    className="btn-danger btn-sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
