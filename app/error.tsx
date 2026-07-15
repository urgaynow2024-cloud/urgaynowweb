"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

/**
 * Route-segment error boundary for the whole app.
 *
 * Without this, any thrown error in a Server Component (e.g. the database being
 * unreachable) bubbles up to Next.js's default handler and renders the bare
 * "Application error: a server-side exception has occurred" screen with only a
 * digest. That is exactly what happened on /staff.
 *
 * This boundary catches those errors, logs them (so the digest is correlated in
 * the server logs), and shows a friendly, recoverable page instead of a hard
 * crash. It does NOT hide the problem — the error is still reported — it just
 * stops a transient DB outage from taking a whole route down with a scary error.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error (and its digest) in the server/browser logs so it
    // can be matched against the reported digest during an incident.
    console.error("[app/error] Unhandled error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <div className="text-6xl">🏳️‍🌈</div>
      <h1 className="mt-6 text-4xl font-extrabold text-zinc-900 dark:text-white">
        Something went wrong
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We hit a temporary problem loading this page. Please try again in a moment.
      </p>
      {error.digest && (
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={() => reset()} className="btn-primary inline-flex">
          Try again
        </button>
        <Link href="/" className="btn-secondary inline-flex">
          Back to home
        </Link>
      </div>
    </Container>
  );
}
