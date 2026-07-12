import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { Markdown } from "@/components/Markdown";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
  description: "Learn about Ur Gay Now — our community, our values, and what we're all about.",
};

async function AboutContent() {
  const [content, discord, vrchat, shopDesigns] = await safeQuery(
    () =>
      Promise.all([
        getSetting("aboutContent"),
        getSetting("discordInvite"),
        getSetting("vrchatGroupUrl"),
        prisma.shopDesign.findMany({
          where: { published: true, featured: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: 3,
        }),
      ]),
    ["", "", "", [] as { id: string; name: string; imageUrl: string; imageAlt: string | null }[]],
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

      <div className="mx-auto mt-16 max-w-4xl">
        <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-pride-gradient-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
                Shop Coming Soon
              </span>
              <h3 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">Our merch is on the way</h3>
              <p className="mt-2 max-w-xl text-base text-zinc-600 dark:text-zinc-400">
                Ur Gay Now clothing, outfits, and community designs are being prepared. Here&apos;s a
                sneak peek at what&apos;s coming — the full shop opens soon.
              </p>
            </div>
            <Link href="/shop" className="btn-primary text-base px-6 py-3 shrink-0">View Our Shop</Link>
          </div>

          {shopDesigns.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {shopDesigns.map((d) => (
                <Link
                  key={d.id}
                  href="/shop"
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/40"
                >
                  <div className="aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.imageUrl}
                      alt={d.imageAlt || d.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="truncate p-3 text-sm font-semibold text-zinc-900 dark:text-white">{d.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
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
