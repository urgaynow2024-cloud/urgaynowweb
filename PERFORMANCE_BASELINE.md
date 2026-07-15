# Performance Baseline Report
**Date:** 2026-07-15
**Project:** Ur Gay Now (urgaynow.com)
**Framework:** Next.js 14.2.35 (App Router)
**Runtime:** Node.js / Vercel Edge
**Database:** PostgreSQL (Supabase) via Prisma 5.22.0

---

## Current Architecture

| Layer | Details |
|-------|---------|
| **SSR/CSR** | Mixed. All pages currently `force-dynamic` (SSR on every request). |
| **ISR/SSG** | **None.** `force-dynamic` on 32 pages disables all static optimization. |
| **CDN** | Vercel Edge Network (implied by Vercel deployment). |
| **Caching** | Only `_next/static/*` has long-lived cache headers. HTML/API have no explicit caching. |
| **Compression** | Vercel default (Brotli/gzip). |
| **Images** | Next.js `Image` component used in some places; 16 `<img>` tags bypass optimization. |
| **Fonts** | System fonts only (no web font downloads). Good baseline. |
| **Analytics** | Vercel Analytics + Speed Insights. |
| **Theme** | Client-side `dark` class toggle with inline init script. |

---

## Route Analysis

### Public Pages (32 total with `force-dynamic`)

| Route | Current Setting | Target Setting | Notes |
|-------|----------------|----------------|-------|
| `/` | `force-dynamic` | `revalidate = 60` | Hero + 3 async sections. ISR safe. |
| `/about` | `force-dynamic` | `revalidate = 300` | Static content + shop previews. |
| `/events` | `force-dynamic` | `revalidate = 60` | Paginated event list. |
| `/gallery` | `force-dynamic` | `revalidate = 60` | Paginated gallery. |
| `/news` | `force-dynamic` | `revalidate = 60` | Paginated announcements. |
| `/news/[slug]` | `force-dynamic` | `revalidate = 300` | Individual article. |
| `/guides` | `force-dynamic` | `revalidate = 300` | FAQ/guides. |
| `/rules` | `force-dynamic` | `revalidate = 3600` | Static rules. |
| `/partners` | `force-dynamic` | `revalidate = 3600` | Static partner list. |
| `/staff` | `force-dynamic` | `revalidate = 300` | Staff directory. |
| `/links` | `force-dynamic` | `revalidate = 3600` | Static links. |
| `/support` | `force-dynamic` | `revalidate = 3600` | Static support content. |
| `/shop` | `force-dynamic` | `revalidate = 300` | Shop showcase. |
| `/groups/[id]` | `force-dynamic` | `revalidate = 300` | Group photo detail. |
| `/search` | `force-dynamic` | `revalidate = 60` | Search results. |
| `/status` | `force-dynamic` + `revalidate = 30` | `revalidate = 30` | Remove `force-dynamic`, keep ISR. |
| `/api` | `force-dynamic` | N/A (redirect) | No change needed. |

### Admin Pages

| Route | Current Setting | Recommendation |
|-------|----------------|----------------|
| `/admin` | Dynamic (via layout) | Keep dynamic. Auth required. |
| `/admin/shop` | Dynamic | Keep dynamic. |
| `/admin/gallery` | Dynamic | Keep dynamic. |
| `/admin/announcements` | Dynamic | Keep dynamic. |
| `/admin/moderation` | Dynamic + `revalidate = 60` | Keep dynamic. |
| `/admin/status` | `force-dynamic` | Keep dynamic. |
| Other admin | Dynamic | Keep dynamic. |

---

## Identified Bottlenecks

### 1. Universal `force-dynamic` (CRITICAL)
Every public page is server-rendered on every request. This eliminates:
- Static HTML generation
- ISR caching at the edge
- CDN HTML caching
- Faster TTFB from cached responses

**Impact:** All 15 public routes have unnecessarily high TTFB and server load.

### 2. N+1 Queries in Status System (HIGH)
`lib/status/health.ts`:
- `ensureDefaultServices()`: 16 sequential `upsert` calls (line 204-210)
- `runHealthChecks()`: Per-service sequential `create` + `update` (line 237-258)
- `computeUptime()`: 4 sequential queries per service (line 93-100)
- `admin/status/page.tsx`: `UptimeMini` renders 9 sequential `computeUptime()` calls (line 163-165)

**Impact:** Admin status page makes 36+ sequential DB queries for uptime data alone.

### 3. Unoptimized Images (MEDIUM-HIGH)
16 `<img>` tags bypass Next.js Image optimization:
- `GalleryGrid.tsx`: 1
- `PartnerCard.tsx`: 1
- `ShopGallery.tsx`: 3
- `about/page.tsx`: 1
- `admin/shop/page.tsx`: 1
- `admin/gallery/page.tsx`: 2
- `admin/GroupPhotoManager.tsx`: 1
- `admin/partners/page.tsx`: 1
- `admin/ui/Avatar.tsx`: 1
- `gallery/submit/GallerySubmissionForm.tsx`: 1
- `admin/ImageUpload.tsx`: 1

**Impact:** Missing WebP/AVIF, automatic resizing, lazy loading, blur placeholders.

### 4. Heavy Client Components (MEDIUM)
- `AdminShell.tsx`: 390 lines, 30+ icon imports, complex state
- `Header.tsx`: 212 lines, mobile menu state
- `StatusBanner.tsx`: Client component with `fetch`
- `ApiExplorer.tsx`: Client component with `fetch`

**Impact:** Increased JS bundle size for admin pages.

### 5. Database Index Gaps (MEDIUM)
Current indexes in `schema.sql`:
- `Staff_vrchatUsername_key` (unique)
- `Announcement_slug_key` (unique)
- `ShopDesign_published_idx`
- `ShopDesign_featured_idx`

Missing indexes for common queries:
- `Event(published, startDateTime)` - used in homepage and events page
- `GalleryImage(status, createdAt)` - used in gallery and moderation
- `Announcement(published, publishedAt)` - used in news and homepage
- `Rule(sortOrder, category)` - used in rules page
- `Guide(sortOrder, category)` - used in guides page
- `Partner(sortOrder, name)` - used in partners page
- `GroupPhoto(createdAt)` - used in moderation
- `HealthCheck(serviceId, checkedAt)` - used in status uptime

### 6. next.config Issues (LOW-MEDIUM)
- `eslint.ignoreDuringBuilds: true` - Lint errors don't block deploys
- No compression headers configured (Vercel handles this)
- No `output: 'standalone'` for Docker

### 7. Console Statements (LOW)
38 `console.error`/`console.warn` statements in production code paths.

---

## Bundle Size Estimates

| Asset | Estimated Size | Notes |
|-------|---------------|-------|
| `globals.css` | ~15 KB (minified) | Tailwind + custom components |
| JS initial bundle | ~150-200 KB | Includes React, Next.js, all client components |
| `react-markdown` + `remark-gfm` | ~50-80 KB | Tree-shaken via `optimizePackageImports` |
| Admin icons | ~20-30 KB | 40+ inline SVG components |
| Vercel Analytics | ~5 KB | Injected by script |

---

## Recommendations Summary

1. **Remove `force-dynamic` from all public pages** and use appropriate ISR `revalidate` values.
2. **Batch DB operations** in status health checks using `Promise.all` and `$transaction`.
3. **Replace `<img>` with `next/image`** in all 16 locations.
4. **Add missing database indexes** for common query patterns.
5. **Remove `eslint.ignoreDuringBuilds`** from `next.config.mjs`.
6. **Optimize admin icon imports** - import only used icons.
7. **Add compression and cache headers** for HTML responses.
