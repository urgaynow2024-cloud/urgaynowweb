# Better Mobile UI

## Goal
Make the entire website feel intentionally designed for mobile rather than simply shrinking desktop layouts.

## Breakpoints
Use a single mobile-first responsive scale, defined in the shared design system (24-Shared-Design-System-and-UX):

| Breakpoint | Typical use |
|---|---|
| `sm` (640px) | Two-column cards, stacked headers |
| `md` (768px) | Three-column grids, wider navigation |
| `lg` (1024px) | Desktop navigation, full-width layouts |

The desktop header collapses to a slide-down mobile menu below `lg`. Below `sm`, grids collapse to a single column and horizontal scroll is never allowed.

## Requirements
- **Responsive navigation.** Desktop horizontal nav collapses to a slide-down panel (`components/Header.tsx`) with touch-sized list items (≥44px target), collapsible groups, and an anchored CTA. Dropdowns use hover on desktop and tap-to-expand on touch.
- **Mobile-friendly cards.** Cards stack vertically at phone width, use full content width, and avoid hover-only interactions (see `components/AnnouncementCard.tsx`, `components/StaffCard.tsx`, `components/EventCard.tsx`). Tap targets are at least 44×44px.
- **Touch-sized controls.** Every button, link, and form control has a minimum tap target of 44px (padding or explicit sizing). Icons are paired with text labels on mobile — never icon-only.
- **No horizontal overflow.** All containers use `max-w-7xl` with `px-4 sm:px-6 lg:px-8`. Images and tables must never break the viewport; use `overflow-x-auto` on tables and `object-contain`/`object-cover` on media.
- **Responsive forms.** Fields stack vertically at phone width. Labels use `field-label`, inputs use `input`/`textarea`/`select` (see `app/globals.css`). Multi-column forms collapse to one column below `sm`. Submit buttons are full-width on mobile.
- **Sticky primary actions.** High-frequency actions (join Discord, set event reminder, submit content) stay reachable: the header is `sticky top-0`, and long pages anchor a sticky bottom CTA bar on mobile where a single primary action exists.
- **Optimised image sizes.** Use `next/image` with `sizes` and `priority` for above-the-fold media. Never ship full-resolution uploads; serve responsive variants via Vercel Image Optimization or a CDN. The `ImageUpload` component in the admin enforces max dimensions before upload.
- **Fast loading.** Defer below-the-fold content with `loading="lazy"` or native lazy loading. Keep JS bundle small; only mount client components where interactivity is required. Respect `prefers-reduced-motion` (already wired in `app/globals.css`).
- **Mobile-friendly admin tools where practical.** Admin list pages (`/admin/staff`, `/admin/reports`, `/admin/gallery`) use responsive tables that scroll horizontally on small screens rather than hiding columns. Forms work on touch; the admin sidebar collapses to a bottom sheet or drawer on mobile.

## Performance budgets
- Initial JS < 170KB (gzipped).
- Largest Contentful Paint < 2.5s on 4G.
- Cumulative Layout Shift < 0.1.
- Total blocking time < 200ms on mid-tier mobile.

## Accessibility
- Touch targets meet WCAG 2.5.5 (≥44×44px) and have visible focus rings (already global via `*:focus-visible` in `app/globals.css`).
- Reduced motion is respected globally; scroll animations are disabled under `prefers-reduced-motion`.
- The skip link is available on every page.

## Security
- No client-side-only enforcement of permissions or data visibility (see 25-Implementation-Roadmap). Mobile is a viewport, not a trust boundary.

## Acceptance criteria
Core journeys work comfortably at common phone widths (360–414px), covered by their respective specs:
- Browse events (01-Better-Events-System, 05-Event-Categories-and-Tags)
- Open an event (03-Better-Event-Pages)
- Submit a report (11-Website-Report-System)
- Browse gallery (08-Better-Gallery)
- Search (15-Website-Search)
- Read announcements (06-Better-Announcements-News)
- View a profile (16-User-Community-Profiles)
- Receive notifications (19-Notifications)

Additionally:
- No horizontal overflow on any page at 360px width.
- All interactive controls are at least 44px tall/wide on mobile.
- Desktop and mobile navigation share the same `NAV_ITEMS` source (`lib/nav-links`), so the two never drift apart.
- Performance budgets are met on a mid-tier device over 4G.
- Admin surfaces remain usable on touch without a mouse.