# Better Error & 404 Pages

## Goal
Replace generic or confusing errors with friendly, useful recovery pages.

## 404 (`app/not-found.tsx`)
Show:
- Friendly message
- Search (see 15-Website-Search)
- Return home
- Popular sections
- Previous-page action

### Implementation
- Renders the UGN mascot, a giant "404", and a friendly message.
- **Search** — an inline `SearchBox` (auto-focus off, since the page is a dead end) centered under the message.
- **Return home** — primary CTA `Take me home` (`/`).
- **Previous-page action** — a `Go back` button that calls `window.history.back()` when there is a previous entry, so visitors don't get stuck.
- **Popular sections** — a 6-card grid linking to `/events`, `/news`, `/gallery`, `/staff`, `/polls`, `/links`, each with a one-line description.
- **Helpful links** — secondary button to `/links`.
- Footer line pointing to Discord for bug reports.

## Application errors (`app/error.tsx`)
Provide:
- Human-readable message
- Retry action
- Safe error reference ID where useful
- No stack traces or sensitive implementation details

### Implementation
- Client component (`"use client"`) that receives `error` and `reset` from Next.js.
- Renders the mascot with a red ring and a gentle wiggle animation to signal "something broke".
- **Retry** — primary CTA calling `reset()`, which re-renders the segment that failed.
- **Reference ID** — displays `error.digest` (Next.js assigns this server-side) in a monospace line. This is a stable, safe identifier — never a stack trace.
- **No stack traces** — only `error.message` (short) and `error.digest` are surfaced. The full error object is never rendered.
- **Back to home** — secondary link.

## Staff/debugging
Log detailed errors server-side while keeping public errors safe.

### Implementation
- `lib/error-logger.ts` — a `server-only` helper `logClientError(message, digest, path)` that writes to the `ErrorLog` Prisma model (`prisma/schema.prisma`). It stores only the message (truncated to 500 chars), digest (100), path (500), and user-agent (300) — never stack traces or request bodies.
- The error page calls it in `useEffect` (best-effort; failures are swallowed so logging never crashes the recovery page).
- `ErrorLog` model has indexes on `createdAt` and `digest` so staff can query recent failures by time or by reference ID.
- Migration: `prisma/migrations/20260915120001_add_error_log/migration.sql`.

## Acceptance criteria
Users always have a clear next action when a page cannot be loaded.

Additionally:
- The 404 page includes search, popular sections, home, and a back button.
- The error page shows a human-readable message, a retry button, and a safe reference ID — never a stack trace.
- Errors are logged server-side to `ErrorLog` without exposing sensitive details to the public.
- `tsc --noEmit` and `next lint` pass.
