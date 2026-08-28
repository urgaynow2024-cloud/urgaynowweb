import { Container } from "@/components/Container";
import Image from "next/image";

const LOADING_MESSAGES = [
  "Spawning into the world...",
  "Loading avatars...",
  "Applying shaders...",
  "Calibrating fun levels...",
  "Summoning the community...",
  "Polishing rainbows...",
];

export default function Loading() {
  const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />

      <Container className="relative py-24 text-center">
        <div className="animate-fade-in">
          {/* Animated mascot */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring-4 ring-brand-200/50 dark:ring-brand-700/50 animate-bounce-gentle">
            <Image
              src="/brand/CutieLookingBack.png"
              alt="UGN mascot"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
            Loading...
          </h1>
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 animate-pulse-soft">
            {message}
          </p>

          {/* Skeleton preview */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-ink-200/60 bg-white p-4 dark:border-ink-800/60 dark:bg-ink-900/50"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-32 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse-soft" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-ink-100 dark:bg-ink-800 animate-pulse-soft" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-ink-100 dark:bg-ink-800 animate-pulse-soft" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
