# UGN Homepage Performance — After

**Baseline:** [`baseline.md`](./baseline.md)
**Baseline commit:** `0000889`
**Date:** 2026-10-01

---

## Measurement status

**Core Web Vitals are still NOT MEASURED.** This environment has no browser or
Lighthouse. The table below therefore reports only what can be verified from the
source tree and the production build, plus the fixed defects. No LCP/INP/CLS/FCP
/TTFB numbers are claimed — the audit forbids inventing them.

**Deployment verification is also outstanding.** Nothing here has been tested
against production. See "Remaining work".

---

## Results

```text
                              BEFORE        AFTER        CHANGE
Route / bundle size          4.67 kB       4.88 kB       +0.21 kB
First Load JS (/, gz)         119 kB         119 kB       unchanged
Shared JS (all routes)        87.4 kB        87.4 kB       unchanged

DB round-trips, cold lambda      16            11           -5
DB round-trips, warm cache      16             9           -7
Network requests, client       +1             0            -1
IntersectionObservers         ~2x N           ~1x N       ~halved
Canvas redraw rate             60 fps         30 fps       halved
```

### What the numbers mean

**The bundle did not shrink, on purpose.** The route grew by 0.21 kB. Nothing
here was a bundle-size problem, and the audit's §12/§13 bundle work was already
healthy (see "already healthy" in `baseline.md`). The gains are in runtime work:
database round-trips, network requests, and main-thread timers. Chasing
First Load JS would have meant removing features, which the audit forbids.

---

## Changes made

### P0 — correctness and unbounded data growth

**1. Gallery preview was publishing moderation-pending images**
`app/page.tsx` — added `where: { status: "APPROVED", published: true }` to
match `app/gallery/page.tsx:58-61`, and added `select: { id, title, imageUrl }`.

This was a live data leak of unreviewed and *rejected* submissions onto the
public homepage. Fixed alongside the performance work because the same query
change fixes both.

**2. Event query loaded the entire event archive**
`app/page.tsx` — the query had no `take` and no date bound, so it fetched every
published event ever created, including finished ones, each carrying full
Markdown `description` + `rules`. Now bounded by a 30-day lookback plus a
`take: 24`, and reduced to the 13 columns the card actually renders.

The bound is safe by construction: `getEventState` (`lib/event-utils.ts:91`)
can only return `LIVE`/`UPCOMING` for an event that started within the window or
has not finished. The `OR: [{ startDateTime: { gte: lookback } }, { endDateTime: { gt: now } }]`
clause preserves live events with no end time. The `(published, startDateTime)`
index at `prisma/schema.prisma:195` was already present and unused.

**3. Every homepage query read whole rows**
`app/page.tsx` — added explicit `select` to announcements, events, staff,
gallery and polls. This is what removes the Markdown bodies, the
`discordMessageId` / `discordRoleIds[]` / `discordPostStatus` Discord delivery
plumbing, `voteLimit`, `resultsVisibility` and `submitterName` from the
homepage's data path.

Announcements also now filter `publishedAt: { not: null }` in SQL rather than
discarding rows in JS.

**4. Redundant theme request on every page load**
`components/ThemeProvider.tsx` — `SeasonalThemeProvider` fetched
`/api/theme/active` with `cache: "no-store"` on mount, duplicating the
server-side resolve at `app/layout.tsx:56` and reaching the database again
because that route is `revalidate = 0`. The context is now seeded from the
already-resolved server value passed as `initialThemeId`.

`refresh()` is retained and still fetches, but nothing calls it. Only
`seasonalTheme` is consumed (`components/admin/ThemeStatus.tsx:9`), which is now
correct on the first frame instead of after a round-trip.

**5. Settings were read 5 times per render, uncached**
`lib/settings.ts`, `app/page.tsx` — the hero needed 4 settings and the layout
header needed a 5th read of one of them. Added `getSettings(keys)` for a single
batched read, and wrapped `getSetting` / `getAllSettings` in `unstable_cache`
under a `site-settings` tag, plus React `cache()` to collapse duplicate reads
within one render.

Settings are public and non-sensitive (taglines, invite URLs, contact details).
Staleness is bounded: `lib/settings.ts` is the **only** module in the codebase
that writes to the `Setting` table (verified — 2 matches, both in that file), and
both writers call `revalidateTag("site-settings")`. Admin saves therefore still
appear immediately, and this does not touch the private-data caching rule in the
audit because nothing sensitive is cached.

### P1 — main-thread work (INP)

**6. Countdown timer never cleared**
`components/EventCountdown.tsx` — once the target passed, the 1 Hz
`setInterval` kept running for the life of the page while rendering `null`.
Separately, expiry and visibility were conflated into one state, so a
`visibilitychange` handler could restart an expired countdown. Split into
`expired` and `inView`; the timer now stops on expiry, pauses when the countdown
is scrolled out of view, and pauses in a background tab. Timers are aligned to
the boundary so no tick is visibly skipped.

**7. Event card timer ran on finished events, forever**
`components/EventCard.tsx` — the 30 s interval ran for all cards including
`PAST`/`ARCHIVED` ones, which can never change state. Now gated on
`isLive || isUpcoming`, aligned to the minute, and refreshed on tab focus.

**8. Canvas particle loop was unconditional and unthrottled**
`components/HeroBackground.tsx` — throttled to 30 fps, and the O(n²) link loop
now compares squared distances (and early-exits on the per-axis bound) so the
`Math.sqrt` is only paid for pairs that actually draw. The loop pauses when the
hero leaves the viewport or the tab is hidden. `50 particles` and the visual
result are unchanged.

### P2 — redundant observers

**9. Doubled IntersectionObservers**
`components/ScrollAnimation.tsx` — `StaggeredList` wrapped each child in
`ScrollFadeIn`, and every call site wrapped each child in `ScrollFadeIn` again.
`StaggeredList` now detects a child that is already a `ScrollFadeIn` and renders
it as-is instead of nesting a second wrapper.

This halves the observer count on the homepage, and on `/events`, `/news`,
`/about`, `/links`, `/rules` and `/partners`. The removed wrapper carried only
the class `stagger`, which has **no CSS rule** in `app/globals.css` — the
per-item delays set by the call site are preserved, so the visible animation is
unchanged.

---

## Also fixed

`app/page.tsx:391` counted gallery images with `status: "APPROVED"` but without
`published: true`, so the "Community photos" stat could disagree with the
gallery preview above it. Now matches.

`lib/event-utils.ts` — `EventCardSource.tags` is now optional. `toEventCard`
never reads it, and the homepage's narrowed `select` correctly omits it.
`EventSearchSource` re-declares it as required, so `eventMatchesSearch` is
unchanged.

---

## Verification performed

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass, no errors |
| `npm run lint` | pass, no warnings |
| `npm run build` | pass, 45 routes, homepage still statically prerendered |

**Not yet verified — required before deployment.** These need a running app or
production and cannot be checked from here:

- [ ] Homepage renders all sections
- [ ] Events section, including LIVE and UPCOMING cards
- [ ] Announcements, polls, community highlights
- [ ] Staff section and full staff directory
- [ ] Gallery preview and gallery page
- [ ] Report button and modal
- [ ] Legal pages, rules, support
- [ ] Authentication and admin permissions unchanged
- [ ] Admin settings save reflects immediately (validates the new cache tag)
- [ ] Seasonal theme still applies on the first frame with no flash
- [ ] Scroll fade-in animations still run
- [ ] Canvas hero animation still runs and pauses correctly

---

## Remaining bottlenecks — documented, not changed

Per audit §32, these are recorded instead of being changed, because each needs a
device measurement first and could alter the visual identity.

| Area | Detail | Why not changed |
| --- | --- | --- |
| **Blur radii** | `app/globals.css:418` — 6 hero blobs at `blur(60px)` over a `min-h-[90vh]` hero, plus `blur(80px)` at `:456`, `blur(28px)` fog at `:1021`, `blur(22px)` hero fog at `:1257`. Expensive on low-end GPUs. | Audit §18 says do not remove immediately; test desktop, laptop, mobile and low-power devices first, and change only the specific effect that drops frames. |
| **Animation count** | ~25 simultaneous infinite animations in the Halloween layer (`globals.css:1074-1255`, `:1630-1648`) with `contain: strict` on the layer. | Same as above. |
| **Duplicate brand image `priority`** | `public/brand/CutieLookingBack.png` uses `priority` in 4 places on the homepage route (`Header.tsx:132`, `Footer.tsx:30`, `loading.tsx:24`, `error.tsx:47`). Only the header one is above the fold. | `loading.tsx` and `error.tsx` are separate entry points, but trimming `priority` needs a preload-conflict check in the Network panel to avoid regressing LCP. |
| **`/gallery` page** | `app/gallery/page.tsx:53-65` loads all `communitySubmission`, `galleryImage` and `groupPhoto` rows, then paginates in JS at `PER_PAGE = 12`. | Real problem, but it is not the homepage. Recommended as the next pass. |
| **`lib/nav.ts`** | `prisma.link.findMany` returns the whole `Link` table with no `active` filter and no `select`, cached 300 s. | Needs a check that the footer intentionally does not filter by `active` before changing it. |
| **Admin invalidation breadth** | Every admin mutation calls `revalidatePath("/", "layout")`, purging the whole root layout cache (header, footer, theme) for any single edit. | Caching headers were flagged in audit §3 as intentionally configured. Reducing this needs an invalidation design, not a one-line change. |
| **Upload-time resize** | `lib/upload.ts` stores the original file to Vercel Blob with no resize or re-encode, so `next/image` optimizes full-size originals at request time. | Adding server-side resizing on upload changes the image pipeline. Worth doing, but as its own change with image-quality verification. |

## Functional regression testing

**NOT PERFORMED.** Requires a running application. No report, Discord
notification, or any other production write was made during this pass — this was
source-level analysis and local builds only.