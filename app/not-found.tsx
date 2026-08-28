import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";

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

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-cta group">
              <span className="relative z-10 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Take me home
              </span>
            </Link>
            <Link href="/links" className="btn-cta-secondary">
              Helpful links
            </Link>
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
