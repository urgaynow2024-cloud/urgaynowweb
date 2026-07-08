import Link from "next/link";
import { getFooterSocials } from "@/lib/nav";

export async function Footer() {
  const socials = await getFooterSocials();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:border-zinc-800/80 dark:from-zinc-950 dark:to-zinc-900">
      <div className="bg-pride-gradient h-1 w-full" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold text-brand-700 dark:text-brand-200">
            <span aria-hidden>🏳️‍🌈</span> Ur Gay Now
          </div>
          <p className="mt-3 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            The official community hub. Welcoming, colourful, and proudly LGBTQ+ friendly.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/about">About</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/rules">Rules</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/staff">Staff</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/events">Events</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/guides">Guides & FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Community</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/news">News</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/gallery">Gallery</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/links">Links</Link></li>
            <li><Link className="text-zinc-600 transition hover:text-brand-600 dark:text-zinc-400" href="/support">Support</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Follow us</h3>
          {socials.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">Social links coming soon.</p>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200/80 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800/80">
        © {year} Ur Gay Now. Made with 💜 for the community.
      </div>
    </footer>
  );
}
