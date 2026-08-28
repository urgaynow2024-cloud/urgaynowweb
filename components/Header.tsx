"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { NAV_ITEMS, isNavGroup, isLinkActive, type NavLink } from "@/lib/nav-links";
import { NavDropdown } from "@/components/NavDropdown";
import { useTheme } from "@/components/ThemeProvider";
import { IconMenu, IconX, IconSearch, IconDiscord } from "@/components/admin/ui/icons";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
    >
      <span className="text-lg transition-transform duration-300">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}

function SearchButton() {
  return (
    <Link
      href="/search"
      aria-label="Search"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
    >
      <IconSearch size={18} />
    </Link>
  );
}

function NavLeafLink({ item, className = "" }: { item: NavLink; className?: string }) {
  const pathname = usePathname();
  const active = isLinkActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
          : "text-ink-600 hover:bg-brand-50/60 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
      } ${className}`}
    >
      {active && (
        <span
          className="absolute -bottom-0.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
          aria-hidden
        />
      )}
      <span className="relative">{item.label}</span>
    </Link>
  );
}

export function Header({ joinUrl }: { joinUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onTouchStart(e: TouchEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onTouchStart);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, [open]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  const activeClass =
    "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200";
  const idleClass =
    "text-ink-600 hover:bg-brand-50/60 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-200";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-ink-200/80 bg-surface-0/80 shadow-lg shadow-ink-900/5 backdrop-blur-xl dark:border-ink-800/80 dark:bg-surface-950/80 dark:shadow-ink-950/30"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="bg-pride-gradient h-[3px] w-full" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-brand-700 transition hover:text-brand-800 dark:text-brand-200 dark:hover:text-brand-100"
          onClick={() => setOpen(false)}
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

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            isNavGroup(item) ? (
              <NavDropdown key={item.label} label={item.label} items={item.children} />
            ) : (
              <NavLeafLink key={item.href} item={item} />
            ),
          )}
          <span className="mx-2 h-6 w-px bg-ink-200/60 dark:bg-ink-800/60" aria-hidden />
          <SearchButton />
          <ThemeToggle />
          {joinUrl && (
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 btn-cta"
              onClick={() => setOpen(false)}
            >
              <span className="relative z-10 flex items-center gap-1.5 text-sm">
                <IconDiscord size={16} />
                Join
              </span>
            </a>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchButton />
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls={open ? "mobile-menu" : undefined}
            onClick={() => {
              setOpen((v) => !v);
              setExpanded(null);
            }}
            className="relative h-11 w-11 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-600 shadow-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
          >
            <span className="sr-only">Toggle menu</span>
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
            >
              <IconMenu size={20} />
            </div>
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
            >
              <IconX size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile navigation — animated panel */}
      <div
        id="mobile-menu"
        ref={mobileRef}
        role="navigation"
        aria-label="Mobile"
        className={`overflow-hidden border-t border-ink-200/80 bg-surface-0/95 backdrop-blur-xl dark:border-ink-800/80 dark:bg-surface-950/95 transition-all duration-300 ease-spring lg:hidden ${open ? "max-h-[40rem] py-4 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none"}`}
      >
        <ul className="space-y-1 px-4">
          {NAV_ITEMS.map((item) => {
            if (!isNavGroup(item)) {
              return (
                <li key={item.href}>
                  <NavLeafLink
                    item={item}
                    className="block rounded-xl px-3 py-3 text-base"
                  />
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
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-base font-semibold transition-colors ${
                    groupActive ? activeClass : idleClass
                  }`}
                >
                  <span>{item.label}</span>
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  id={`mobile-${item.label}`}
                  className={`grid transition-all duration-300 ease-spring ${isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <ul className="overflow-hidden pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavLeafLink
                          item={child}
                          className={`block rounded-lg border-l-2 py-2.5 pl-4 text-base transition-colors ${
                            isLinkActive(pathname, child.href)
                              ? "border-brand-600 text-brand-700 dark:text-brand-200"
                              : "border-transparent"
                          }`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
          {joinUrl && (
            <li className="pt-2">
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="btn-cta block w-full text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <IconDiscord size={18} />
                  Join the community
                </span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
