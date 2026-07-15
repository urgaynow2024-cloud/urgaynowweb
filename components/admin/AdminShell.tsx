"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./ui/Avatar";
import { Dropdown } from "./ui/Dropdown";
import {
  IconHome,
  IconUsers,
  IconMegaphone,
  IconCalendar,
  IconBook,
  IconLink,
  IconImages,
  IconCamera,
  IconSettings,
  IconSearch,
  IconBell,
  IconMenu,
  IconLogout,
  IconExternal,
  IconPlus,
  IconChevronRight,
  IconShield,
  IconFlag,
  IconActivity,
  IconCheck,
  IconTag,
} from "./ui/icons";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <IconHome size={19} /> },
  { label: "Staff", href: "/admin/staff", icon: <IconUsers size={19} /> },
  { label: "Announcements", href: "/admin/announcements", icon: <IconMegaphone size={19} /> },
  { label: "Events", href: "/admin/events", icon: <IconCalendar size={19} /> },
  { label: "Rules", href: "/admin/rules", icon: <IconBook size={19} /> },
  { label: "Guides / FAQ", href: "/admin/guides", icon: <IconBook size={19} /> },
  { label: "Links", href: "/admin/links", icon: <IconLink size={19} /> },
  { label: "Partners", href: "/admin/partners", icon: <IconLink size={19} /> },
  { label: "Gallery", href: "/admin/gallery", icon: <IconImages size={19} /> },
  { label: "Group Photos", href: "/admin/group-photos", icon: <IconCamera size={19} /> },
  { label: "Shop Designs", href: "/admin/shop", icon: <IconTag size={19} /> },
  { label: "Moderation", href: "/admin/moderation", icon: <IconShield size={19} /> },
  { label: "Reports", href: "/admin/reports", icon: <IconFlag size={19} /> },
  { label: "Settings", href: "/admin/settings", icon: <IconSettings size={19} /> },
];

const QUICK_CREATE: { label: string; href: string }[] = [
  { label: "New announcement", href: "/admin/announcements/new" },
  { label: "New event", href: "/admin/events/new" },
  { label: "New staff member", href: "/admin/staff/new" },
  { label: "New guide", href: "/admin/guides/new" },
  { label: "Upload gallery image", href: "/admin/gallery/new" },
  { label: "Upload group photo", href: "/admin/group-photos/new" },
  { label: "New shop design", href: "/admin/shop/new" },
  { label: "New link", href: "/admin/links/new" },
  { label: "New partner", href: "/admin/partners/new" },
];

const SECTION_LABELS: Record<string, string> = {
  staff: "Staff",
  announcements: "Announcements",
  events: "Events",
  rules: "Rules",
  guides: "Guides / FAQ",
  links: "Links",
  partners: "Partners",
  gallery: "Gallery",
  "group-photos": "Group Photos",
  shop: "Shop Designs",
  moderation: "Moderation",
  reports: "Reports",
  settings: "Settings",
};

function useBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean); // ["admin", "staff", "new"]
  if (parts.length <= 1) return [{ label: "Dashboard", href: "/admin" }];
  const crumbs: { label: string; href?: string }[] = [{ label: "Dashboard", href: "/admin" }];
  const section = parts[1];
  if (SECTION_LABELS[section]) crumbs.push({ label: SECTION_LABELS[section], href: `/admin/${section}` });
  if (parts[2] === "new") crumbs.push({ label: "New" });
  else if (parts[2] === "edit") crumbs.push({ label: "Bulk edit" });
  else if (parts[2]) crumbs.push({ label: "Edit" });
  return crumbs;
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem("admin-sidebar-collapsed", c ? "0" : "1");
      return !c;
    });
  };

  const breadcrumbs = useBreadcrumbs(pathname);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return NAV.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  void initials;

  const notifications = [
    { icon: <IconFlag size={16} />, tone: "text-amber-500", title: "New report submitted", time: "12m ago" },
    { icon: <IconUsers size={16} />, tone: "text-brand-500", title: "3 staff changes pending review", time: "1h ago" },
    { icon: <IconCamera size={16} />, tone: "text-emerald-500", title: "Group photo uploaded", time: "3h ago" },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 items-center gap-2.5 border-b border-white/10 px-5 ${collapsed ? "justify-center px-0" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pride-gradient text-lg shadow-glow">
          🏳️‍🌈
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Ur Gay Now</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Admin Console</p>
          </div>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        <p className={`eyebrow mb-2 px-3 ${collapsed ? "sr-only" : ""}`}>Manage</p>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`nav-link ${active ? "nav-link-active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`nav-link ${collapsed ? "justify-center px-0" : ""}`}
          title={collapsed ? "View site" : undefined}
        >
          <span className="shrink-0"><IconExternal size={19} /></span>
          {!collapsed && <span>View site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-bg flex min-h-screen">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden bg-sidebar-gradient text-white transition-[width,transform] duration-300 ease-spring lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {SidebarContent}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-ink-800 text-white shadow-md transition hover:bg-ink-700 lg:flex"
        >
          <IconChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-gradient text-white transition-transform duration-300 ease-spring lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {SidebarContent}
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${collapsed ? "lg:ml-[76px]" : "lg:ml-64"}`}>
        {/* Top bar */}
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="btn-icon lg:hidden" aria-label="Open menu">
            <IconMenu size={20} />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 md:block">
            <div className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400">
              {breadcrumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <IconChevronRight size={14} className="text-ink-300 dark:text-ink-600" />}
                  {c.href && i < breadcrumbs.length - 1 ? (
                    <Link href={c.href} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-700 dark:text-ink-200">{c.label}</span>
                  )}
                </span>
              ))}
            </div>
          </nav>

          {/* Search */}
          <div ref={searchBoxRef} className="relative ml-auto hidden sm:block md:ml-0">
            <div className="relative">
              <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search…"
                className="w-44 rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-12 text-sm text-ink-800 placeholder:text-ink-400 transition-all focus:w-64 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:border-ink-700 dark:bg-ink-800 lg:block">
                ⌘K
              </kbd>
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 z-50 mt-2 w-64 animate-scale-in overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
                {searchResults.map((r) => (
                  <button
                    key={r.href}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      router.push(r.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                  >
                    <span className="text-ink-400">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <Dropdown
            align="end"
            label="Quick create"
            trigger={
              <span className="btn-primary btn-sm">
                <IconPlus size={15} />
                <span className="hidden sm:inline">New</span>
              </span>
            }
            items={QUICK_CREATE.map((q) => ({
              label: q.label,
              href: q.href,
              icon: <IconPlus size={15} />,
            }))}
          />

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
              className="btn-icon relative"
            >
              <IconBell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pride-gradient ring-2 ring-white dark:ring-ink-900" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 animate-scale-in overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">Notifications</p>
                  <span className="badge badge-brand">{notifications.length} new</span>
                </div>
                <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto dark:divide-ink-800">
                  {notifications.map((n, i) => (
                    <li key={i} className="flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60">
                      <span className={`mt-0.5 ${n.tone}`}>{n.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                        <p className="text-xs text-ink-400">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1.5 border-t border-ink-100 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:text-brand-300 dark:hover:bg-ink-800/60"
                >
                  View dashboard <IconActivity size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <Dropdown
            align="end"
            label="Account menu"
            trigger={
              <span className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition hover:bg-ink-100 dark:hover:bg-ink-800">
                <Avatar name={user.name} size="sm" className="h-8 w-8 text-xs" />
                <span className="hidden text-left lg:block">
                  <span className="block text-sm font-semibold leading-tight text-ink-900 dark:text-white">{user.name}</span>
                  <span className="block text-[11px] leading-tight text-ink-500">Administrator</span>
                </span>
              </span>
            }
            items={[
              { label: "View site", href: "/", icon: <IconExternal size={16} /> },
              { label: "Settings", href: "/admin/settings", icon: <IconSettings size={16} /> },
              { label: "Security", href: "/admin/settings", icon: <IconShield size={16} /> },
              { label: "Log out", href: "/admin/login", icon: <IconLogout size={16} />, danger: true },
            ]}
          />
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
