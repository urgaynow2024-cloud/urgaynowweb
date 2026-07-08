import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/admin/login/actions";
import { NAV_LINKS } from "@/lib/nav-links";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Staff", href: "/admin/staff" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "Events", href: "/admin/events" },
  { label: "Rules", href: "/admin/rules" },
  { label: "Guides / FAQ", href: "/admin/guides" },
  { label: "Links", href: "/admin/links" },
  { label: "Group Photos", href: "/admin/group-photos" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login page (no session) renders without the admin shell.
  if (!session) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:flex">
      <aside className="border-b border-zinc-200 bg-white lg:w-64 lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 px-5 py-4 text-lg font-extrabold text-brand-700 dark:text-brand-200">
          <span aria-hidden>🏳️‍🌈</span> Admin
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-2" aria-label="Admin">
          {ADMIN_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-zinc-200 px-3 py-3 lg:block dark:border-zinc-800">
          <form action={logout}>
            <button className="btn-secondary w-full">Log out</button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-sm text-zinc-500">Signed in as {session.name}</span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
              View site ↗
            </Link>
            <form action={logout} className="lg:hidden">
              <button className="btn-secondary text-xs">Log out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-5 py-8">{children}</div>
      </div>
    </div>
  );
}
