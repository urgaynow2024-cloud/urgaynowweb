import Link from "next/link";
import type { ReactNode } from "react";
import { IconChevronRight } from "./icons";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <IconChevronRight size={14} className="text-ink-300 dark:text-ink-600" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "font-medium text-ink-700 dark:text-ink-200" : ""}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  back,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  back?: { href: string; label?: string };
}) {
  return (
    <div className="mb-7 animate-fade-in">
      {breadcrumbs && (
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {back && (
            <Link
              href={back.href}
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300"
            >
              <span className="rotate-180"><IconChevronRight size={14} /></span>
              {back.label ?? "Back"}
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-[28px]">
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-500 dark:text-ink-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
