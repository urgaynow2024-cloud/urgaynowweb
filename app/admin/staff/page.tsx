import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  deleteStaff,
  duplicateStaff,
  moveStaff,
} from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Avatar, EmptyState } from "@/components/admin/ui/Avatar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconEdit,
  IconFilter,
  IconGrid,
  IconCalendar,
  IconShield,
  IconActivity,
  IconClock,
  IconChevronUp,
  IconChevronDown,
  IconCopy,
} from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { normalizeRoleKey, STAFF_ROLES, type RoleDefinition, getRoleDefinition } from "@/lib/roles";
import { RoleBadge } from "@/components/RoleBadge";
import { formatDate } from "@/lib/utils";

const dotTone: Record<string, string> = {
  neutral: "bg-ink-400",
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export const metadata = { title: "Staff", robots: { index: false, follow: false } };

type StaffAdminEntry = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

function listHref(query: { q?: string; rank?: string; view?: string }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.rank) params.set("rank", query.rank);
  if (query.view && query.view !== "list") params.set("view", query.view);
  const search = params.toString();
  return search ? `/admin/staff?${search}` : "/admin/staff";
}

function roleKeys(category: RoleDefinition["summaryCategory"]) {
  return new Set(STAFF_ROLES.filter((role) => role.summaryCategory === category).map((role) => role.key));
}

function errorMessage(error: string | undefined) {
  if (error === "duplicate") return "Could not save — that VRChat username is already in use. Try a different one.";
  if (error === "validation") return "Could not save — check the required fields, URL formats, and character limits.";
  if (error) return "Could not save — something went wrong. Please try again.";
  return null;
}

export default async function AdminStaffList({
  searchParams,
}: {
  searchParams: { q?: string; rank?: string; view?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const rank = searchParams.rank?.trim() || "";
  const view = searchParams.view === "cards" ? "cards" : "list";
  const where: Prisma.StaffWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { vrchatUsername: { contains: q, mode: "insensitive" } },
            { rank: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(rank ? { rank } : {}),
  };

  const [staff, allStaff] = await Promise.all([
    prisma.staff.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.staff.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  const ranks = Array.from(new Set(allStaff.map((s) => s.rank).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const leadershipKeys = roleKeys("leadership");
  const moderationKeys = roleKeys("moderation");
  const eventCommunityKeys = new Set([...roleKeys("event"), ...roleKeys("community")]);
  const recentlyAdded = allStaff.filter((s) => s.createdAt.getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = {
    total: allStaff.length,
    leadership: allStaff.filter((s) => leadershipKeys.has(normalizeRoleKey(s.rank))).length,
    moderation: allStaff.filter((s) => moderationKeys.has(normalizeRoleKey(s.rank))).length,
    eventCommunity: allStaff.filter((s) => eventCommunityKeys.has(normalizeRoleKey(s.rank))).length,
    recent: recentlyAdded.length,
  };

  // Group staff by rank for display, ordered by role hierarchy
  const roleOrder = new Map(STAFF_ROLES.map((role, index) => [role.key, index]));
  const groups = Array.from(
    staff.reduce((acc, person) => {
      const key = normalizeRoleKey(person.rank);
      const current = acc.get(key) ?? { rank: person.rank, members: [] };
      current.members.push(person);
      acc.set(key, current);
      return acc;
    }, new Map<string, { rank: string; members: StaffAdminEntry[] }>()),
  ).sort(([a], [b]) => {
    const aOrder = roleOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = roleOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Staff" }]}
        title="Staff management"
        description="Build the public team directory, keep profiles current, and control how members are ordered."
        actions={
          <Link href="/admin/staff/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add staff
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard title="Total staff" value={stats.total} icon={<IconUsers size={22} />} description="Profiles in the directory" />
        <AdminStatCard title="Founders / owners" value={stats.leadership} icon={<IconShield size={22} />} description="Configured leadership roles" />
        <AdminStatCard title="Moderation roles" value={stats.moderation} icon={<IconActivity size={22} />} description="Configured moderation roles" />
        <AdminStatCard title="Event / community" value={stats.eventCommunity} icon={<IconCalendar size={22} />} description="Configured community roles" />
        <AdminStatCard title="Recently added" value={stats.recent} icon={<IconClock size={22} />} description={recentlyAdded.length ? `Last 30 days · ${recentlyAdded.slice(0, 2).map((s) => s.name).join(", ")}${recentlyAdded.length > 2 ? "…" : ""}` : "No new profiles in 30 days"} />
      </div>

      <Card className="mt-6 overflow-visible">
        <form method="get" action="/admin/staff" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <input type="hidden" name="view" value={view} />
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by name, username, rank, or bio…" className="input pl-9" aria-label="Search staff" />
          </div>
          <div className="relative sm:w-52">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="rank" defaultValue={rank} className="select pl-9 pr-9" aria-label="Filter by rank">
              <option value="">All ranks</option>
              {ranks.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-secondary btn-sm sm:self-stretch">Apply</button>
          {(q || rank) && <Link href={listHref({ view })} className="btn-ghost btn-sm sm:self-stretch">Clear</Link>}
        </form>

        {(q || rank) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3 text-sm dark:border-ink-800">
            <span className="text-ink-500 dark:text-ink-400">Active filters:</span>
            {q && <Link href={listHref({ rank, view })} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200">Search: {q}</Link>}
            {rank && <Link href={listHref({ q, view })} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200">Rank: {rank}</Link>}
          </div>
        )}

        {errorMessage(searchParams.error) && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage(searchParams.error)}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3 dark:border-ink-800">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {staff.length} {staff.length === 1 ? "profile" : "profiles"}{q || rank ? " found" : ""}
          </p>
          <div className="inline-flex rounded-xl border border-ink-200 bg-ink-50 p-1 dark:border-ink-800 dark:bg-ink-800/60" aria-label="Staff view">
            <Link href={listHref({ q, rank, view: "list" })} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${view === "list" ? "bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white" : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white"}`}>
              <IconGrid size={14} /> List
            </Link>
            <Link href={listHref({ q, rank, view: "cards" })} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${view === "cards" ? "bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white" : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white"}`}>
              <IconUsers size={14} /> Cards
            </Link>
          </div>
        </div>

        {staff.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconUsers size={28} />}
              title={q || rank ? "No staff match your search" : "No staff yet"}
              description={q || rank ? "Try a different search or clear the filters." : "Add your first team member to get started."}
              action={!q && !rank ? <Link href="/admin/staff/new" className="btn-primary"><IconPlus size={16} /> Add staff</Link> : undefined}
            />
          </div>
        ) : view === "cards" ? (
          <div className="space-y-8 p-4">
            {groups.map(([groupRank, group], groupIndex) => {
              const def = getRoleDefinition(groupRank);
              return (
                <section key={groupRank}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotTone[def.tone ?? "neutral"] }} />
                      <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{group.rank}</h3>
                    </div>
                    <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                      {group.members.length} {group.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.members.map((s, index) => <AdminStaffCard key={s.id} staff={s} first={index === 0} last={index === group.members.length - 1} />)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm" role="grid">
              <thead className="hidden lg:table-header-group sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold" scope="col">Member</th>
                  <th className="px-5 py-3 font-semibold" scope="col">VRChat</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Rank</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Bio</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Order</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Updated</th>
                  <th className="px-5 py-3 text-right font-semibold" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {groups.map(([groupRank, group], groupIndex) => (
                  <>
                    <tr className="bg-ink-50/50 dark:bg-ink-800/50 lg:hidden">
                      <td colSpan={7} className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotTone[getRoleDefinition(groupRank).tone ?? "neutral"] }} />
                          <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">{group.rank}</span>
                          <span className="text-xs text-ink-400 dark:text-ink-500">({group.members.length})</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="lg:hidden">
                      <td colSpan={7} className="px-5 py-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {group.members.map((s, index) => (
                            <AdminStaffMobileCard key={s.id} staff={s} first={index === 0} last={index === group.members.length - 1} />
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr className="lg:table-row hidden bg-ink-50/50 dark:bg-ink-800/50">
                      <td colSpan={7} className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotTone[getRoleDefinition(groupRank).tone ?? "neutral"] }} />
                          <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">{group.rank}</span>
                          <span className="text-xs text-ink-400 dark:text-ink-500">({group.members.length})</span>
                        </div>
                      </td>
                    </tr>
                    {group.members.map((s, index) => <AdminStaffRow key={s.id} staff={s} first={index === 0} last={index === group.members.length - 1} />)}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

function ReorderButtons({ id, first = false, last = false }: { id: string; first?: boolean; last?: boolean }) {
  return (
    <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-800/60" aria-label="Reorder staff member">
      <form action={moveStaff.bind(null, id, "up")}>
        <button type="submit" disabled={first} className="btn-icon !h-8 !w-8 rounded-none rounded-l-lg disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move up" title="Move up">
          <IconChevronUp size={15} />
        </button>
      </form>
      <form action={moveStaff.bind(null, id, "down")}>
        <button type="submit" disabled={last} className="btn-icon !h-8 !w-8 rounded-none rounded-r-lg disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move down" title="Move down">
          <IconChevronDown size={15} />
        </button>
      </form>
    </div>
  );
}

function StaffActions({ staff, first = false, last = false }: { staff: StaffAdminEntry; first?: boolean; last?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ReorderButtons id={staff.id} first={first} last={last} />
      <form action={duplicateStaff.bind(null, staff.id)}>
        <button type="submit" className="btn-icon hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/40" aria-label={`Duplicate ${staff.name}`} title="Duplicate">
          <IconCopy size={15} />
        </button>
      </form>
      <Link href={`/admin/staff/${staff.id}`} className="btn-secondary btn-sm">
        <IconEdit size={14} /> <span className="hidden sm:inline">Edit</span>
      </Link>
      <ConfirmDeleteButton
        action={deleteStaff.bind(null, staff.id)}
        message={`Delete ${staff.name}? This cannot be undone.`}
        label="Delete"
        className="btn-danger btn-sm"
      />
    </div>
  );
}

function AdminStaffRow({ staff, first, last }: { staff: StaffAdminEntry; first: boolean; last: boolean }) {
  return (
    <tr className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar src={staff.photoUrl} name={staff.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-medium text-ink-900 dark:text-white">{staff.name}</div>
            <div className="truncate text-xs text-ink-500 dark:text-ink-400 sm:hidden">@{staff.vrchatUsername}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-ink-500">@{staff.vrchatUsername}</td>
      <td className="hidden px-5 py-3 sm:table-cell"><RoleBadge role={normalizeRoleKey(staff.rank)} /></td>
      <td className="hidden max-w-xs px-5 py-3 lg:table-cell"><p className="truncate text-ink-500 dark:text-ink-400">{staff.bio || "—"}</p></td>
      <td className="hidden px-5 py-3 text-ink-400 md:table-cell">{staff.sortOrder}</td>
      <td className="hidden px-5 py-3 text-ink-500 lg:table-cell">{formatDate(staff.updatedAt, { month: "short", day: "numeric", year: "numeric" })}</td>
      <td className="px-5 py-3"><StaffActions staff={staff} first={first} last={last} /></td>
    </tr>
  );
}

function AdminStaffCard({ staff, first, last }: { staff: StaffAdminEntry; first: boolean; last: boolean }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={staff.photoUrl} name={staff.name} size="md" />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink-900 dark:text-white">{staff.name}</h3>
            <p className="truncate text-sm text-ink-500 dark:text-ink-400">@{staff.vrchatUsername}</p>
          </div>
        </div>
        <RoleBadge role={normalizeRoleKey(staff.rank)} />
      </div>
      <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm text-ink-500 dark:text-ink-400">{staff.bio || "No bio added yet."}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-100 pt-4 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
        <span>Order {staff.sortOrder}</span>
        <span>Updated {formatDate(staff.updatedAt, { month: "short", day: "numeric" })}</span>
      </div>
      <div className="mt-4"><StaffActions staff={staff} first={first} last={last} /></div>
    </article>
  );
}

function AdminStaffMobileCard({ staff, first, last }: { staff: StaffAdminEntry; first: boolean; last: boolean }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={staff.photoUrl} name={staff.name} size="sm" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900 dark:text-white">{staff.name}</h3>
            <p className="truncate text-xs text-ink-500 dark:text-ink-400">@{staff.vrchatUsername}</p>
          </div>
        </div>
        <RoleBadge role={normalizeRoleKey(staff.rank)} size="sm" />
      </div>
      <p className="mt-3 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{staff.bio || "No bio added yet."}</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-[10px] text-ink-500 dark:border-ink-800 dark:text-ink-400">
        <span>Order {staff.sortOrder}</span>
        <span>Updated {formatDate(staff.updatedAt, { month: "short", day: "numeric" })}</span>
      </div>
      <div className="mt-3"><StaffActions staff={staff} first={first} last={last} /></div>
    </article>
  );
}
