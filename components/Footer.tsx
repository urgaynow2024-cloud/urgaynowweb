import Link from "next/link";
import Image from "next/image";
import { getFooterSocials } from "@/lib/nav";

export async function Footer() {
  const socials = await getFooterSocials();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-ink-200/80 bg-surface-50 dark:border-ink-800/80 dark:bg-surface-950">
      {/* Top gradient bar */}
      <div className="bg-pride-gradient h-1 w-full" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-brand-700 transition hover:text-brand-800 dark:text-brand-200"
            >
              <span
                className="relative h-9 w-9 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                aria-hidden
              >
                <Image
                  src="/brand/CutieLookingBack.png"
                  alt="UGN mascot"
                  fill
                  className="object-cover"
                  priority
                />
              </span>
              <span className="bg-gradient-to-r from-brand-700 to-brand-800 bg-clip-text text-transparent dark:from-brand-200 dark:to-brand-300">
                Ur Gay Now
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
              The official VRChat LGBTQ+ community — welcoming, colourful, and proudly
              inclusive. Come hang out with us!
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-ink-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-900/80 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/rules">
                  Rules
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/staff">
                  Staff
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/events">
                  Events
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/guides">
                  Guides & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Community
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/news">
                  News
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/gallery">
                  Gallery
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/shop">
                  Shop
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/partners">
                  Partners
                </Link>
              </li>
              <li>
                <Link className="text-ink-600 transition-all duration-200 hover:text-brand-600 hover:translate-x-1 inline-block dark:text-ink-400 dark:hover:text-brand-300" href="/support">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Join CTA */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Get involved
            </h3>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
              Join our community and make new friends in VRChat and Discord.
            </p>
            <Link
              href="/links"
              className="mt-6 btn-primary inline-flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
              Join us
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-ink-200/60 pt-8 dark:border-ink-800/60">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              © {year} Ur Gay Now. Made with <span className="text-brand-500">💜</span> for the community.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link className="text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300" href="/rules">
                Rules
              </Link>
              <span className="text-ink-300 dark:text-ink-700" aria-hidden>·</span>
              <Link className="text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300" href="/support">
                Support
              </Link>
              <span className="text-ink-300 dark:text-ink-700" aria-hidden>·</span>
              <Link className="text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300" href="/gallery">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
