"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] Unhandled error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      <div className="absolute inset-0 bg-hero-mesh dark:bg-hero-mesh-dark" />

      <Container className="relative py-24 text-center">
        <div className="animate-fade-in">
          {/* Mascot */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring-4 ring-red-200/50 dark:ring-red-800/50 animate-wiggle">
            <Image
              src="/brand/CutieLookingBack.png"
              alt="UGN mascot"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Oops! Something went wrong
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-500 dark:text-ink-400">
            We hit a temporary problem loading this page. Our little gremlins are on
            it. Please try again in a moment.
          </p>
          {error.digest && (
            <p className="mt-3 text-sm font-mono text-ink-400 dark:text-ink-500">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button onClick={() => reset()} className="btn-cta group">
              <span className="relative z-10 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-180" aria-hidden>
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                </svg>
                Try again
              </span>
            </button>
            <Link href="/" className="btn-cta-secondary">
              Back to home
            </Link>
          </div>

          <p className="mt-12 text-sm text-ink-400 dark:text-ink-500">
            Still having trouble? Reach out on Discord and we&apos;ll help! 💜
          </p>
        </div>
      </Container>
    </div>
  );
}
