import type { Metadata } from "next";
import Link from "next/link";
import { HalloweenIcon } from "@/components/halloween/HalloweenIcon";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Ur Gay Now legal documents: Bot Terms of Service, Bot Privacy Policy, UGN Ownership & IP, and where to report a problem.",
};

const DOCUMENTS = [
  {
    href: "/legal/bot/terms",
    title: "Bot Terms of Service",
    description:
      "What the Ur Gay Now Discord bot does, who may use it, and the rules that apply to using it in our server.",
  },
  {
    href: "/legal/bot/privacy",
    title: "Bot Privacy Policy",
    description:
      "Exactly what data the bot and this website store, why we store it, how long we keep it, and who we share it with.",
  },
  {
    href: "/legal/ownership",
    title: "UGN Ownership & IP",
    description:
      "Which work Ur Gay Now owns, what stays with its creator, and how we handle third-party licences.",
  },
  {
    href: "/rules",
    title: "Community Rules",
    description: "The behaviour expected in Ur Gay Now spaces across VRChat, Discord, and this website.",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex items-start gap-4">
        <HalloweenIcon size={52} />
        <div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Legal &amp; policies
          </h1>
          <p className="mt-3 text-lg text-ink-600 dark:text-ink-300">
            This page is the canonical home for Ur Gay Now legal documents. Older links to the
            previous GitHub-hosted pages redirect here.
          </p>
        </div>
      </header>

      <ul className="mt-10 space-y-4">
        {DOCUMENTS.map((document) => (
          <li key={document.href}>
            <Link href={document.href} className="card card-hover block p-5">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">{document.title}</h2>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{document.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-3xl border border-ink-200 bg-white/70 p-6 dark:border-ink-800 dark:bg-ink-900/50">
        <h2 className="text-xl font-bold text-ink-900 dark:text-white">Need help?</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link
            href="/report"
            className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
          >
            Report a user or a problem
          </Link>
          <Link
            href="/support"
            className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
          >
            Contact support
          </Link>
          <Link
            href="/about"
            className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
          >
            About Ur Gay Now
          </Link>
        </div>
      </section>
    </div>
  );
}