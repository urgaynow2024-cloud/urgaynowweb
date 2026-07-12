import Link from "next/link";
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          {partner.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.logoUrl}
              alt={`${partner.name} logo`}
              className="h-16 w-16 rounded-2xl object-cover shadow-sm"
              loading="lazy"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-2xl font-extrabold text-white shadow-sm">
              {initials}
            </span>
          )}
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {partner.tag}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{partner.name}</h3>

        {partner.description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{partner.description}</p>
        )}

        {links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                {l.label || "Visit"} <IconExternal size={13} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
