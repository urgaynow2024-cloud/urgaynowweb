import Link from "next/link";
import Image from "next/image";
import { IconExternal } from "@/components/admin/ui/icons";

export type PartnerCardData = {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  links: { label: string; url: string }[];
  tag: string;
};

export function PartnerCard({ partner }: { partner: PartnerCardData }) {
  const initials = partner.name.slice(0, 1).toUpperCase();
  const links = partner.links.filter((l) => l.url);
  const tagColors: Record<string, string> = {
    Partner: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
    Affiliate: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "Friend Community": "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  const tagClass = tagColors[partner.tag] || "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-200 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          {partner.logoUrl ? (
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-ink-800">
              <Image
                src={partner.logoUrl}
                alt={`${partner.name} logo`}
                width={64}
                height={64}
                className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-2xl font-extrabold text-white shadow-sm">
              {initials}
            </span>
          )}
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${tagClass}`}
          >
            {partner.tag}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors">
          {partner.name}
        </h3>

        {partner.description && (
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
            {partner.description}
          </p>
        )}

        {links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-1.5 text-xs font-semibold text-white opacity-90 transition-opacity hover:opacity-100 hover:shadow-glow active:scale-95"
              >
                {l.label || "Visit"} <IconExternal size={12} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
