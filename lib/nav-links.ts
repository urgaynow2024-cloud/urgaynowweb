export type NavLink = { label: string; href: string };

export type SocialLink = { label: string; url: string };

export type NavLeaf = NavLink;

export type NavGroup = { label: string; children: NavLink[] };

export type NavItem = NavLeaf | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return (item as NavGroup).children !== undefined;
}

/** True when `pathname` matches `href` (or is nested under it, except for "/"). */
export function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Primary navigation, grouped so the header exposes only the most important
 * destinations. Every existing page stays reachable — either directly or
 * inside a dropdown. "Search" is intentionally omitted here and rendered as
 * an icon-only control in the header.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Community",
    children: [
      { label: "Events", href: "/events" },
      { label: "News", href: "/news" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Guides", href: "/guides" },
      { label: "Links", href: "/links" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "About", href: "/about" },
      { label: "Rules", href: "/rules" },
      { label: "Staff", href: "/staff" },
      { label: "Partners", href: "/partners" },
    ],
  },
  { label: "Shop", href: "/shop" },
  { label: "Support", href: "/support" },
  { label: "Status", href: "/status" },
];
