# What's Happening Homepage

## Goal
Make the homepage feel like a living community hub instead of a collection of disconnected pages.

## Section
Create a primary **What's Happening?** area containing:
- Live Now events
- Upcoming events
- Latest announcement
- Community highlights
- Active polls
- Recent gallery submissions

These are composed of shared components from 24-Shared-Design-System-and-UX; this document owns the content and ordering of the homepage hub.

## Homepage hub ordering (app/page.tsx)
The hub is a single scrollable feed, ordered so a visitor understands the community within seconds:

1. **Hero** — welcome message, join/Discord/VRChat CTAs.
2. **What's Happening?** — hub heading with a clock icon and a one-line summary of what's below.
3. **Live Now + Upcoming events** — `HomeEvents` (server component). Live events render first with a pulsing "Live Now" banner; upcoming events follow with countdowns. Falls back to an empty state when nothing is scheduled.
4. **Latest announcements** — `HomeAnnouncements` (server component), latest 3 published.
5. **Active polls** — `HomePolls` (server component). Renders up to 3 open polls with their first 3 options and a "Vote" link to `/polls`. Hidden entirely when no polls are open.
6. **Community highlights** — `CommunityHighlights` (server component). Live counts of staff, published events, and approved gallery images.
7. **Meet the team** — `HomeStaff` (server component), top 6 staff by sort order.
8. **From the community** — `HomeGallery` (server component), latest 4 approved images.

## Component responsibilities
- `HomeEvents` — loads published events, splits into `LIVE`/`UPCOMING` using `getEventState(event, now)`, renders `EventCard`.
- `HomeAnnouncements` — loads the 3 latest published announcements, renders `AnnouncementCard`.
- `HomePolls` — loads up to 3 open (`published: true, closed: false`) polls with their options, renders a card per poll with a link to `/polls`.
- `CommunityHighlights` — runs three `count()` queries in parallel and renders stat cards.
- `HomeStaff` — loads the top 6 staff, renders `StaffCard`.
- `HomeGallery` — loads the latest 4 approved images, renders a responsive grid.

## UX
- Prioritise a small number of useful items with clear links to full pages.
- Each section has a "View all" link to its full page (`/events`, `/news`, `/polls`, `/staff`, `/gallery`).
- Sections are wrapped in `Suspense` with skeleton fallbacks so the page streams rather than blocking.
- Live events re-evaluate state client-side every 30s via `EventCard`'s interval.
- Empty states are friendly and specific ("Nothing on the horizon", "No announcements yet").

## Accessibility
- The hub heading is a real `<h2>` so the page has a clear landmark hierarchy.
- All cards expose focus-visible rings (global `*:focus-visible` in `app/globals.css`).
- Live-event indicator uses an animated dot plus text — never color-only.

## Security
- All homepage data is read-only. No route or component grants permissions based on what's displayed here.

## Acceptance criteria
A visitor can understand what is happening in the community within seconds of landing on the homepage.

Additionally:
- The hub renders in the order above on desktop and mobile.
- Polls, announcements, events, staff, and gallery sections all render from server-side Prisma queries — never client-supplied.
- Sections degrade gracefully: empty polls render nothing, empty events render a friendly empty state.
- `tsc --noEmit` and `next lint` pass.
