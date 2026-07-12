"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isLinkActive, type NavLink } from "@/lib/nav-links";

export function NavDropdown({ label, items }: { label: string; items: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupActive = items.some((i) => isLinkActive(pathname, i.href));

  const openMenu = (focus = false) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    if (focus) {
      const firstActive = items.findIndex((i) => isLinkActive(pathname, i.href));
      setFocusIndex(firstActive >= 0 ? firstActive : 0);
    }
  };

  const closeMenu = (focusTrigger = false) => {
    setOpen(false);
    setFocusIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  };

  // Close when clicking outside the dropdown.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onTouchStart(e: TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onTouchStart);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  // Move DOM focus to the active/first item when the menu opens via keyboard.
  useEffect(() => {
    if (open && focusIndex >= 0 && menuRef.current) {
      const els = menuRef.current.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']");
      els[focusIndex]?.focus();
    }
  }, [open, focusIndex]);

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu(true);
    } else if (e.key === "Escape") {
      closeMenu();
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeMenu(true);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIndex(items.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => openMenu()}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
          groupActive
            ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
            : "text-zinc-600 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? "nav-dropdown-menu" : undefined}
        onClick={() => (open ? closeMenu() : openMenu(true))}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        ref={menuRef}
        id="nav-dropdown-menu"
        role="menu"
        aria-label={label}
        onKeyDown={onMenuKeyDown}
        className={`absolute left-0 top-full z-50 mt-2 min-w-[14rem] origin-top rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-card-hover transition-all duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        {items.map((item) => {
          const active = isLinkActive(pathname, item.href);
          return (
            <li key={item.href} role="none">
              <Link
                role="menuitem"
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                    : "text-zinc-700 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-200 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
