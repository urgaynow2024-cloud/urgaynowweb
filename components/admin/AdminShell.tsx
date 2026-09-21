"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
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
  IconClock,
  IconSun,
  IconMoon,
} from "./ui/icons";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type Attention = {
  pendingSubmissions: number;
  openReports: number;
  draftAnnouncements: number;
  upcomingEventsNeedingAttention: number;
  failedDiscordDeliveries: number;
  missingGroupPhotoBanners: number;
  unfinishedReleases: number;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Manage",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/admin", icon: <IconHome size={19} /> },
      { key: "staff", label: "Staff", href: "/admin/staff", icon: <IconUsers size={19} /> },
      { key: "announcements", label: "Announcements", href: "/admin/announcements", icon: <IconMegaphone size={19} /> },
      { key: "events", label: "Events", href: "/admin/events", icon: <IconCalendar size={19} /> },
      { key: "gallery", label: "Gallery", href: "/admin/gallery", icon: <IconImages size={19} /> },
      { key: "group-photos", label: "Group Photos", href: "/admin/group-photos", icon: <IconCamera size={19} /> },
      { key: "links", label: "Links", href: "/admin/links", icon: <IconLink size={19} /> },
      { key: "partners", label: "Partners", href: "/admin/partners", icon: <IconLink size={19} /> },
      { key: "shop", label: "Shop Designs", href: "/admin/shop", icon: <IconTag size={19} /> },
    ],
  },
  {
    label: "Safety",
    items: [
      { key: "moderation", label: "Moderation", href: "/admin/moderation", icon: <IconShield size={19} /> },
      { key: "reports", label: "Reports", href: "/admin/reports", icon: <IconFlag size={19} /> },
      { key: "rules", label: "Rules", href: "/admin/rules", icon: <IconBook size={19} /> },
    ],
  },
  {
    label: "Help / Publishing",
    items: [
      { key: "guides", label: "Guides / FAQ", href: "/admin/guides", icon: <IconBook size={19} /> },
      { key: "updates", label: "Updates", href: "/admin/updates", icon: <IconMegaphone size={19} /> },
    ],
  },
  {
    label: "System",
    items: [
      { key: "settings", label: "Settings", href: "/admin/settings", icon: <IconSettings size={19} /> },
      { key: "theme", label: "Theme", href: "/admin/settings/appearance", icon: <IconSun size={19} /> },
      { key: "health", label: "System Health", href: "/admin/settings", icon: <IconActivity size={19} /> },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

const QUICK_CREATE = [
  { label: "New announcement", href: "/admin/announcements/new" },
  { label: "New event", href: "/admin/events/new" },
  { label: "New staff member", href: "/admin/staff/new" },
  { label: "Review submissions", href: "/admin/community" },
  { label: "Upload gallery image", href: "/admin/gallery/new" },
  { label: "New update", href: "/admin/updates/new" },
  { label: "Add link", href: "/admin/links/new" },
  { label: "New guide", href: "/admin/guides/new" },
  { label: "Upload group photo", href: "/admin/group-photos/new" },
  { label: "New shop design", href: "/admin/shop/new" },
  { label: "New partner", href: "/admin/partners/new" },
];

const SECTION_LABELS: Record<string, string> = {
  staff: "Staff",
  announcements: "Announcements",
  events: "Events",
  gallery: "Gallery",
  "group-photos": "Group Photos",
  links: "Links",
  partners: "Partners",
  shop: "Shop Designs",
  moderation: "Moderation",
  reports: "Reports",
  rules: "Rules",
  guides: "Guides / FAQ",
  updates: "Updates",
  settings: "Settings",
};

function useBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return [{ label: "Dashboard", href: "/admin" }];
  const crumbs: { label: string; href?: string }[] = [{ label: "Dashboard", href: "/admin" }];
  const section = parts[1];
  if (SECTION_LABELS[section]) crumbs.push({ label: SECTION_LABELS[section], href: `/admin/${section}` });
  if (parts[2] === "new") crumbs.push({ label: "New" });
  else if (parts[2] === "edit") crumbs.push({ label: "Bulk edit" });
  else if (parts[2]) crumbs.push({ label: "Edit" });
  return crumbs;
}

function attentionItems(attention: Attention) {
  return [
    {
      key: "submissions",
      label: "Pending community submissions",
      count: attention.pendingSubmissions,
      href: "/admin/community",
      icon: <IconClock size={16} />,
      tone: "text-amber-500",
    },
    {
      key: "reports",
      label: "Open reports",
      count: attention.openReports,
      href: "/admin/reports",
      icon: <IconFlag size={16} />,
      tone: "text-red-500",
    },
    {
      key: "announcements",
      label: "Draft announcements",
      count: attention.draftAnnouncements,
      href: "/admin/announcements?status=drafts",
      icon: <IconMegaphone size={16} />,
      tone: "text-brand-500",
    },
    {
      key: "events",
      label: "Upcoming events needing attention",
      count: attention.upcomingEventsNeedingAttention,
      href: "/admin/events",
      icon: <IconCalendar size={16} />,
      tone: "text-brand-500",
    },
    {
      key: "discord",
      label: "Failed Discord deliveries",
      count: attention.failedDiscordDeliveries,
      href: "/admin/announcements",
      icon: <IconBell size={16} />,
      tone: "text-red-500",
    },
    {
      key: "banners",
      label: "Missing group-photo banners",
      count: attention.missingGroupPhotoBanners,
      href: "/admin/group-photos",
      icon: <IconCamera size={16} />,
      tone: "text-amber-500",
    },
    {
      key: "releases",
      label: "Failed or unfinished releases",
      count: attention.unfinishedReleases,
      href: "/admin/updates",
      icon: <IconActivity size={16} />,
      tone: "text-red-500",
    },
  ];
}

export function AdminShell({
  user,
  attention = {
    pendingSubmissions: 0,
    openReports: 0,
    draftAnnouncements: 0,
    upcomingEventsNeedingAttention: 0,
    failedDiscordDeliveries: 0,
    missingGroupPhotoBanners: 0,
    unfinishedReleases: 0,
  },
  children,
}: {
  user: { name: string };
  attention?: Attention;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
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
    setCollapsed((current) => {
      localStorage.setItem("admin-sidebar-collapsed", current ? "0" : "1");
      return !current;
    });
  };

  const breadcrumbs = useBreadcrumbs(pathname);
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const items = attentionItems(attention);
  const attentionTotal = items.reduce((total, item) => total + item.count, 0);
  const navAttention: Record<string, number> = {
    announcements: attention.draftAnnouncements,
    events: attention.upcomingEventsNeedingAttention,
    gallery: attention.missingGroupPhotoBanners,
    moderation: attention.pendingSubmissions,
    reports: attention.openReports,
    updates: attention.unfinishedReleases,
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setSearchOpen(false);
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
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 items-center gap-2.5 border-b border-white/10 px-5 ${collapsed ? "justify-center px-0" : ""}`}>
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          <Image src="/brand/CutieLookingBack.png" alt="UGN mascot" fill className="object-cover" priority />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Ur Gay Now</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Admin Console</p>
          </div>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="eyebrow mb-2 px-3">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const itemAttentionCount = navAttention[item.key] ?? 0;
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
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
                    {!collapsed && !!itemAttentionCount && (
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">{itemAttentionCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link href="/" onClick={() => setMobileOpen(false)} className={`nav-link ${collapsed ? "justify-center px-0" : ""}`} title={collapsed ? "View site" : undefined}>
          <span className="shrink-0"><IconExternal size={19} /></span>
          {!collapsed && <span>View site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-bg flex min-h-screen">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 hidden bg-sidebar-gradient text-white transition-[width,transform] duration-300 ease-spring lg:block ${collapsed ? "w-[76px]" : "w-64"}`}>
        {SidebarContent}
        <button type="button" onClick={toggleCollapse} aria-label="Toggle sidebar" className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-surface-800 text-white shadow-md transition hover:bg-surface-700 lg:flex active:scale-95">
          <IconChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-gradient text-white transition-transform duration-300 ease-spring lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {SidebarContent}
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${collapsed ? "lg:ml-[76px]" : "lg:ml-64"}`}>
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 shadow-sm sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="btn-icon lg:hidden" aria-label="Open menu"><IconMenu size={20} /></button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 md:block">
            <div className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1">
                  {index > 0 && <IconChevronRight size={14} className="text-ink-300 dark:text-ink-600" />}
                  {crumb.href && index < breadcrumbs.length - 1 ? <Link href={crumb.href} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">{crumb.label}</Link> : <span className="font-medium text-ink-700 dark:text-ink-200">{crumb.label}</span>}
                </span>
              ))}
            </div>
          </nav>

          <div ref={searchBoxRef} className="relative ml-auto hidden sm:block md:ml-0">
            <div className="relative">
              <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Jump to…" className="input w-44 focus:w-64 pl-9 pr-10" aria-label="Command palette" />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:border-ink-700 dark:bg-ink-800 lg:block">⌘K</kbd>
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 z-50 mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl border border-ink-200 bg-white p-1.5 shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
                {searchResults.map((result) => (
                  <button key={result.href} type="button" onClick={() => { setSearchOpen(false); setQuery(""); router.push(result.href); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
                    <span className="text-ink-400">{result.icon}</span>{result.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Dropdown align="end" label="Quick create" trigger={<span className="btn-primary btn-sm"><IconPlus size={15} /><span className="hidden sm:inline">New</span></span>} items={QUICK_CREATE.map((item) => ({ label: item.label, href: item.href, icon: <IconPlus size={15} /> }))} />

          <div className="relative">
            <button type="button" onClick={() => setNotifOpen((open) => !open)} aria-label="Notifications" className="btn-icon relative"><IconBell size={20} />{attentionTotal > 0 && <span className="absolute right-1.5 top-1.5 min-w-[1rem] rounded-full bg-pride-gradient px-1 text-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-ink-900">{attentionTotal}</span>}</button>
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 animate-scale-in overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800"><p className="text-sm font-semibold text-ink-900 dark:text-white">Needs attention</p><span className="badge badge-brand">{attentionTotal} open</span></div>
                <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto dark:divide-ink-800">
                  {items.filter((item) => item.count > 0).map((item) => (
                    <li key={item.key}><Link href={item.href} onClick={() => setNotifOpen(false)} className="flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"><span className={`mt-0.5 ${item.tone}`}>{item.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-ink-800 dark:text-ink-100">{item.label}</span><span className="block text-xs text-ink-400">{item.count} awaiting action</span></span><IconChevronRight size={15} className="mt-1 text-ink-400" /></Link></li>
                  ))}
                  {attentionTotal === 0 && <li className="px-4 py-6 text-sm text-ink-500 dark:text-ink-400">All clear — no outstanding work.</li>}
                </ul>
                <Link href="/admin" onClick={() => setNotifOpen(false)} className="flex items-center justify-center gap-1.5 border-t border-ink-100 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:text-brand-300 dark:hover:bg-ink-800/60">View dashboard <IconActivity size={15} /></Link>
              </div>
            )}
          </div>

          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="btn-icon" title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}</button>

          <Dropdown align="end" label="Account menu" trigger={<span className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition hover:bg-ink-100 dark:hover:bg-ink-800"><Avatar name={user.name} size="sm" className="h-8 w-8 text-xs" /><span className="hidden text-left lg:block"><span className="block text-sm font-semibold leading-tight text-ink-900 dark:text-white">{user.name}</span><span className="block text-[11px] leading-tight text-ink-500">Administrator</span></span></span>} items={[{ label: "View site", href: "/", icon: <IconExternal size={16} /> }, { label: "Settings", href: "/admin/settings", icon: <IconSettings size={16} /> }, { label: "System health", href: "/admin/settings", icon: <IconActivity size={16} /> }, { label: "Log out", href: "/admin/login", icon: <IconLogout size={16} />, danger: true }]} />
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-7xl animate-fade-in">{children}</div></main>
      </div>
    </div>
  );
}
