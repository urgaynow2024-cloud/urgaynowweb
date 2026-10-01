# UGN Homepage Performance — Baseline

**Audit:** `UGN_PERFORMANCE_AUDIT.md`
**Route measured:** `/` (homepage)
**Git commit:** `0000889` — "Add community reviews page with staff moderation"
**Date of this record:** 2026-10-01

---

## Measurement status — read this first

**Core Web Vitals (LCP / INP / CLS / FCP / TTFB) have NOT been measured.**

The environment used for this pass has no browser, no Chrome, and no Lighthouse,
so no honest field or lab vitals can be recorded here. The audit document is
explicit that made-up numbers must not be reported, so those fields are left
marked `NOT MEASURED` rather than filled in.

What *is* measured in this document is **verifiable from the source tree and the
production build**, and is reported with exact file references.

To complete this document, run Lighthouse (desktop + mobile, cold + warm cache)
against `https://www.urgaynow.com/` and fill in the tables at the bottom.

---

## 1. Database work per homepage render

Counted by reading every Prisma call reachable from `/`. Cold = first request on
a fresh lambda, where no memo/cache is warm.

| Call site | Query | Cold |
| --- | --- | --- |
| `app/page.tsx` `HeroContent` | `setting.findUnique` x4 (`homeIntro`, `siteTagline`, `discordInvite`, `vrchatGroupUrl`) | 4 |
| `components/HeaderWrapper.tsx:5` | `setting.findUnique` (`discordInvite` — duplicate of the hero read) | 1 |
| `app/layout.tsx:56` | `siteTheme.findFirst` (+ `schedules`) | 1 |
| `components/Footer.tsx:7` | `link.findMany` + `setting.findMany` (whole `Link` table) | 2 |
| `app/page.tsx:115` | `announcement.findMany` (take 3, **no `select`**) | 1 |
| `app/page.tsx:153` | `event.findMany` (**every published event ever**, no `take`, no `select`) | 1 |
| `app/page.tsx:221` | `staff.findMany` (take 6, **no `select`**) | 1 |
| `app/page.tsx:258` | `galleryImage.findMany` (take 4, **no `where`, no `select`**) | 1 |
| `app/page.tsx:310` | `poll.findMany` + `options` (take 3, **no `select`**) | 1 |
| `app/page.tsx:389-391` | `staff.count` + `event.count` + `galleryImage.count` | 3 |

**Total: 16 database round-trips + 1 `fs.existsSync`** (`lib/halloween-icon-server.ts:18`).

### Rows and columns actually transferred

The query *count* is not the main cost — the **row width** is. Several queries
returned entire rows and discarded most of the data in JS:

- **Events** — every published event in the database, including finished and
  archived history, each carrying the full Markdown `description` **and**
  `rules`, `coverImage`, `tags[]`, `summary` and `discordRoleIds[]`. The homepage
  renders at most a handful of LIVE/UPCOMING cards and never uses `rules` or
  `tags` at all.
- **Announcements** — 3 rows including the complete Markdown `content` body,
  `discordMessageId`, `discordPosted`, `discordPostStatus`, `discordRoleIds[]`,
  `scheduledAt`, `authorId`. The card renders 5 fields.
- **Polls** — 3 rows plus all options, including `discordPosted`,
  `discordPostedAt`, `discordPostStatus`, `discordRoleIds[]`, `allowAnonymous`,
  `voteLimit`, `resultsVisibility`, `startAt`, `endAt`.
- **Staff** — 6 full rows (11 columns) where 7 are used.
- **Gallery** — 4 rows including `status`, `submitterName`,
  `rejectionReason`, `reviewedAt`, `published`, where 3 are rendered.

**This grows without limit as content is added.** The event and announcement
tables are append-only archives, so their cost grows with site age, not with
traffic.

### Correctness defect found (not a performance issue)

`app/page.tsx:258` had **no `where` clause at all**. It rendered the four most
recent `GalleryImage` rows regardless of moderation state, while
`app/gallery/page.tsx:58-61` correctly filters on `status: "APPROVED", published: true`.

That means **pending, rejected and unpublished community submissions were being
published on the public homepage.** Fixed in this pass. It also removes a live
performance variable: unreviewed submissions were rendering as broken images.

---

## 2. Client-side work on the homepage

| Issue | Location | Effect |
| --- | --- | --- |
| Redundant theme fetch | `components/ThemeProvider.tsx:66` | `fetch("/api/theme/active", {cache:"no-store"})` on **every page load**, duplicating the server-side resolve at `app/layout.tsx:56`. The route is `revalidate = 0` so it always reached the database. +1 blocking network request per navigation. |
| Countdown timer never stopped | `components/EventCountdown.tsx:33-38` | `setInterval` at 1 Hz per countdown. Once the target passed, `calculateTimeLeft` returned `null` but **the interval was never cleared** — a 1 Hz timer re-rendering forever. |
| Unthrottled canvas loop | `components/HeroBackground.tsx:122-200` | `requestAnimationFrame` ran unconditionally at display refresh rate, with an O(n²) pair loop over 50 particles (1 225 `Math.sqrt` calls per frame). Never paused when the hero scrolled out of view. |
| Duplicate IntersectionObservers | `components/ScrollAnimation.tsx:73-98` + `app/page.tsx` | `StaggeredList` wraps each child in `ScrollFadeIn`, but every homepage call site *also* wrapped each child in `ScrollFadeIn`. Two observers and two nested transition delays per card. |
| Per-card 30 s timer | `components/EventCard.tsx:16-19` | Independent 30 s interval per event card, also running on finished events that can never change state, and never paused in a background tab. |

---

## 3. Build output — `npm run build` at commit `0000889`

Measured by stashing all changes and rebuilding HEAD.

```text
Route (app)                    Size      First Load JS
┌ ○ /                          4.67 kB    119 kB
+ First Load JS shared by all              87.4 kB
```

Route `/` is statically prerendered (`○`), `revalidate = 60`.

---

## 4. What was already healthy — do not "fix" these

Confirmed by audit, so these are recorded to avoid unnecessary churn:

- **Fonts** — no `next/font`, no Google Fonts, no `@font-face`, no `@import`.
  The site uses a single system font stack (`app/globals.css:5`). Zero font
  requests. Nothing to do.
- **Images** — the repo contains 4 image files total. All avatars are rendered
  through `next/image` with AVIF/WebP enabled and `minimumCacheTTL: 86400`
  (`next.config.mjs:40-47`). There are only 2 raw `<img>` tags in the codebase
  and neither is on the homepage. There is **no large original in `/public`**
  worth resizing.
- **Admin code on public routes** — already clean. All 21 `/api/*` handlers are
  staff-gated server-side; no admin or moderation code is bundled into `/`.
- **Third-party scripts** — only `@vercel/analytics` and
  `@vercel/speed-insights`, both already installed. No widgets, no embeds, no
  iframes, no social SDKs.
- **ISR** — public pages already carry sensible `revalidate` values, and
  `/api/*`, `/admin/*`, `/report/*` are correctly forced `private, no-store`.

---

## 5. Baseline vitals — TO BE FILLED

Run Lighthouse against `https://www.urgaynow.com/`, mobile and desktop, cold
and warm cache, on a build of commit `0000889`.

```text
Desktop:
LCP:            NOT MEASURED
INP:            NOT MEASURED
CLS:            NOT MEASURED
FCP:            NOT MEASURED
TTFB:           NOT MEASURED
Transferred:    NOT MEASURED
Requests:       NOT MEASURED

Mobile:
LCP:            NOT MEASURED
INP:            NOT MEASURED
CLS:            NOT MEASURED
FCP:            NOT MEASURED
TTFB:           NOT MEASURED
Transferred:    NOT MEASURED
Requests:       NOT MEASURED
```

Also record, per the audit's Phase 1 list: JS transferred, CSS transferred,
image transferred, font transferred, long tasks, main-thread blocking time.