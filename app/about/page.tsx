import { Container, PageHeader } from "@/components/Container";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { Markdown } from "@/components/Markdown";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";

export const revalidate = 300;

export const metadata = {
  title: "About",
  description: "Learn about Ur Gay Now — our community, our values, and what we're all about.",
};

async function AboutContent() {
  const [content, discord, vrchat] = await safeQuery(
    () =>
      Promise.all([
        getSetting("aboutContent"),
        getSetting("discordInvite"),
        getSetting("vrchatGroupUrl"),
      ]),
    ["", "", ""],
  );

  return (
    <>
      <div className="prose-zinc mx-auto max-w-3xl text-lg">
        <Markdown content={content} />
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700">
          <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">🤝</div>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">Welcoming</h3>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">Everyone is welcome, exactly as they are.</p>
        </div>
        <div className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700">
          <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">🏳️‍🌈</div>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">Proud</h3>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">Loud, proud, and LGBTQ+ friendly.</p>
        </div>
        <div className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700">
          <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">💜</div>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">Kind</h3>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">A safe, supportive space to be yourself.</p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-4">
        {discord && (
          <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-3">Join our Discord</a>
        )}
        {vrchat && (
          <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary text-lg px-8 py-3">VRChat Group</a>
        )}
        <Link href="/rules" className="btn-secondary text-lg px-8 py-3">Read the rules</Link>
      </div>
    </>
  );
}

export default async function AboutPage() {
  return (
    <>
      <PageHeader title="About Us" description="Who we are and what we stand for." />
      <Container className="py-12">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          }
        >
          <AboutContent />
        </Suspense>
      </Container>
    </>
  );
}
