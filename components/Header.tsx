"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, isNavGroup, isLinkActive, type NavLink } from "@/lib/nav-links";
import { NavDropdown } from "@/components/NavDropdown";
import { useTheme } from "@/components/ThemeProvider";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function NavLeafLink({ item, className = "" }: { item: NavLink; className?: string }) {
  const pathname = usePathname();
  const active = isLinkActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
          : "text-zinc-600 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
      } ${className}`}
    >
      {item.label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  const activeClass =
    "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200";
  const idleClass =
    "text-zinc-600 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-200";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95">
      <div className="bg-pride-gradient h-1 w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-brand-700 transition hover:text-brand-800 dark:text-brand-200 dark:hover:text-brand-100"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden className="text-xl">🏳️‍🌈</span>
          <span>Ur Gay Now</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            isNavGroup(item) ? (
              <NavDropdown key={item.label} label={item.label} items={item.children} />
            ) : (
              <NavLeafLink key={item.href} item={item} />
            ),
          )}
          <span className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden />
          <Link
            href="/search"
            aria-label="Search"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 ${idleClass}`}
          >
            <SearchIcon />
          </Link>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <SearchIcon />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => {
              setOpen((v) => !v);
              setExpanded(null);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav
          className="border-t border-zinc-200/80 bg-white/95 px-4 py-4 backdrop-blur-md lg:hidden dark:border-zinc-800/80 dark:bg-zinc-950/95"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              if (!isNavGroup(item)) {
                return (
                  <li key={item.href}>
                    <NavLeafLink item={item} className="block" />
                  </li>
                );
              }
              const isOpen = expanded === item.label;
              const groupActive = item.children.some((c) => isLinkActive(pathname, c.href));
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`mobile-${item.label}`}
                    onClick={() => setExpanded(isOpen ? null : item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      groupActive ? activeClass : idleClass
                    }`}
                  >
                    <span>{item.label}</span>
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    id={`mobile-${item.label}`}
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLeafLink
                            item={child}
                            className="block border-l-2 border-zinc-200 py-2 pl-3 dark:border-zinc-800"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
