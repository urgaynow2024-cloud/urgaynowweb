"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconSearch, IconX, IconFilter } from "@/components/admin/ui/icons";

type Props = {
  q: string;
  type: string;
  sort: "new" | "old";
  types: string[];
  resultCount: number;
  basePath: string;
};

export function GalleryToolbar({ q, type, sort, types, resultCount, basePath }: Props) {
  const [search, setSearch] = useState(q);

  const qs = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };

  const hasFilters = Boolean(q || type || sort !== "new");

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gallery…"
          className="input pl-10"
          aria-label="Search gallery"
        />
        {search && (
          <Link href={qs({ q: "" })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-white" aria-label="Clear search">
            <IconX size={16} />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900">
          <Link href={qs({ sort: "new" })} className={`btn-sm ${sort === "new" ? "btn-primary" : "btn-ghost"}`}>
            Newest
          </Link>
          <Link href={qs({ sort: "old" })} className={`btn-sm ${sort === "old" ? "btn-primary" : "btn-ghost"}`}>
            Oldest
          </Link>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900">
          <Link href={qs({ type: "" })} className={`btn-sm whitespace-nowrap ${!type ? "btn-primary" : "btn-ghost"}`}>
            All
          </Link>
          {types.map((t) => (
            <Link key={t} href={qs({ type: t })} className={`btn-sm whitespace-nowrap ${type === t ? "btn-primary" : "btn-ghost"}`}>
              {t}
            </Link>
          ))}
        </div>

        {hasFilters && (
          <Link href={basePath} className="btn-ghost btn-sm shrink-0">
            <IconFilter size={14} /> Clear
          </Link>
        )}
      </div>

      <p className="text-sm text-ink-500 dark:text-ink-400 sm:ml-auto">
        {resultCount} photo{resultCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}