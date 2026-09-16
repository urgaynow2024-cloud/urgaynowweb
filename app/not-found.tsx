"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";

const POPULAR_SECTIONS = [
  { href: "/events", label: "Events", desc: "Browse upcoming and live events" },
  { href: "/news", label: "News", desc: "Latest announcements from the team" },
  { href: "/gallery", label: "Gallery", desc: "Community photos and moments" },
  { href: "/staff", label: "Staff", desc: "Meet the people who keep things running" },
  { href: "/polls", label: "Polls", desc: "Active polls — have your say" },
  { href: "/links", label: "Links", desc: "Discord, VRChat, and useful places" },
];

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-hero-mesh dark:bg-hero-mesh-dark" />

      <Container className="relative py-24 text-center">
        <div className="animate-fade-in">
          {/* Mascot */}
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full ring-4 ring-brand-200/50 dark:ring-brand-700/50">
            <Image
              src="/brand/CutieLookingBack.png"
              alt="UGN mascot"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 404 number */}
          <div className="mb-2 text-[10rem] font-extrabold leading-none tracking-tighter text-transparent bg-gradient-to-b from-brand-500 via-brand-600 to-brand-800 bg-clip-text sm:text-[14rem]">
            404
          </div>

          {/* Message */}
          <div className="mb-6 text-2xl font-bold text-ink-700 dark:text-ink-200 sm:text-3xl">
            UH OH... YOU WANDERED TOO FAR. 🐾
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-500 dark:text-ink-400">
            You&apos;ve ventured into uncharted territory. Even our avatars are confused.
            Let&apos;s get you back to familiar ground.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-md">
            <SearchBox
              autoFocus={false}
              className="w-full"
            />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-cta group">
              <span className="relative z-10 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Take me home
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                }
              }}
              className="btn-cta-secondary"
            >
              Go back
            </button>
            <Link href="/links" className="btn-cta-secondary">
              Helpful links
            </Link>
          </div>

          {/* Popular sections */}
          <div className="mt-16 text-left">
            <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
              Popular sections
            </h2>
            <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_SECTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-center justify-between rounded-xl border border-ink-200/80 bg-white/60 px-4 py-3 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-premium dark:border-ink-700 dark:bg-ink-900/60 dark:hover:border-brand-700"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200">
                      {s.label}
                    </span>
                    <span className="block text-xs text-ink-400 dark:text-ink-500">{s.desc}</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600 dark:text-ink-600" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-3 text-sm text-ink-400 dark:text-ink-500">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-ink-300 dark:to-ink-700" />
            <span>If you think this is a bug, let a staff member know on Discord! 💜</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-ink-300 dark:to-ink-700" />
          </div>
        </div>
      </Container>
    </div>
  );
}