# Accessibility Improvements

## Goal
Make Ur Gay Now usable by people with different visual, motor, cognitive, and sensory needs.

## Requirements
- WCAG-oriented colour contrast.
- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Proper heading hierarchy.
- Labels for form controls.
- Accessible error messages.
- Alt text for meaningful images.
- Decorative images marked appropriately.
- Font sizing that remains readable.
- Support browser zoom.
- Reduced-motion preference.
- Avoid colour-only status indicators.
- Sufficient touch target sizes.

## Implementation notes

### Global foundation (`app/globals.css`)
- `*:focus-visible` applies a 2px brand ring with offset on every focusable element.
- `prefers-reduced-motion` disables all animations, transitions, and `scroll-behavior: smooth` globally.
- Skip link (`app/layout.tsx`) is visually hidden until focused and jumps to `<main id="main">`.
- Headings use `text-wrap: balance` for readable wrapping at any width.

### Keyboard navigation
- All interactive elements (links, buttons, form controls) are reachable via Tab.
- Cards expose `focus-visible` rings so keyboard users can see where they are.
- The admin sidebar collapses to a bottom sheet on mobile (touch + keyboard).

### Visible focus indicators
- Global `*:focus-visible` ring (see above). No element removes focus outlines.

### Semantic HTML
- `<main id="main">` landmark, `<article>` for cards, `<time>` for dates, `<header>`/`<footer>` regions.
- Form controls use `<label htmlFor>` pairs; every input has a matching label.
- `app/page.tsx` hub uses a single `<h2>` ("What's Happening?") so the page has a clear `h1 → h2` hierarchy.

### Labels for form controls
- Every `<input>`, `<textarea>`, and `<select>` in `EventForm`, `AnnouncementForm`, and admin forms has a `<label className="field-label" htmlFor>`.

### Accessible error messages
- Admin server actions redirect with `?error=1` on failure. `components/admin/ErrorAnnouncer.tsx` reads the param, renders an `<h2 aria-live="assertive" tabindex="-1">` (screen-reader-only), and moves focus to it so screen-reader users hear the failure.
- Wired into `app/admin/events/[id]/page.tsx` and `app/admin/announcements/[id]/page.tsx` via `<Suspense>`.

### Alt text for meaningful images
- `next/image` is used for all meaningful images with descriptive `alt` (e.g. `app/admin/reports/[id]/page.tsx` submission image).
- Decorative images (event cover backgrounds, host avatars) use `alt=""` + `aria-hidden` so screen readers skip them.

### Font sizing and zoom
- Base font is `text-base` (16px) with `leading-relaxed`. Headings are `rem`-based, so browser zoom scales everything proportionally.
- No fixed-width containers — all use `max-w-7xl` + fluid `px-4`.

### Reduced-motion preference
- Global CSS rule disables all `animation-*`, `transition-*`, and `scroll-behavior` under `prefers-reduced-motion`.
- `ScrollAnimation` (`components/ScrollAnimation.tsx`) checks the same media query before mounting scroll-driven effects.

### Colour-only status indicators
- `EventCard` pairs the Live/Upcoming/Past colour classes with text labels ("Live Now", "Upcoming", "Past") and an animated dot — never colour alone.
- `StatusPill` and `RoleBadge` always include a text label, never icon-only.

### Touch target sizes
- All buttons, links, and form controls are at least 44px tall/wide on mobile (see 18-Better-Mobile-UI).
- `DiscordWebhookPanel` role chips are tap-sized with visible focus rings.

## Acceptance criteria
Major journeys can be completed using keyboard navigation and remain understandable with reduced motion enabled.

Additionally:
- `tsc --noEmit` and `next lint` pass with no accessibility errors.
- Every meaningful image has descriptive alt text; decorative images are marked `alt=""` + `aria-hidden`.
- Form errors are announced to screen readers via `ErrorAnnouncer`.
- Focus rings are visible on every interactive element.
- Reduced motion is respected globally.
- Heading hierarchy is `h1 → h2 → h3` with no skipped levels.

## Referenced by
Accessibility requirements defined here apply across the UI and are consumed by: 04-Live-Now-Events, 08-Better-Gallery, 18-Better-Mobile-UI.
