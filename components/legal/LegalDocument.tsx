import type { ReactNode } from "react";
import Link from "next/link";
import { HalloweenIcon } from "@/components/halloween/HalloweenIcon";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export type LegalDocumentProps = {
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSection[];
  footer?: ReactNode;
};

/**
 * Shared legal document layout: sticky table of contents, anchored sections,
 * and a visible last-updated date.
 *
 * Typography is deliberately plainer than the marketing pages, and the seasonal
 * decoration layer is switched off for these routes (see app/legal/layout.tsx).
 */
export function LegalDocument({ title, summary, lastUpdated, sections, footer }: LegalDocumentProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav
        aria-label={`${title} contents`}
        className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start"
      >
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
            On this page
          </p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex gap-2 rounded-lg px-2 py-1 text-ink-600 transition-colors hover:bg-ink-100 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-brand-200"
                >
                  <span className="text-ink-400 dark:text-ink-500" aria-hidden>
                    {index + 1}.
                  </span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </nav>

      <article className="order-1 min-w-0 lg:order-2">
        <header className="border-b border-ink-200 pb-6 dark:border-ink-800">
          <div className="flex items-start gap-4">
            <HalloweenIcon size={44} />
            <div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-lg text-ink-600 dark:text-ink-300">{summary}</p>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">
                {section.title}
              </h2>
              <div className="legal-prose mt-3">{section.body}</div>
            </section>
          ))}
        </div>

        {footer}
      </article>
    </div>
  );
}

export function LegalProse({ children }: { children: ReactNode }) {
  return <div className="legal-prose">{children}</div>;
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <p className="my-4 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-ink-800 dark:border-brand-800 dark:bg-brand-950/30 dark:text-ink-100">
      {children}
    </p>
  );
}

export function LegalBackLinks() {
  return (
    <div className="mt-12 flex flex-wrap gap-4 border-t border-ink-200 pt-6 text-sm dark:border-ink-800">
      <Link href="/legal" className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300">
        All legal documents
      </Link>
      <Link href="/rules" className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300">
        Community rules
      </Link>
      <Link href="/report" className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300">
        Report a problem
      </Link>
      <Link href="/support" className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300">
        Contact support
      </Link>
    </div>
  );
}

export default LegalDocument;