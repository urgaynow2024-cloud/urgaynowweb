import { Container, PageHeader } from "@/components/Container";
import { getSetting } from "@/lib/settings";
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
  const content = await getSetting("aboutContent");
  const discord = await getSetting("discordInvite");
  const vrchat = await getSetting("vrchatGroupUrl");

  return (
    <>
      <div className="prose-zinc mx-auto max-w-3xl">
        <Markdown content={content} />
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <div className="text-3xl">🤝</div>
          <h3 className="mt-2 font-bold text-zinc-900 dark:text-white">Welcoming</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Everyone is welcome, exactly as they are.</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl">🏳️‍🌈</div>
          <h3 className="mt-2 font-bold text-zinc-900 dark:text-white">Proud</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Loud, proud, and LGBTQ+ friendly.</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl">💜</div>
          <h3 className="mt-2 font-bold text-zinc-900 dark:text-white">Kind</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A safe, supportive space to be yourself.</p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-3">
        {discord && (
          <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-primary">Join our Discord</a>
        )}
        {vrchat && (
          <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary">VRChat Group</a>
        )}
        <Link href="/rules" className="btn-secondary">Read the rules</Link>
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
