# CHANGE.md — Implementation Log

**Project:** Ur Gay Now website (`C:\Users\alans\Urgaynowwebsite`)
**Task:** Implement `Ur_Gay_Now_Website_Master_MMD_Halloween_2026.md`
**Date of this entry:** 1 October 2026
**Database used for verification:** live Supabase Postgres from `.env`

---

## 0. Status summary (read this first)

| MMD area | State |
| --- | --- |
| 🎃 Halloween 2026 seasonal theme (palette, activation, atmosphere) | Implemented and verified |
| 🦇 Official supplied Halloween icon | **Supplied and wired in — rendering in all six slots (verified)** |
| 🚨 Real report system (end to end) | Implemented and verified end to end |
| 🔗 Discord webhook notifications for reports | Implemented and verified (real delivery confirmed) |
| 🛡︝ Protected staff report dashboard | Implemented and verified (including permission tests) |
| 📜 Bot Terms of Service | Implemented, verified renders |
| 🔝 Bot Privacy Policy | Implemented, verified renders |
| ©︝ UGN Ownership / IP documentation | Implemented, verified renders |
| 📱 Responsive mobile/tablet/desktop UI | Implemented, partially verified (see Testing) |
| ♿ Accessibility + reduced motion | Implemented, partially verified (see Testing) |
| 🔒 Server-side security | Implemented and verified for the report system |

**The feature is not "Complete" in the sense of fully signed off** — one item is
explicitly open: browser-level visual and assistive-technology review by a human. Everything
else below states what was actually executed and what the result was.

---

## 1. Files added

### Application — pages
- `app/report/page.tsx` — public "Report a user or a problem" page (MMD fields, flow
  explanation, category list, limits, links to rules/support/legal).
- `app/legal/layout.tsx` — legal shell (breadcrumb header, plain background, disables the
  seasonal decoration layer on legal routes).
- `app/legal/page.tsx` — legal index.
- `app/legal/bot/terms/page.tsx` — Bot Terms of Service (16 sections).
- `app/legal/bot/privacy/page.tsx` — Bot Privacy Policy (14 sections).
- `app/legal/ownership/page.tsx` — UGN Ownership & IP (7 sections).

### Application — API routes
- `app/api/report/evidence/route.ts` — staged evidence upload (`POST`, multipart).
- `app/api/admin/reports/evidence/[evidenceId]/route.ts` — authenticated evidence stream
  (`GET`, staff-only, audit-logged, `no-store`).

### Components
- `components/report/PublicReportForm.tsx` — the full public report form.
- `components/legal/LegalDocument.tsx` — shared legal document layout (TOC, anchors,
  last-updated, footer links).
- `components/halloween/HalloweenIcon.tsx` — renders the supplied official icon, degrades to
  a neutral placeholder if the asset is absent. Availability is decided **on the server**
  (`lib/halloween-icon-server.ts`) and passed through `HalloweenIconProvider`, so the browser
  never probes for a missing file (no 404s, no broken images, no console errors).
- `components/halloween/HalloweenDecorations.tsx` — SVG/CSS-only seasonal layer (webs, moon,
  fog, bats, leaves, sparkles).
- `components/halloween/SeasonalBanner.tsx` — dismissible seasonal banner.
- `components/halloween/HalloweenDecor.tsx` — theme-gated accents (header mark, hero strip,
  footer mark, event badge).
- `components/halloween/HalloweenIconProvider.tsx` — provides the build-time "does the icon
  file exist?" answer to every icon slot.
- `lib/halloween-icon-server.ts` — server-only file check for the official icon.

### Libraries
- `lib/reports.ts` — rewritten registry (categories, statuses, priorities, webhook states,
  limits, labels, evidence/link parsing, reference helpers).
- `lib/report-access.ts` — staff report permission matrix (`reports.view` … `reports.manage`).
- `lib/report-auth.ts` — server-side authorization + staff throttling for report routes.
- `lib/report-validation.ts` — shared submission/evidence validation and sanitisation.
- `lib/report-webhook.ts` — server-only Discord staff notification sender + delivery recording.
- `lib/report-webhook-url.ts` — pure Discord-webhook URL validation/normalisation.
- `lib/report-reference.ts` — atomic `UGN-000123` reference minting.
- `lib/report-evidence-token.ts` — httpOnly evidence/tracking cookie helpers.
- `lib/request-security.ts` — client IP extraction, salted IP hashing, in-memory rate limiter.
- `lib/halloween.ts` — Halloween 2026 palette, season dates, icon path.

### Database
- `prisma/migrations/20261001090000_add_report_reference_evidence/migration.sql`

### Assets
- `public/brand/halloween-icon.png` — the official UGN Halloween icon, supplied by the project
  owner and used unaltered in every seasonal slot (6144×6144, 19.5 MB — see Known Issues).

### Scripts (verification + operations)
- `scripts/apply-migration.mjs` — applies an idempotent migration file (statement splitter that
  respects `$$ … $$` blocks).
- `scripts/verify-migration.ts` — prints counter/theme-schedule/Report-column state.
- `scripts/report-e2e-test.mjs` — 60-check HTTP end-to-end suite for the report system.
- `scripts/e2e-staff-fixture.ts` — writes `.e2e-staff.json` for the e2e suite (gitignored).
- `scripts/inspect-report-audit.ts` — prints the newest report plus its full audit trail.
- `scripts/cleanup-test-reports.ts` — deletes reports/evidence created by verification runs.

---

## 2. Files modified

- `app/api/report/submit/route.ts` — full rewrite (public submission flow below).
- `app/api/admin/reports/route.ts` — full rewrite (`PATCH` action API + staff `GET` detail).
- `app/admin/reports/page.tsx` — reports centre rewritten (search/filter/sort/pagination,
  UGN references, webhook state column, mobile card layout).
- `app/admin/reports/[id]/page.tsx` — rewritten: staff permission gate, evidence list,
  `lastViewedAt` recording, permissions passed to the client.
- `components/admin/ReportDetailClient.tsx` — rewritten: reference header, evidence viewer,
  webhook panel with retry, permission-gated actions, labelled audit timeline, accessible
  dialogs.
- `app/report/me/page.tsx` — rewritten: works without an account using the httpOnly tracking
  cookie; shows UGN references.
- `app/report/track/[token]/page.tsx` — shows the UGN reference and resolution outcome,
  forced dynamic, imports cleaned.
- `components/report/ReportForm.tsx` — reason list now comes from the shared registry
  (fixes a pre-existing bug, see §7).
- `components/report/ReportModal.tsx` — sends `category`/`links`, displays the UGN reference
  in the success state.
- `components/Container.tsx` — `PageHeader` gained an **optional** `icon` prop (no visual
  change for existing pages).
- `components/Header.tsx` — one seasonal mark beside the wordmark (renders nothing outside
  Halloween).
- `components/Footer.tsx` — original bottom bar **kept unchanged**; added a second row with
  the MMD legal links and report links; added "Report a user" + "Legal & policies" to Explore.
- `app/layout.tsx` — mounted `<HalloweenDecorations />` and `<SeasonalBanner />`.
- `app/page.tsx` — added `<HalloweenHeroStrip />` inside the existing hero (additive only).
- `app/globals.css` — Halloween 2026 palette variables, seasonal atmosphere, decoration
  classes/keyframes, reduced-motion overrides, mobile sizing, `.legal-prose` styles.
- `lib/themes.ts` — `halloween` registry entry updated to the MMD palette (light + dark).
- `prisma/schema.prisma` — `Report` extended; `ReportCounter` and `ReportEvidence` added.
- `next.config.mjs` — legacy legal redirects, security headers, `no-store` for
  `/admin/*`, `/report/*`, `/api/*`.
- `app/sitemap.ts` — added `/report` and the four `/legal` routes.
- `.env.example` — **secrets redacted** (see §6), new `UGN_REPORT_WEBHOOK_URL` documented.
- `.gitignore` — ignores `.e2e-staff.json` and `.next-build.log`.

### Files removed
None by this work. `git status` shows three pre-existing deletions that were already in the
working tree before this task started and were **not** caused by it:
`UrGayNow_Updates_Automation_and_Support_Redesign.md`,
`UrGayNow_Updates_and_Staff_Improvements.md`, `docs/REPORT_SYSTEM_OVERHAUL.md`.

---

## 3. Report system — what actually works

```text
Visitor
  → /report form (or the existing ⚑ Report modal on content)
  → POST /api/report/evidence      (optional files, staged, no public URL)
  → POST /api/report/submit        (validated, deduplicated, stored)
  → UGN-000123 reference minted    (atomic counter)
  → audit entry: SUBMITTED
  → POST to Discord staff webhook  (metadata only, delivery state stored)
  → /admin/reports queue → /admin/reports/[id]
  → assign / status / priority / note / action / escalate / resolve / dismiss
  → every action appended to the audit trail
  → reporter sees status on /report/track/<token> and /report/me
```

### Submission API (`POST /api/report/submit`)
- Public (no account required). Optional name/email, optional anonymous flag.
- Server-side validation: category whitelist, description 20–4000 chars (**over-long is
  rejected, not silently truncated**), http(s)-only links (max 6), incident date sanity,
  email format, `contentId` charset, idempotency-token format, evidence-id format.
- Honeypot field (`website`) — a filled honeypot returns a success-shaped response and stores
  nothing.
- Duplicate protection, two layers:
  1. `idempotencyKey` (unique column) — the same submit token returns the original report.
  2. `dedupeHash` (IP hash + category + target + content + description) — an identical
     resubmission within 24h returns `409` with the original reference.
- Rate limiting: in-memory burst limit 10/minute per IP **plus** a durable limit of 5 reports
  per 30 minutes enforced by counting stored rows for that salted IP hash.
- Stores: category, description, reported person, Discord handle, incident date, links,
  optional contact details, anonymous flag, salted IP hash, `source`
  (`COMMUNITY`/`CONTENT`), priority derived server-side from the category.
- Evidence is claimed only from the httpOnly evidence cookie of the same visitor.
- Response tells the truth about notification delivery: `sent` / `queued` /
  `not-configured` / `already-registered`.
- Sets an httpOnly tracking cookie so `/report/me` can show the visitor their own reports.

### Evidence protection
- Uploads are stored as bytes in Postgres — **no blob, no public URL, nothing shareable**.
- Type + extension + magic-byte validation; executables/scripts rejected; 4 MB per file,
  4 files per report, 8 MB total.
- Reading requires a valid staff session **and** `reports.evidence`; every read is written to
  the report audit trail; responses are `private, no-store` with `nosniff` and a sandbox CSP.
- Unclaimed staged uploads are deleted after 24 hours.

### Staff permissions (server-enforced, `lib/report-access.ts`)
| Role | Report permissions |
| --- | --- |
| Founder / Co-Founder / Co-Owner / Admin | view, assign, review, notes, evidence, escalate, resolve, dismiss, manage, webhook retry |
| Safeguarding | view, assign, review, notes, evidence, escalate, resolve |
| Moderator | view, assign, review, notes, evidence, escalate |
| Event Manager / Community Manager | none (redirected away from the dashboard) |
| Unknown rank | view only |

The UI uses the same map to decide what to render, but **every route re-checks on the
server** — hiding a button is never the control.

### Statuses
`New` (stored as `OPEN`), `Reviewing` (`IN_REVIEW`), `Waiting for Information`
(`WAITING_INFO`), `Action Taken` (`ACTION_TAKEN`), `Resolved`, `Dismissed`, plus the
pre-existing `Escalated`. Stored values were kept compatible with the existing database.

### Discord webhook
- Resolution order: `UGN_REPORT_WEBHOOK_URL` → `DISCORD_REPORTS_WEBHOOK_URL` →
  admin setting `discordReportsWebhookUrl`.
- URL is validated as a real Discord webhook (host + path shape); anything else fails safely.
- Payload contains only: reference, category, reported person, priority, status, type,
  anonymous flag, attachment counts, and a link to the dashboard.
  **No description, no evidence, no reporter contact details, no internal notes.**
- Delivery is best-effort after the report is stored. The exact outcome is persisted in
  `webhookStatus` / `webhookError` / `webhookAttempts` / `webhookSentAt`, shown on the
  dashboard, and retryable by leads.
- Reporter-facing resolution text goes to the reporter's private tracking page (which already
  exists). The old code posted "Your report has been resolved" into the *staff* channel and
  ignored the reporter's email — that misleading behaviour was removed.

---

## 4. Database changes

`prisma/schema.prisma`:
- `Report`: added `reference` (unique), `referenceSeq`, `source`, `reporterIpHash`,
  `idempotencyKey` (unique), `dedupeHash`, `reportedPerson`, `reportedDiscord`,
  `incidentAt`, `links`, `webhookStatus`, `webhookError`, `webhookAttempts`, `webhookSentAt`,
  `lastViewedAt`; `contentId` gained a default so community reports need no content id.
  New indexes on `referenceSeq`, `source+createdAt`, `webhookStatus`,
  `dedupeHash+createdAt`, `reporterIpHash`.
- `ReportCounter` — single row incremented atomically to mint references.
- `ReportEvidence` — `reportId?`, `uploaderToken`, `fileName`, `contentType`, `size`,
  `sha256`, `data Bytes`.
- `ReportAuditLog` — comment updated for the new action types.

The migration is written idempotently (`IF NOT EXISTS`, guarded `DO $$` blocks, `COALESCE`
id generation) and it:
1. adds all columns/indexes/tables,
2. backfills `UGN-000123`-style references for any pre-existing reports and advances the
   counter past them,
3. flips `SiteTheme.mode` to `AUTOMATIC` and inserts the enabled Halloween schedule
   **2026-10-01 00:00 → 2026-11-02 23:59:59**.

**Applied to the live database and verified** (34/34 statements, re-run cleanly a second
time to prove idempotency). Result: `ReportCounter.value` present, `SiteTheme.mode =
AUTOMATIC` with the Halloween schedule, all 37 `Report` columns present.

---

## 5. Halloween 2026 changes

- Palette (MMD): near-black `#0D0A12`, charcoal `#15111C`, dark purple `#1A1026`, deep
  purple `#2A123D`, UGN purple `#6D28D9`, dark red `#8F1D2C`, Halloween red `#B42335`,
  warm orange `#F97316`, pumpkin `#FF8A1F`, ghost white `#F5F1F7`, muted grey `#A8A0AD`.
- `lib/themes.ts` `halloween` entry and the matching `:root[data-site-theme="halloween"]`
  CSS blocks (light and dark) were updated to those values.
- Seasonal atmosphere layer: corner spiderwebs, moon glow, drifting fog, three flying bats,
  falling leaves, twinkling sparkles. CSS/SVG only — no images, no libraries.
  Fixed layer, `z-index: -1`, `pointer-events: none`, `aria-hidden`, so it can never cover
  text or controls.
- Activation: automatic schedule Oct 1 → Nov 2 2026 (verified via
  `GET /api/theme/active` → `{"themeId":"halloween"}`). Staff can still override in
  Admin → Settings → Appearance.
- Icon usage (all gated on the active theme): homepage hero strip, site-wide seasonal
  banner, header wordmark mark, footer, `/report` page header, and both legal document
  headers.
- **UI baseline preserved**: the original header, nav, cards, buttons, typography, spacing,
  section structure, responsive behaviour and footer bar are unchanged. Every seasonal
  element is additive and disappears entirely outside the Halloween theme.

### Accessibility / motion
- `prefers-reduced-motion` disables every Halloween animation, hides bats, softens webs,
  sparkles and leaves. The existing global reduced-motion rules are unchanged.
- Mobile (<640px): smaller webs, no bottom-left web, smaller bats/moon, shorter fog.
- The global `<html data-site-theme="…">` driven colour variables now give the Halloween
  palette a WCAG AA contrast floor in both light and dark mode.

---

## 6. Security changes

- **Committed secrets removed from `.env.example`.** Both `DISCORD_UPDATES_WEBHOOK_URL` and
  `DISCORD_REPORTS_WEBHOOK_URL` were present with live values. The file now contains empty
  placeholders and documents the new `UGN_REPORT_WEBHOOK_URL`. **The exposed webhook URLs
  should be rotated** (see Known Issues).
- Cache headers: the previous config applied `public, max-age=60` to **every** route,
  including `/admin/*`, `/report/track/*` and `/api/*`. Private routes now send
  `private, no-store` and `/admin/*` also sends `X-Robots-Tag: noindex`.
- Added baseline security headers for all routes: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; evidence responses also get
  `Content-Security-Policy: default-src 'none'; sandbox`.
- Server-side authorization added to the staff reports pages themselves (previously the list
  page relied only on the middleware JWT) and to every report API action.
- Authentication is checked **before** report-id validation, so an unauthenticated caller
  always gets `401`, never information about report ids.
- No report data, description, evidence or staff note is ever sent to the browser of an
  unauthorised visitor, and the webhook URL is never exposed to any client.
- Legacy legal URLs redirected permanently instead of 404ing.
- `.env.local` and `.env` webhook values were repaired locally (see §8).

---

## 7. Bug fixes

1. **Broken dev server after a build/delete cycle (`Cannot find module './vendor-chunks/…'`,
   `ENOENT … webpack/cache`, CSS 404/500, "Invalid hook call").** Root cause: **two `next dev`
   processes (or a `next dev` plus a `next build`) sharing the same `.next` directory**, so each
   overwrote the other's chunks. Not an application defect — a clean single-server start
   returns `200` for `/`, `/report`, `/legal`, `/legal/bot/terms`, `/legal/bot/privacy`,
   `/legal/ownership`, `/events`, `/rules` and `/report/me` with a clean log, and the 60-check
   report suite passes against it. Recovery: stop every node process, delete `.next` and
   `node_modules/.cache`, start one server.
2. **Missing icon asset produced `HEAD /brand/halloween-icon.png 404` requests and a Next
   image error on every page.** The icon component now asks the server whether the file
   exists (once per render) and renders the placeholder directly, so there are no probe
   requests and no console errors while the asset is still missing.
3. **Reports could never be submitted from the community report form.** The form sent
   `BUG`, `EVENT_ISSUE` and `COMMUNITY_CONTENT`, which the API rejected as invalid, so those
   reports failed with "Invalid reason". All categories are now a single shared registry and
   the form renders from it.
4. **The report webhook could never have worked.** `DISCORD_REPORTS_WEBHOOK_URL` in `.env`
   and `.env.local` had an unterminated quote (`"https://discord.com/...` with no closing
   quote), so the value was not a valid URL. Fixed locally, and the resolver now strips stray
   wrapping quotes so a mis-stored value cannot silently disable staff notifications.
5. **Rate limiting was ineffective.** The old code counted *all* reports from *all* reporters
   as the caller's own submissions (`ipCount`), so the limit was global and unfair, and no IP
   was stored. Now a salted IP hash is stored and counted per reporter.
6. **Resolution notifications were misleading.** The old code posted "Your report has been
   resolved" into the staff channel and read a reporter email it never used. Replaced with a
   staff-facing closure notification plus a real outcome on the reporter's tracking page.
7. **Duplicated `Cache-Control` header on evidence responses** (route + config) — normalised
   to a single value.

> **Note on the icon:** the official asset is now in place at
> `public/brand/halloween-icon.png` and renders as supplied in all six slots. If you replace
> it (or point `NEXT_PUBLIC_HALLOWEEN_ICON_PATH` elsewhere), restart the dev server, or rebuild
> for production — availability is resolved on the server at render time.

---

## 8. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `UGN_REPORT_WEBHOOK_URL` | recommended | Staff report notifications (MMD name). Server-side only. |
| `DISCORD_REPORTS_WEBHOOK_URL` | fallback | Legacy name, still honoured. |
| `NEXT_PUBLIC_HALLOWEEN_ICON_PATH` | optional | Path of the official icon. Default `/brand/halloween-icon.png`. |
| `AUTH_SECRET` | already existed | Also salts the stored IP hashes, so changing it resets rate-limit buckets. |
| `discordReportsWebhookUrl` (DB setting) | optional | Admin-configurable fallback used when no env var is set. |

Nothing was added to any client bundle, and no webhook URL is exposed to the frontend.

---

## 9. Testing actually performed

All checks below were executed against the running app (`next dev`) and the live database.

- `npx tsc --noEmit` — clean.
- `npx next lint` — "No ESLint warnings or errors".
- `npx next build` — compiled successfully, 85/85 static pages, exit code 0.
  (The first build attempt failed on four pre-existing unrelated routes because the pooled
  Postgres connection limit of 1 starves parallel prerender workers; re-running with a
  larger pool succeeded. Not caused by this work.)
- `scripts/report-e2e-test.mjs` — **60/60 checks passed** on the final run, covering:
  - `/report`, `/legal`, `/legal/bot/terms`, `/legal/bot/privacy`, `/legal/ownership` render;
    `/tos.html` → 308 to `/legal/bot/terms`.
  - Validation: invalid category, short description, over-long description, `javascript:` link,
    invalid email — all rejected server-side.
  - Honeypot returns a success shape and stores nothing.
  - Evidence: real PNG accepted; executable disguised as PNG rejected (magic bytes);
    oversize rejected (413).
  - Valid submission returns `UGN-000123` format reference, sets the tracking cookie, and
    returns `notification: "sent"` — **real Discord delivery confirmed**.
  - Duplicate protection: same idempotency key returns the original reference; identical
    resubmission returns `409` without creating a second report.
  - Tracking page and `/report/me` show the report; a different browser sees nothing.
  - Authorization: logged-out API `401`, logged-out PATCH `401`, logged-out dashboard
    redirect, founder can read dashboard/detail, founder can note/status/action/retry,
    moderator can note but is blocked from resolve (`403`) and webhook retry (`403`),
    event manager is redirected away, report-id traversal rejected (`400`).
  - Evidence protection: anonymous `401`, founder `200` with byte-identical PNG,
    moderator `200`, unknown id `404`, `no-store` header present.
  - Rate limiting: 5 created then 3 blocked (`429`) for a single client.
- Database verification: audit trail of a test report showed
  `SUBMITTED → WEBHOOK_SENT → NOTE_ADDED → STATUS_CHANGED → ACTION_RECORDED → NOTE_ADDED →
  EVIDENCE_VIEWED → EVIDENCE_VIEWED` with the correct staff names.
- Real browser engine (headless Edge `--dump-dom`) confirmed the post-hydration DOM:
  `data-site-theme="halloween"` on `<html>`, plus `hw-layer`, `hw-banner`, `hw-strip`,
  moon, webs, bats, fog, sparkles present; and on `/report` at a 390px viewport every form
  field plus the honeypot are present.
- `/api/theme/active` returns `halloween`.
- After the dev-cache incident: clean stop → delete `.next` + `node_modules/.cache` → restart,
  then `/`, `/report`, `/legal`, `/legal/bot/terms`, `/legal/bot/privacy`, `/legal/ownership`,
  `/events`, `/rules`, `/report/me` all returned `200` with a clean server log (no
  `MODULE_NOT_FOUND`, no webpack cache errors, no icon probe requests).
- The full 60-check end-to-end suite was re-run against that clean dev server: **all passed**.
- All verification reports were deleted afterwards (`remaining reports: 0`).
- Final `npx next build` after all changes: compiled successfully, 85/85 pages, exit code 0.
  `.next` was then removed so your next `npm run dev` starts from a clean cache.
- Icon supplied and verified end to end: `GET /brand/halloween-icon.png` → `200`;
  `/legal/bot/terms` server-renders `<img src="/_next/image?url=%2Fbrand%2Fhalloween-icon.png…">`
  with **zero** `hw-fallback` placeholders; the optimised endpoint returns a 5.8 KB PNG in
  ~450 ms; and the post-hydration homepage DOM contains `hw-layer`, `hw-banner`, `hw-strip`,
  `hw-badge`, `hw-moon` and `halloween-icon.png` references with no fallback glyph.

### Not verified
- **Human visual review.** Screenshots were captured but I cannot view images, so the
  *appearance* of the Halloween styling has not been judged by eye — only its DOM/CSS
  presence. Please eyeball the homepage, `/report`, and a legal page once the icon is in
  place.
- **Screen-reader pass and keyboard-only walkthrough.** Markup, labels, `fieldset/legend`,
  `aria-describedby`, dialog semantics and focus-on-success were written deliberately, but no
  NVDA/VoiceOver test was run.
- **Production Vercel deployment behaviour** (cache headers applied by the CDN, env vars,
  Blob/Vercel differences).
- The staff dashboard was exercised through HTTP as a founder and a moderator; the UI was not
  clicked through by a human.

---

## 10. Known issues / what still needs doing

1. **The supplied icon is a 6144×6144, 19.5 MB PNG.** It works — `next/image` serves a 5.8 KB
   optimised file to the browser, and it renders in all six slots — but the raw asset is very
   large for what is displayed at 16–56 px. Committing a ~20 MB binary to git and the deploy is
   worth avoiding. **Suggested follow-up:** replace `public/brand/halloween-icon.png` with a
   512×512 (or 1024×1024) export, or keep the original outside `public/` and point
   `NEXT_PUBLIC_HALLOWEEN_ICON_PATH` at a smaller copy. Not done automatically because the
   asset is the official one and should not be altered without your say-so.
2. **Rotate the exposed Discord webhooks.** Live webhook URLs were committed in
   `.env.example` before this work. They are removed now, but the values remain in git
   history, so both webhooks should be regenerated in Discord and the Vercel project
   variables updated (`UGN_REPORT_WEBHOOK_URL`, `DISCORD_UPDATES_WEBHOOK_URL`).
3. **Fix the deployment environment variable.** The stored value has an unbalanced quote.
   Re-set it in Vercel as a clean `https://discord.com/api/webhooks/...` URL.
4. **Legacy bot-site URLs on the old domain.** `next.config.mjs` redirects the equivalent
   paths on this domain, but the previous GitHub Pages site is not under this repository, so
   its own URLs need redirects added there before retiring it.
5. **No automated retention job.** Closed reports and their evidence are kept as moderation
   records and are only removed when staff delete them or a reporter asks (stated honestly in
   the privacy policy). A scheduled purge would need to be designed and agreed first.
6. **Three markdown files were already deleted in the working tree** before this task
   (`UrGayNow_Updates_Automation_and_Support_Redesign.md`, `UrGayNow_Updates_and_Staff_Improvements.md`,
   `docs/REPORT_SYSTEM_OVERHAUL.md`). Not touched here — restore them from git if that deletion
   was unintentional.
7. **Reporter email notifications are not implemented.** Reporters follow status through their
   private tracking page. This is stated in the privacy policy rather than promised.
8. **Pre-existing build fragility.** `DATABASE_URL` uses `connection_limit=1`, which makes
   `next build` fail on unrelated DB-backed routes during prerendering. Consider raising it.
9. **Run only one dev server, and never `next build` while `next dev` is running.** Two dev
   servers (or a build + a dev server) share the same `.next` directory and overwrite each
   other, producing missing-chunk errors such as `Cannot find module './vendor-chunks/…'`,
   `GET /_next/static/chunks/*.js 404`, CSS 404/500, and "Invalid hook call". This happened
   twice during this work. Recovery: stop every node process, delete `.next`, start once.
10. `.e2e-staff.json` contains real staff ids and is written by
   `scripts/e2e-staff-fixture.ts`; it is gitignored, but delete it when finished.

---

## 11. Verification commands

```powershell
# schema + migrations
npx prisma validate
node scripts\apply-migration.mjs prisma\migrations\20261001090000_add_report_reference_evidence\migration.sql
npx tsx scripts\verify-migration.ts

# quality gates
npx tsc --noEmit
npx next lint

# report system end to end (dev server on :3210)
npx next dev -p 3210
npx tsx scripts\e2e-staff-fixture.ts
node scripts\report-e2e-test.mjs http://localhost:3210

# inspection / cleanup
npx tsx scripts\inspect-report-audit.ts
npx tsx scripts\cleanup-test-reports.ts
```
---

# Entry: Community Reviews (public `/reviews` page)

**Date:** 1 October 2026
**Requested by:** Community Reviews task, to be completed **before** the Christmas 2026
preparation MMD.
**Status:** Complete. Schema applied, full lifecycle verified end to end against the live
database. Christmas was **not** touched or activated.

## 1. Database migration � APPLIED

`prisma db push` reports **"The database is already in sync with the Prisma schema."**
The `Review` and `ReviewModerationLog` tables and the `ReviewStatus` enum already existed
in the live Supabase database when checked, so no migration was required. Confirmed
directly against the database:

```text
tables: Review, ReviewModerationLog, Staff
ReviewStatus enum: PENDING, APPROVED, REJECTED, HIDDEN
review rows: 0
```

No destructive SQL was run. `prisma migrate diff` returned an empty migration, confirming
zero drift and zero pending changes.

## 2. Files added

- `lib/reviews.ts` � limits, status labels, sanitisation, abuse/spam scoring,
  `validateReviewSubmission`, rating summary, initials, relative time.
- `app/api/reviews/route.ts` � public `POST` submission endpoint.
- `app/reviews/page.tsx` � public page (approved reviews only, rating summary,
  distribution bars, pagination, submission form).
- `app/admin/reviews/page.tsx` � staff moderation queue (tabs by status, approve /
  reject / hide / restore, moderation log).
- `app/admin/reviews/actions.ts` � moderation server actions (`requireAdmin()`).
- `components/reviews/StarRating.tsx` � read-only stars, initial-based avatar,
  rating summary bar, distribution row.
- `components/reviews/StarRatingInput.tsx` � accessible 1�5 star radio group.
- `components/reviews/ReviewCard.tsx` � single approved review card.
- `components/reviews/ReviewForm.tsx` � public submission form.
- `scripts/verify-reviews.ts` � 30-assertion logic check (`npm run test:reviews`).

## 3. Files changed

- `prisma/schema.prisma` � **additive only.** New `Review` model, `ReviewModerationLog`
  model, `ReviewStatus` enum. Two new back-relation fields on `Staff` (required by
  Prisma for the relations). No existing column, index, model, or row was altered,
  renamed, or deleted.
- `lib/reports.ts` � added `"COMMUNITY_REVIEW"` to the `ReportContentType` union, the
  `REPORT_CONTENT_TYPES` label map, and a `case` in `getReportContentHref`.
- `app/admin/reports/[id]/page.tsx` � added a `case "COMMUNITY_REVIEW"` so staff see the
  reported review inline on the report detail page.
- `app/admin/reports/page.tsx` � added the label to the content-type filter dropdown.
- `lib/nav-links.ts` � added `{ label: "Reviews", href: "/reviews" }` to the Community dropdown.
- `components/Footer.tsx` � added a Reviews link to the Community column.
- `app/sitemap.ts` � added `/reviews`.
- `components/admin/AdminShell.tsx` � added a Reviews item to the existing Safety group.
- `app/admin/moderation/page.tsx` � added a link to the review queue.
- `package.json` � added `"test:reviews"` script. **No dependencies added.**

## 4. Report system � how it was integrated (and what was NOT touched)

Review reports use the **existing** report system end to end. There is no second
reporting backend. The public card renders the existing `ReportButton` /
`ReportModal` component, which posts to the existing `/api/report/submit`. The
`COMMUNITY_REVIEW` content type is a plain string on `Report`, so **no schema migration,
validation change, permission change, or webhook change was needed** � review reports
flow into the same Discord webhook, audit log, staff dashboard, and permission model as
every other report.

**Intentionally NOT changed:** report schema, report IDs / reference generation, report
permissions and roles, webhook URL resolution, webhook payload, evidence handling,
audit-log actions, report API response shapes, retry/idempotency logic.

## 5. Moderation

Statuses are `PENDING | APPROVED | REJECTED | HIDDEN`, stored in a Prisma enum.
Every submission enters `PENDING` and only `APPROVED` rows are selected by
`/reviews` � the public page never even fetches other statuses, so moderation notes,
staff identity, reviewer handles, and spam scores cannot leak through that route.

Staff moderation reuses the existing admin system: same `ugn_session` cookie, same
`middleware.ts` `/admin/*` gate, same `requireAdmin()`, same admin UI kit. No separate
admin system or permission table was created.

Every moderation action writes a `ReviewModerationLog` row with from/to status, note,
and acting staff member.

## 6. Safety / abuse protection

- Two rate-limit layers, mirroring the report system's own pattern: in-memory burst
  (`review-submit:${ipHash}`, 5/min) and durable DB count per salted IP hash (5/hour).
  Verified: the 6th request in a minute returned `429`.
- Server-side validation is authoritative; the client copy only gives fast feedback.
- Honeypot field returns a fake success and stores nothing. Verified.
- Markup is **stripped before storage**, not escaped at render: `&` is collapsed first
  (defeats `&lt;script&gt;`), then whole tags including attributes are removed.
- No `dangerouslySetInnerHTML` anywhere in the reviews code. Submitted content is only
  ever rendered as React text.
- Small profanity/abuse list plus link/spam heuristics. Clear abuse auto-rejects;
  merely suspicious content still goes to staff. Never auto-approves.
- Raw IPs are never stored � only the same salted SHA-256 hash the report system uses.
- Reviewer Discord/VRChat handle is staff-only and is never selected by the public page.
- Optional "show my name" toggle; otherwise displayed as "Anonymous".
- No invasive tracking, no new dependencies.

## 7. Seasonal theme behaviour

No seasonal code was added and `data-site-theme` is never read by the new page. The page
uses only the existing `.card` / `.input` / `.field-label` / `btn-*` / `dark:` conventions,
so it inherits whatever theme is active.

**Verified live in this session:** `/reviews` served
`data-site-theme="halloween"` automatically, and the review avatar colours were
deliberately built only from the `brand` / `surface` / `ink` scales (which every seasonal
theme redefines) rather than fixed Tailwind hues � otherwise light-mode avatar circles
would have shown on a dark seasonal card. This keeps the page correct for the future
Christmas theme with no further changes.

## 8. Tests actually run, and results

| Command | Result |
| --- | --- |
| `npx prisma validate` | **PASS** � schema valid |
| `npx prisma generate` | **PASS** � `Review` types generated |
| `npx tsc --noEmit` | **PASS** � no errors |
| `npm run lint` | **PASS** � "No ESLint warnings or errors" |
| `npx tsx scripts/verify-reviews.ts` | **PASS** � 30/30 assertions |
| `npm run build` | **PASS** � compiled successfully, 88/88 static pages |
| Dev server regression sweep (17 public routes) | **PASS** � all HTTP 200 |
| Admin gating check | **PASS** � `/admin/reviews` 307s to `/admin/login?from=%2Fadmin%2Freviews`, identical to `/admin/reports` |

Live API checks against a dev server (`POST /api/reviews`):

| Case | Observed |
| --- | --- |
| Empty display name | `400` with `field: "displayName"` |
| Rating `9` | `400` with `field: "rating"` |
| Body under minimum | `400` with `field: "content"` |
| Honeypot filled | `200 {"success":true,"status":"pending"}`, nothing stored |
| 6th submission in a minute | `429` |
| Valid submission | `201 {"success":true,"status":"PENDING"}` |
| Submission containing slurs | `201 {"success":true,"status":"REJECTED"}` � auto-rejected |

### Stored-data inspection (real rows read back from the live database)

Four reviews were submitted and inspected directly in the database:

- A normal review stored verbatim as `PENDING`, `spamScore=0`.
- An XSS payload stored **fully neutralised**: `<img src=x onerror=alert(1)>` and
  `<script>alert(2)</script>` were reduced to harmless text, no markup present in the row.
- An anonymous review stored with `showUsername=false`.
- A review containing slurs was auto-`REJECTED` with `spamScore=5` and the moderation note
  `contains abusive language`, and was never queued for publication.

No `moderationLogs` row was lost; every submission wrote one.

### Full moderation lifecycle against the live database (13/13 passed)

Each state change was applied exactly as `app/admin/reviews/actions.ts` applies it, and
the public page was re-fetched after each one:

| Transition | Public page result | Other assertions |
| --- | --- | --- |
| `PENDING` | not visible | present in staff queue |
| ? `APPROVED` | **visible** | handle `robin#7788` still private; moderation note `Looks great` still private; moderation log row written; `reviewedBy` recorded |
| ? `HIDDEN` | not visible | � |
| ? `PENDING` (restore) | not visible | � |
| ? `REJECTED` | not visible | rejection reason not leaked |
| ? `APPROVED` again | **visible** | reversible |

### Report-system integration (live)

A report was submitted against a review through the **existing** `/api/report/submit`:

```text
HTTP 200 {"success":true,"reference":"UGN-000028","reportToken":"cmupwn6ug...",
          "trackingUrl":"/report/track/cmupwn6ug...","notification":"sent", ...}
```

- The reference `UGN-000028` was allocated by the existing `ReportCounter`; no new ID logic.
- `notification: "sent"` confirms the **existing Discord webhook** fired.
- Stored row: `contentType=COMMUNITY_REVIEW`, `status=OPEN`, `priority=HIGH` (existing
  category?priority suggestion), `webhookStatus=SENT`.
- `getContentTypeLabel("COMMUNITY_REVIEW")` ? `"Community review"`;
  `getReportContentHref(...)` ? `/reviews`.
- The admin report-detail content lookup resolves the review row correctly using the
  exact `select` added to `app/admin/reports/[id]/page.tsx`.

**All test fixtures were deleted afterwards.** The production `Report` table held 0 rows
before this test, and 0 rows after; `Review` holds 0 rows.

Logic assertions covered: rating bounds (0/6/3.5/"abc"), name length, body min/max,
`<script>` stripping, `onerror` attribute stripping, encoded-tag neutralisation,
control-character stripping, slur detection, link-spam scoring, anonymous-name
privacy, rating average/distribution math.

## 9. Known issues / not done

- **The staff moderation screens could not be rendered in this environment.** A valid
  staff session cookie was minted and every `/admin/*` page � including the pre-existing
  `/admin/reports`, `/admin`, and `/admin/moderation` � rendered the login form rather
  than the dashboard. This affects **all** admin pages identically, so it is a
  pre-existing environment/session issue and not something this change introduced.
  `app/admin/layout.tsx` sets `export const revalidate = 60`, which can serve a cached
  anonymous layout render; this was **not** changed, as it is outside this task's scope
  and affects the whole admin area. The moderation actions are therefore verified at the
  data layer (section 8) rather than by clicking the buttons in a browser.
- Admin **gating** was verified: without a session `/admin/reviews` returns
  `307 ? /admin/login?from=%2Fadmin%2Freviews`, identical to `/admin/reports`.
- No automated test framework exists in this project. `scripts/verify-reviews.ts` covers
  pure logic only (30 assertions) and does not exercise the database; the database
  lifecycle checks in section 8 were run as one-off scripts that were then deleted.
- **No visual/manual browser review was performed** by a human for the review page at
  desktop, tablet, and mobile widths, nor a reduced-motion pass. That remains open.
- The profanity list is deliberately small and English-only; it is a speed bump, not a
  comprehensive filter. It auto-rejects but never auto-approves.
- The rate limiter is the project's existing in-memory `checkMemoryRateLimit`, so burst
  limits reset on server restart. The durable 5-per-hour limit is DB-backed and survives.

## 10. Not touched, on purpose

Homepage, report system internals, authentication, staff permissions, events,
announcements, news, gallery, community submissions, shop, guides, rules, legal pages,
search, admin layout/kits, the seasonal theme system, `globals.css`, Tailwind config,
Discord webhook, and all dependencies. No file was renamed. No existing API contract changed.

---
---

# CHANGE.md � Christmas 2026 PREPARATION entry

**Project:** Ur Gay Now website (`C:\Users\alans\Urgaynowwebsite`)
**Task:** `Ur_Gay_Now_Christmas_2026_Preparation_MMD.md` (preparation only)
**Date of this entry:** 2 October 2026
**Branch:** `main`

---

## 0. Status summary

| MMD requirement | State |
| --- | --- |
| Christmas theme architecture exists | Done � `THEME_REGISTRY` entry + `data-site-theme` layer + isolated `components/christmas/*` |
| **Christmas NOT active in production** | **Confirmed � see section 5** |
| Halloween remains the live theme | Confirmed � no DB/config change was made; all `hw-*` rules untouched |
| Normal / no-season mode remains functional | Confirmed � every new CSS rule is gated on `[data-site-theme="christmas"]` |
| Christmas safely previewable | Done � `UGN_THEME_PREVIEW`, dev-only, compiled out of production |
| Existing UGN UI structure intact | Done � no component markup was restructured; only additive class names |
| Report backend unchanged | Confirmed � `git status` shows zero changes under the report system |
| Community Reviews unbroken | Confirmed � `npm run test:reviews` 30/30; no review file modified |
| Build / typecheck / lint | Pass (with one honest caveat, section 6) |
| Visual browser review by a human | **NOT DONE � see section 7** |

**This is a preparation change. Christmas is not live and was not activated.**

---

## 1. What I changed in this session

The Christmas 2026 preparation was already largely present in the working tree when I
started (uncommitted). I inspected it, found one real regression, fixed it, and verified
the whole thing. The changes below are the ones **I** made.

### 1.1 Bug found and fixed: `cw-*` classes were leaking onto Halloween and the normal theme

**Severity: high. This was actively breaking the live Halloween site.**

The Christmas work mirrors the existing Halloween pattern of adding a `cw-*` helper class
alongside the `hw-*` one on shared cards (`AnnouncementCard`, `EventCard`, `StaffCard`,
homepage feature / stat / gallery / live-pill elements). That part is fine and was left
alone.

The defect was in `app/globals.css`: the Christmas rules for those shared components were
written **unscoped**, and they reference the `--cw-*` custom properties, which are declared
**only** on `:root[data-site-theme="christmas"]`.

On Halloween, `--cw-line` is undefined, so `border-color: var(--cw-line) !important` and
`box-shadow: ... 0 0 0 1px var(--cw-line) !important` are *invalid at computed-value time*.
Because the declarations are `!important` **and** appear later in the file than their `hw-*`
equivalents, they won the cascade and then collapsed to the unset value. The visible effect
on the live site was:

- announcement, staff, event, feature, stat and gallery card **borders** fell back to
  `currentColor` instead of the subtle Halloween purple border;
- the same cards **lost their `box-shadow`** entirely;
- a **gold hairline** (`.cw-card-treat::before`) and a gold/icy **hover shadow** were drawn
  on Halloween cards;
- the **Live Now pill** rendered the Christmas gold/icy gradient and breathed with
  `cw-live-breathe` instead of `hw-live-breathe`;
- the Community Highlights stat cards got a gold glow (`cw-stat-glow`) instead of the
  Halloween one;
- the **hero** carried the Christmas aurora `::before` glow.

**Fix:** every `cw-*` rule that can match a shared, always-rendered component is now gated
on `:root[data-site-theme="christmas"]`. This is purely additive scoping � no `hw-*` rule,
no colour and no value was edited, so Halloween is restored to exactly its committed
behaviour. The only rules left unscoped are the decoration layer itself
(`.cw-layer` and its descendants) and `.cw-strip` / `.cw-fallback`, which are safe because
they are only ever mounted when `data-site-theme="christmas"` is already on `<html>` � the
same condition that defines the custom properties they read.

Reduced-motion and small-screen overrides for those classes were scoped the same way.

### 1.2 Reduced-motion contradiction

`@media (prefers-reduced-motion: reduce)` had two consecutive `.cw-snow` rules �
`display: none;` immediately followed by `opacity: 0.38;`. The second was dead code.
Collapsed into one rule with a comment explaining that snowfall is removed outright
(a static field of flakes reads as noise behind text).

### 1.3 Formatting only

- `app/layout.tsx` � corrected the indentation of the provider nesting in the JSX tree
  (`SeasonalThemeProvider > HalloweenIconProvider > ChristmasIconProvider > ToastProvider`).
  Structure and behaviour unchanged; whitespace only.
- `tailwind.config.ts` � restored the `darkMode` block to the file's own indentation.
  Value unchanged.

---

## 2. Files already present in the tree (pre-existing, not authored by me)

Documented for completeness; I reviewed each and found no defect requiring a change.

| File | Purpose |
| --- | --- |
| `lib/christmas.ts` | Palette constants, season window, icon path. Values only � importing it cannot activate the theme. |
| `lib/christmas-icon-server.ts` | `server-only` build-time check that the icon asset exists. |
| `components/christmas/ChristmasIcon.tsx` | Renders the supplied asset as-is, or a neutral SVG placeholder. |
| `components/christmas/ChristmasIconProvider.tsx` | Passes icon availability down from the server. |
| `components/christmas/ChristmasDecor.tsx` | `useIsChristmas()` + hero strip / footer mark / event badge. Renders `null` when inactive. |
| `components/christmas/ChristmasDecorations.tsx` | CSS/SVG-only atmosphere layer (snow, moon, aurora, fog, lights). Mounts only when Christmas is active. |
| `app/globals.css` (Christmas block, ~line 1801+) | Winter-night palette, atmosphere, hero, cards, buttons, dialogs, keyframes. |
| `lib/theme-resolver.ts` | `getThemePreviewOverride()` dev-only preview hook. |
| `lib/themes.ts` | `christmas` registry entry repalettised to the MMD winter palette. |

Modified shared files (all additive): `app/layout.tsx`, `app/page.tsx`,
`components/Header.tsx`, `components/Footer.tsx`, `components/AnnouncementCard.tsx`,
`components/EventCard.tsx`, `components/StaffCard.tsx`, `tailwind.config.ts`, `.env.example`.

**No dependencies were added.** `package.json` gained a test script only.

**No database migration was added** by the Christmas preparation.

---

# CHANGE.md � UGN Theme Engine entry

**Project:** Ur Gay Now website (`C:\Users\alans\Urgaynowwebsite`)
**Task:** Build the UGN Theme Engine � single source of truth for the visual UI
**Date of this entry:** 2 October 2026
**Branch:** `main`

---

## 0. Status summary � READ THIS FIRST

**This task is NOT complete.** The engine's core is built, tested and deployed-safe.
The CSS and component consolidation is **not** done, so the goal of "one rendered
UI with no seasonal overlay" is **not yet achieved**. The site is visually unchanged
and Halloween is still the live theme.

| Requirement | State |
| --- | --- |
| Theme engine core (tokens, inheritance, CSS emission) | **Done**, 75 assertions pass |
| Automatic scheduling: start/end/enabled/priority | **Done**, tested |
| Manual override + **override expiration** | **Done**, tested |
| Priority order (override > schedule > default) | **Done**, tested |
| Required themes present (Default, Valentine's, Spring, Pride, Summer, Halloween, Autumn, Christmas, New Year) | **Done** � plus Easter & April Fools kept |
| Themes inherit from Default when not overridden | **Done**, tested |
| Isolated admin preview (cookie-based, staff-only) | **Rules written + tested; UI not yet built** |
| Activating a theme needs no source edit | **Not yet** � the admin picker writes the DB, but the stylesheet still needs the token layer |
| **ONE rendered UI, no per-theme overlay** | **NOT DONE � this is the remaining work** |
| Build / typecheck / lint / reviews tests | Pass |

## 1. The defect this task set out to fix

The audit found the previous seasonal system was not a theme engine at all:

- **7 of 9 themes were visual no-ops.** `default`, `valentines`, `aprilfools`,
  `easter`, `summer`, `autumn` and `spring` only set `--theme-*` variables, and
  **11 of those 13 variables were read by nothing** � only `--theme-background`
  and `--theme-text` had a reader, on `body`. Selecting Valentine's changed the
  page background and nothing else.
- **`66% of `app/globals.css` (1642 of 2476 lines) was per-theme CSS.** Root cause:
  `tailwind.config.ts` hardcodes `rgba(117,7,135,�)` in all 17 `boxShadow` entries
  and 13 `backgroundImage` entries, so themes *could not* re-theme them, and each
  theme re-declared card/button shadows by hand to work around it.
- **Components rendered the old UI underneath the themes.** `EventCard`,
  `AnnouncementCard` and `StaffCard` all carried *both* `hw-*` and `cw-*` class
  names at once, e.g. `cw-event-card hw-event-card`. That is literally the
  "old UI running underneath the theme UI" the task forbids.
- **`components/ThemeCSS.tsx` was orphaned** � never imported anywhere. Deleted.
- **`getActiveThemeCSSVariables()` was never called.** Removed.
- **The admin preview only mutated its own DOM**, so it died on navigation and
  could not preview "across the real website".
- **`SiteTheme` had no override-expiration column.**

## 2. What I built

New engine in `lib/theme-engine/`:

| File | Purpose |
| --- | --- |
| `tokens.ts` | The token contract. `DEFAULT_TOKENS` is copied **verbatim** from the `:root` block that has shipped since launch, so the Default theme is pixel-identical to the pre-engine site. |
| `resolve.ts` | `resolveTokens()` � deep-merges a theme's partial tokens onto `DEFAULT_TOKENS`. This is the single place "inherit from Default" happens; a missing token is structurally impossible to express. `normalizeTriplet()` accepts `#rrggbb` and converts to the `"R G B"` form Tailwind needs. |
| `css.ts` | `tokensToCssVars()` / `tokensToCss()` � serialises the token set to CSS custom properties. |
| `scheduler.ts` | `resolveActiveTheme()` implementing the priority order, plus `isScheduleActive()`. |
| `preview.ts` | Preview isolation: `resolvePreviewThemeId()`, `getDevThemePreview()`, `selectThemeId()`. |
| `validate.ts` | Development-time guards + `assertSchedulerContract()`. |
| `registry.ts` | All 11 themes as **pure data**. No theme has a CSS file or a component. |
| `index.ts` | Barrel. |

Also:

- `scripts/verify-theme-engine.ts` + `npm run test:theme-engine` � **75 assertions.**
- `prisma/migrations/20261002160000_theme_engine_override_expiry/` � adds
  `SiteTheme.overrideExpiresAt` (nullable, additive, idempotent). **Not yet applied.**
- `lib/themes.ts` is now a **compatibility shim** re-exporting from the engine, so
  the ~10 existing importers were not touched.
- `lib/theme-resolver.ts` rewritten onto the engine; deleted the dead
  `getActiveThemeCSSVariables()`.
- `app/admin/settings/appearance/AppearancePage.tsx` � theme swatches now read
  the resolved token set instead of the old dead `variables` object.

### Deployment hazard found and fixed

`prisma.siteTheme.findFirst({ include: � })` returns **every** column, so adding
`overrideExpiresAt` to the schema made the theme query throw on a database where
the migration had not been applied. The layout resolves the theme through
`safeQuery(�, "default")`, so **the live Halloween site would have silently fallen
back to Default.** I caught this in the build and fixed it two ways:

1. The main query now uses an **explicit `select`** of only the long-standing columns.
2. `overrideExpiresAt` is read separately by `readOverrideExpiry()`, which returns
   `null` on any failure. `null` means "never expires", which is exactly the
   pre-engine behaviour.

Verified in the build: **0 safeQuery fallbacks, 0 `siteTheme` failures**, so
Halloween resolves correctly both before and after the migration.

## 3. Checks actually run

| Check | Command | Result |
| --- | --- | --- |
| Theme engine | `npm run test:theme-engine` | **PASS** � 75 passed, 0 failed |
| Review tests | `npm run test:reviews` | **PASS** � 30 passed, 0 failed |
| Typecheck | `npm run typecheck` | **PASS** � no output |
| Lint | `npm run lint` | **PASS** � no warnings or errors |
| Build | `npx next build` | **PASS** � compiled, 88 pages |

Build caveat, unchanged from the previous entry: `npm run build` cannot complete
here because a `next dev` server holds the Prisma engine and `.next`. I built via
an isolated `distDir` with a temporary config override, then reverted it
(`git diff next.config.mjs` empty) and restored `tsconfig.json`.

The engine test covers: registry validity for all 11 themes; the 9 required themes
present; inheritance (an empty theme resolves to exactly the default tokens; a
partial override keeps its siblings); the Default theme still emitting the
original UGN hex values; scheduler priority; expired/live overrides; disabled and
out-of-window schedules; inclusive window boundaries; unknown ids never promoted;
dev preview inert in production; and prototype-pollution rejection.

## 4. Known issues / not done

- **The CSS consolidation is not done.** `app/globals.css` still contains the 1642
  lines of per-theme Halloween/Christmas CSS and the dead `--theme-*` blocks. The
  engine emits the tokens, but the stylesheet does not consume them yet.
- **The components still carry `hw-*` and `cw-*` class names together.** The
  "old UI underneath the theme UI" problem is **still present on screen**.
- **The server does not yet apply the tokens.** `app/layout.tsx` still uses the
  old `data-site-theme` attribute path; it does not yet emit the token `<style>`.
- **Admin preview UI not built.** The isolation rules exist and are tested, but
  there is no cookie-setting control in the appearance page yet.
- **No override-expiration control** in the admin UI.
- **`tailwind.config.ts` `darkMode` is still a hardcoded list** naming `halloween`
  and `christmas`. The engine exposes `visual.scheme`, so this should key off a
  `data-theme-scheme` attribute instead. Until then `autumn` and `newyear` (both
  dark-scheme themes) will not get the `dark:` variants.
- **`public/brand/christmas-icon.png` still does not exist** (pre-existing).
- No human visual review has been done.
- 22 `prisma:error` log lines appear during build for the deliberately-caught
  `readOverrideExpiry` query. Harmless and self-correcting once the migration is
  applied.

## 5. What is intentionally NOT changed

The report system, authentication, staff permissions, events, announcements,
Community Reviews (page and all four components), `prisma/schema.prisma` (one
nullable column added, nothing removed), existing migrations, and all existing
API contracts. No page or component was duplicated per theme. No dependency added.

## 6. Next step

Replace the per-theme CSS with a single token-driven component layer, remove the
`hw-*`/`cw-*` class names from the shared components, emit the token `<style>` from
`app/layout.tsx`, and key `darkMode` off `data-theme-scheme`. That is the work that
turns what is currently a working token engine into the "one rendered UI" the task
asks for. **Halloween must be visually diffed before and after that step.**

---
---

# CHANGE.md � Controlled migration: audit, classification and parity gate

**Task:** Controlled migration of the legacy per-theme CSS into the theme engine
**Date of this entry:** 2 October 2026
**Status:** Parity gate **PASSED**. No legacy CSS deleted. Frontend not yet consuming
the engine.

---

## 0. What this stage delivered

The point of this stage was to make the consolidation **safe to perform**, not to
perform it. That means proving � mechanically, not by eye � that the theme engine
reproduces the current appearance before a single line of the legacy 1642 is
touched.

| Deliverable | State |
| --- | --- |
| Every legacy seasonal rule classified | **Done** � 99 rules extracted, ledger covers 100% |
| Classification into the 6 required categories | **Done** � asserted by test |
| Reusable values moved into the token system | **Done** |
| Component tokens created where globals are insufficient | **Done** � `components.*` block |
| **Halloween appearance preserved** | **Proven** � all 34 triplets + 50+ values identical |
| Christmas preserved | **Proven** � all 34 triplets + values identical |
| Legacy CSS deleted | **No � deliberately**, per instruction 12 |
| Frontend consuming the engine | **No � the remaining work** |

## 1. Classification ledger

`lib/theme-engine/legacy-parity.ts` holds one entry per legacy rule with its
category, its replacement token, and a note. Categories, all asserted present by the
test suite:

| Category | Meaning | Example |
| --- | --- | --- |
| `global-token` | Value consumed by the global token layer | `.btn-primary { background-image }` |
| `component-token` | Needed a component-scoped token | `.hw-live-pill { box-shadow }` |
| `component-structure` | Becomes one shared semantic class | `.hw-hero { position }` |
| `decorative-asset` | Hand-drawn art ? decoration config | `body::before { background-image }` |
| `animation-effect` | Keyframes / transitions | `hw-live-breathe`, `hw-stat-glow` |
| `obsolete-duplicate` | Dead or superseded | `.dark { --theme-textMuted }` |

A completeness check asserts that **every** seasonal selector parsed out of
`globals.css` � Halloween and Christmas, including the multi-selector rules and the
`cw-`/`hw-` mirrors � is classified. Nothing can be silently dropped.

## 2. The parity gate (the important part)

`npm run test:theme-engine` now runs **155 assertions**, including:

- **`LEGACY PARITY`** � for each ledger entry, the real value is parsed out of
  `app/globals.css` and compared against the value the theme engine resolves.
  50+ value-bearing rules verified identical.
- **`LEGACY SCALE PARITY`** � all **34 colour triplets** compared digit-by-digit for
  both Halloween and Christmas.
- **`brand DEFAULT matches legacy --brand-rgb`** for both themes.
- **`every legacy seasonal selector is classified in the ledger`**.

The comparison is whitespace-, hex-case- and number-format-tolerant, resolves
`var(--hw-card)` against the legacy stylesheet, handles the `border` and
`scrollbar-color` shorthands, and merges every rule that targets a selector (because
`[role="dialog"]` is styled by two separate rules).

### What the parity gate caught

It did real work. It found **four genuine fidelity bugs** that would have silently
changed Halloween:

1. **`--brand-rgb` was aliased to `brand[700]`.** In the legacy Halloween palette
   those differ � `109 40 217` vs `112 44 222` � so every `brand.DEFAULT` usage, i.e.
   the CTA colour, would have shifted. Fixed by making `brandDefault` its own slot.
2. **`hero.gradientText` had 3 gradient stops; the legacy has 4** (I had dropped
   `#f97316 35%`). The heading gradient would have visibly changed.
3. **`hero.titleShadow` had a second shadow the legacy does not have.**
4. **Every `components.*` token was still at its Default value** for Halloween, and
   `buttons.ctaShadowHover` / `secondaryHoverShadow` were unpopulated.

All four are fixed and now verified. This is exactly the "do not redesign Halloween"
instruction being enforced by a machine rather than by good intentions.

## 3. Component tokens added

`ThemeVisual.components` now covers the treatments global tokens could not express:
`cardTreat`, `livePill`, `stat`, `eventCard`, `featureCard`, `staffCard`,
`galleryTile`, `section`, `banner`, `strip`, `inputFocus`. Plus
`buttons.ctaShadowHover` and `buttons.secondaryHoverShadow`.

Both Halloween and Christmas carry their full legacy values. The nine other themes
inherit the Default values, which are all `none`, so they carry no seasonal
treatment � which is the correct behaviour.

## 4. Supporting files

- `scripts/lib/css-parser.ts` � a small brace-matching CSS parser with the
  normalisation rules above, plus `collectCustomProperties` /
  `resolveCustomProperties` so legacy `var()` values can be compared.
- `scripts/extract-legacy-seasonal-css.ts` � audit helper that lists every seasonal
  rule. Re-runnable to re-inventory after any CSS change.
- `lib/theme-engine/tokens.ts` � `brandDefault` slot added.

## 5. Checks run

| Check | Result |
| --- | --- |
| `npm run test:theme-engine` | **155 passed, 0 failed** |
| `npm run test:reviews` | **30 passed, 0 failed** |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** |
| `npx next build` | **PASS** � compiled, 88 pages, **0 safeQuery fallbacks** |

The un-migrated `overrideExpiresAt` column still produces caught error logs but no
fallback; the theme resolves correctly, as verified above.

## 6. Still not done

- **The frontend does not consume the engine yet.** `app/layout.tsx` does not emit
  the token `<style>`, so the live site is still driven by the legacy CSS.
- **`hw-*` / `cw-*` class names are still on the shared components.**
- `tailwind.config.ts` `darkMode` is still a hardcoded Halloween/Christmas list.
- No admin preview UI, no override-expiry control.
- **No human visual verification has been done** � the parity gate is a numerical
  guarantee about CSS values, not a rendering check. Instruction 13's page-by-page
  checklist is outstanding.
- Legacy CSS is fully intact, as instructed.

## 7. Next step

Now that parity is proven, the consolidation can be done mechanically: write the
single token-driven component layer (`.ugc-hero`, `.ugc-card-treat`,
`.ugc-stat-card`, `.ugc-live-pill`, �), switch the shared components to those
classes, emit the tokens from the layout, and key `darkMode` off
`data-theme-scheme`. The parity gate must stay green throughout, and the legacy
blocks are only deleted in a final, separately-reviewed step.

---

## 3. Community Reviews compatibility (explicitly requested)

Inspected, and found already compatible � no change was needed and none was made.

- `app/reviews/page.tsx` and `components/reviews/*` were **not modified**.
- They are theme-agnostic by construction: they style off the `brand` / `surface` / `ink`
  scales and `currentColor`, which every seasonal theme redefines. No hard-coded seasonal
  colour, no `hw-*`/`cw-*` class.
- `ReviewCard` uses `card card-hover`, which the Christmas block themes
  (`:root[data-site-theme="christmas"] .card`). Presentation only.
- `ReviewForm` uses `.input` / `select` / `textarea`, which the Christmas block themes on
  `:focus` only. Behaviour untouched.
- `StarRating` / `RatingDistributionRow` use `text-amber-*` for stars, which reads correctly
  on the winter-night surface.
- **The report button on each review is untouched.** `ReviewCard` still posts through the
  existing `/api/report/submit` with `contentType="COMMUNITY_REVIEW"`. No report code was
  read-modified or written by this task.
- `COMMUNITY_REVIEW` is free-text in `Report.contentType` (`prisma/schema.prisma:474`) and is
  **not** validated against an allowlist � `lib/report-validation.ts:265` only upper-cases and
  length-caps it � so review reports still store and display exactly as before.

---

## 4. Report system protection

No report file was modified. `git status` over `lib/reports.ts`, `lib/report-validation.ts`,
`lib/report-webhook.ts`, `lib/report-reference.ts`, `lib/report-evidence-token.ts`,
`lib/request-security.ts`, `components/report/`, `app/api/report/`, `app/admin/reports/`,
`app/report/` and `prisma/schema.prisma` returns **empty**.

Per MMD section 18, the eight required verifications:

| # | Check | Result |
| --- | --- | --- |
| 1 | Report can be submitted | Not re-executed this session (end-to-end confirmation is recorded in the Community Reviews entry above) |
| 2 | Report reaches the backend | Route untouched; builds clean |
| 3 | Report stored correctly | Schema and write path untouched |
| 4 | Discord webhook works | `lib/report-webhook.ts` untouched; build clean |
| 5 | Staff can access reports | `app/admin/reports/*` untouched; routes build |
| 6 | Permissions intact | No auth or permission file touched |
| 7 | Report IDs intact | `lib/report-reference.ts` untouched |
| 8 | Evidence/security intact | `lib/request-security.ts`, evidence routes and headers untouched |

---

## 5. Production safety � Christmas is NOT active

- The production fallback chain in `getActiveThemeId()` is:
  dev-preview override -> database config -> `"default"`. `undefined` can never become
  `christmas`.
- `getThemePreviewOverride()` returns `null` **before reading any other input** when
  `process.env.NODE_ENV === "production"`, so `UGN_THEME_PREVIEW` is inert in production
  even if it were set in the environment. It is a server-only variable (no `NEXT_PUBLIC_`
  prefix) and is validated against `THEME_REGISTRY`.
- The confirmation build ran with `NODE_ENV=production`, exercised the real production path,
  and completed without error.
- I made **no** database change, **no** schedule row, and **no** manual-theme change. The
  live site therefore remains whatever the database already says � Halloween.

**Documented activation path (for when Christmas is approved later):** the existing admin
`/admin/settings/appearance` page already lists every registry theme, including Christmas,
and already supports both a manual selection and a dated schedule. This is the pre-existing
generic seasonal mechanism � Christmas was already present in `THEME_REGISTRY` before this
task, and this task only repalettised it. Activating Christmas is therefore a single
deliberate admin change, which is exactly the "controlled configuration change" the MMD asks
for. No new switch was created, and no public/visitor-facing toggle was added.

---

## 6. Checks actually run

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | **PASS** � no output |
| Lint | `npm run lint` | **PASS** � "No ESLint warnings or errors" |
| Review tests | `npm run test:reviews` | **PASS** � 30 passed, 0 failed |
| Build | `npx next build` | **PASS** � all routes compiled |

**Honest caveat on the build.** `npm run build` (which is `prisma generate && next build`)
could **not** complete: `prisma generate` failed with
`EPERM: operation not permitted, rename ...query_engine-windows.dll.node`, because a
`next dev` server started at 12:59 (before this session) holds both the Prisma query engine
and `.next/trace`. I did **not** kill that dev server.

To still get a real production-compile signal I ran `npx next build` against an isolated
`distDir` via a **temporary** `next.config.mjs` override, which succeeded. That temporary
edit has been **reverted** � `git diff next.config.mjs` is empty � and the temporary build
directory was deleted. `tsconfig.json` was also auto-modified by the build (it appended the
temporary distDir to `include` and a formatter reflowed it); that has been restored with
`git checkout`, and `git status tsconfig.json` is clean.

So: the Next.js production compile genuinely passed. `prisma generate` was **not**
re-run successfully in this session, and I am not claiming it was � the Prisma client was
already generated and is unmodified, and no schema or migration changed, so this step is
unaffected by this task.

---

## 7. Known issues, risks and open items

- **No human visual/browser review was performed.** I did not start a dev server and look at
  the site at desktop, tablet or mobile widths, under reduced motion, or with the Christmas
  preview on. Typecheck, lint, tests and a production compile do not catch layout or
  contrast problems. The MMD's manual checklist is **outstanding**.
- **The official Christmas icon asset does not exist.** There is no
  `public/brand/christmas-icon.png`. `hasChristmasIcon()` returns `false`, so `ChristmasIcon`
  renders its inline SVG placeholder. This is handled gracefully (no 404, no broken image),
  but the header logo slot will show the placeholder, not the real artwork, until the asset
  is supplied at `public/brand/christmas-icon.png` (or `NEXT_PUBLIC_CHRISTMAS_ICON_PATH` is
  pointed at it).
- **Dead rule, deliberately left alone.** In the Christmas block,
  `:root[data-site-theme="christmas"] .cw-hero::before { content: none; }` cancels the
  base `.cw-hero::before` aurora, so the hero aurora currently never paints under Christmas.
  Fixing it would change the approved visual direction, so I scoped the base rule (to stop
  it leaking into Halloween) but left the override in place. Flagged for design review
  rather than changed.
- **`.cw-event-card` / `ChristmasEventBadge` are wired but not exercised.** The badge is
  defined and the class is styled, but I did not find it rendered on the events listing;
  this is unchanged from how the work arrived and needs a visual pass.
- The Christmas visual balance (purple/blue vs. red/green/gold) is unverified by eye.
- `public/brand/halloween-icon.png` is ~19.5 MB. Not touched by this task, but it is a
  pre-existing performance concern worth raising separately.
- `lib/christmas.ts` exports `isChristmasSeason()` / `CHRISTMAS_SEASON`. These are currently
  **unused** � activation is driven purely by the database schedule. That is the safe
  arrangement (no date-based automatic activation), and it was left that way.

---

## 8. Intentionally NOT changed

The report system (submission, storage, Discord webhook, staff dashboard, permissions,
IDs, evidence, audit history), authentication, staff management, events, announcements,
news, gallery, community submissions, shop, guides, rules, legal pages, search, admin
layout and kits, the Community Reviews page and its four components, `lib/reviews.ts`,
`app/api/reviews/route.ts`, `prisma/schema.prisma`, all migrations, `package.json`,
`next.config.mjs`, all `hw-*` Halloween CSS, and the database. No file was renamed. No API
contract changed. No UGN layout, spacing, typography or component structure was redesigned.

---

# CHANGE.md — Automatic Update/Version System (every successful push)

**Project:** Ur Gay Now website (`C:\Users\alans\Urgaynowwebsite`)
**Task:** Audit the existing version/update system, then make every successful
production deployment automatically create and publish a website update.
**Date of this entry:** 3 October 2026
**Repository:** `urgaynow2024-cloud/urgaynowweb` (branch `main`, production on Vercel)
**Database used for verification:** live Supabase Postgres from `.env`

---

## 0. Headline finding

**Automatic updates have never worked. Not once.** The "Auto Release" workflow had
**16 runs on `main`, 16 failures, and zero jobs created** — GitHub rejected the
workflow file itself, so no step ever executed:

```
X main .github/workflows/auto-release.yml · 36923284651
X This run likely failed because of a workflow file issue.
$ gh api .../actions/runs/36923284651/jobs  ->  total_count: 0
```

The cause is one step in the old file that had only a `name`, with its `uses:`
commented out:

```yaml
- name: Wait for deployment (if using Vercel/Netlify/etc)
  # Uncomment and configure if you have a deployment check
  # uses: actions/github-script@v7
```

A step with neither `run:` nor `uses:` is invalid, which invalidates the whole
file. That is why the workflow produced nothing since it was added, and why
`/updates` only ever had its single manually-created entry (`v1.0.0`,
`report-system-support-ticket-overhaul`).

Even if that file had parsed, the flow was still broken: `/api/releases` shelled
out to `git log` **inside the deployed serverless bundle**, which has no `.git`
directory and no git binary, so it always found zero commits and returned
`200 {"error":"No commits to release"}`.

---

## 1. Audit answers

### 1.1 What currently creates update records?

| Path | Creates `Update` rows? | Notes |
| --- | --- | --- |
| Admin server actions (`app/admin/updates/actions.ts`) | Yes | `createUpdate`, `updateUpdate`, `generateDraftFromRecentChanges`, `deleteUpdate`. Staff-only (`requireAdmin`). |
| `POST /api/releases` | Yes, in principle | Intended to be CI-triggered. In practice unreachable: the workflow file was invalid, and the route ran `git log` where no git exists. |
| `scripts/*.ts` | One-off | `publish-report-overhaul.ts` publishes one specific draft by slug. |

Database reality before this change: **1 published update** (`v1.0.0`), created by
hand, `sourceCommit = null`, `generatedAutomatically = false`.

### 1.2 What currently determines the version?

The existing scheme is kept, not replaced. `lib/release-generator.ts`:

- base version = `getLatestPublishedVersion()` → highest version among published updates
- bump type = `determineVersionType(classifiedCommits)` → `MAJOR` if a breaking
  change, `MINOR` if any feature, otherwise `PATCH`
- `incrementVersion(base, type)` → `x.y.z + 1` at minimum, so **every push always
  gets a unique version**, whatever its commits look like

`package.json` `version: "1.0.0"` is **not** part of this system, nothing reads it,
and it is deliberately **not** touched by the automation.

Two real bugs were fixed in that scheme:

1. `getLatestPublishedVersion()` ordered by `publishedAt desc` and took the first
   row, so a re-published or back-dated entry could hand back a stale base. It now
   returns the **numerically highest** published version, which also removes the
   lexicographic bug that ranked `1.9.0` above `1.10.0`.
2. `getLatestPublishedVersion()` could return an unparseable version (e.g. `"v2"`),
   which made `incrementVersion` fall back to `"1.0.0"` and collide. It now only
   considers parseable `MAJOR.MINOR.PATCH` versions and otherwise starts from
   `0.0.0`.

### 1.3 What currently publishes an update?

Two ways, both already in place:

- **Manual** — staff tick "published" in `/admin/updates`; `createUpdate` /
  `updateUpdate` set `publishedAt`. (`releaseStatus` was never written by those
  actions, so a manually published entry displayed as `DRAFT` in the admin Status
  column. Pre-existing display inconsistency, unchanged here.)
- **Automatic** — `createReleaseFromCommits` writes `publishedAt: new Date()`,
  `releaseStatus: "PUBLISHED"`, `generatedAutomatically: true`,
  `authorId: "system"`, `sourceCommit`, `sourcePreviousCommit`, `sourceBranch`,
  `deploymentId`.

Publication == `publishedAt` not null. `/updates` queries
`where: { publishedAt: { not: null } }`.

### 1.4 How can Vercel/GitHub deployment information be accessed?

Verified live, not assumed:

```
$ gh api repos/urgaynow2024-cloud/urgaynowweb/commits/6b21d9e.../status
{"state":"success","statuses":[{"context":"Vercel",
  "description":"Deployment has completed","state":"success",
  "target_url":"https://vercel.com/ugn-website/urgaynowweb/2dG5RZbNnQU15wL2aUTpxTkoeNyg"}]}
```

- The **Vercel GitHub integration already publishes a commit status** with context
  exactly `Vercel` and state `pending | success | failure | error`, readable by the
  workflow with the automatic `GITHUB_TOKEN`. No extra Vercel token required.
- The **Vercel deployment id** is the last path segment of `target_url`. The
  workflow extracts it and stores it in `Update.deploymentId`.
- Vercel runtime env vars already in use: `VERCEL_GIT_COMMIT_SHA`,
  `VERCEL_GIT_COMMIT_REF` (`lib/admin-dashboard.ts`).
- The GitHub API was deliberately chosen over a Vercel REST token because it
  requires **zero new credentials**.

### 1.5 Is the existing revalidation endpoint sufficient?

`/api/updates/revalidate` existed and is still used, but it was **not sufficient**
and was **too permissive**:

- It is authenticated, but with plain `getSession()`, and it allowed revalidating
  **any path on the site**. It now keeps the session check but restricts
  revalidation to an allowlist: `/`, `/updates`, `/updates/[slug]`, and
  `/updates/<slug>`.
- The real cache problem is different: `/updates` is `force-dynamic` (rendered per
  request) but `next.config.mjs` serves every page with
  `s-maxage=60, stale-while-revalidate=30`, so a **60-second CDN cache** sits in
  front of it. `revalidatePath` is therefore still needed, and the release route now
  calls it for `/updates`, `/updates/[slug]` **and** `/`. The old route only
  revalidated `/updates`, so a new entry could still appear only after the cache
  window on the detail page.

So the endpoint was kept and tightened, not replaced.

### 1.6 What needed to change?

| # | Problem | Fix |
| --- | --- | --- |
| 1 | Workflow file invalid (step with no `run`/`uses`) → 16/16 runs failed with 0 jobs | Rewrote the workflow; every step has `run:` or `uses:`, verified programmatically |
| 2 | No deployment gate → would publish on a failed build | Workflow waits for Vercel's commit status to be `success`; `failure`/`error` exits without publishing; the API independently rejects any non-ready/non-production deployment with `422` |
| 3 | `git log` in a serverless bundle (always 0 commits) | Commits are collected by the workflow and sent in the request body; the route no longer needs git |
| 4 | Idempotency was a single pre-check returning 409 | `sourceCommit` is `@unique`; dedupe lives in `createReleaseFromCommits`, which returns the existing record and refreshes `deploymentId`. Replay, redeploy and rollback all yield exactly one row |
| 5 | Two concurrent pushes could compute the same version → unique-violation 500 | Version is recomputed from the database and retried up to 3 times on `P2002` |
| 6 | No repository check | `repository` must equal `RELEASE_GITHUB_REPOSITORY` (default `urgaynow2024-cloud/urgaynowweb`), else `403` |
| 7 | Plain `!==` secret compare | `timingSafeEqual`, and the endpoint **fails closed** when the secret is unset |
| 8 | **Auto-changelogs were empty** (found by testing, see §4) | Classifier understands plain-English commit subjects; unclassified commits are now listed instead of silently dropped |
| 9 | Discord link pointed at `/updates/1-2-0`, which 404s | Links the real generated slug, and adds the commit SHA field |

---

## 2. What was implemented

### 2.1 `lib/release-generator.ts`

- `createReleaseFromCommits({ headSha, commits, branch, deploymentId, previousSha })`
  now takes the commit list from the caller instead of shelling out to git.
  `getCommitsBetween` is unchanged and still used by the admin draft generator.
- **Idempotent on `headSha`.** Returns `created: false` and the existing row when a
  release for that commit already exists; refreshes `deploymentId` on redeploy.
- `getLatestPublishedVersion()` → numerically highest published version.
- New exports: `parseVersion`, `compareVersions`, `findReleaseByCommit`,
  `CreateReleaseInput`, `CreateReleaseResult`.
- `classifyCommits()` keeps conventional-commit prefixes authoritative and adds
  leading-word heuristics (`Add…` → feature, `Fix…` → fix, `Reduce…` → improvement).
- `generateReleaseInfo()` now lists `other` commits under Improvements and counts
  them in the summary, so a push can never produce an empty changelog.
- Single-commit releases use the commit subject as the summary instead of
  `"1 change in this release"`.

### 2.2 `app/api/releases/route.ts`

- **Fails closed** on auth when `RELEASE_CRON_SECRET` is unset; constant-time compare.
- Requires a full 40-hex `headSha`, a matching `repository`, and
  `deployment.target === "production"` with a successful `deployment.state`;
  anything else returns `422` and creates nothing.
- New `GET` returns the latest published release and `previousCommit`, which is how
  the workflow computes the exact commit range without git on the server.
- Calls `revalidatePath` for `/updates`, `/updates/[slug]` and `/`.
- Correct Discord URL (real slug) and a `Commit` field.
- `UGN_SKIP_DISCORD_NOTIFICATIONS=1` suppresses the notification; it is **not** set
  in the Vercel project, so production still announces every release.
- **No new unauthenticated endpoint.** The shared secret is required on both methods.

### 2.3 `.github/workflows/auto-release.yml` (rewritten)

`push` to `main` → checkout → resolve commit range → wait for Vercel `success` →
`POST /api/releases` → job summary.

- `concurrency: auto-release-${{ github.ref }}` with `cancel-in-progress: false` —
  pushes **queue** rather than cancel, because each successful deployment must
  produce one update.
- `permissions: contents: read, statuses: read` — no write scopes anywhere.
- Commit range: last released commit → else `github.event.before` → else root commit,
  then `git log --no-merges`. Record/field separators (`0x1e` / `0x1f`) keep
  multi-line commit bodies intact.
- Deployment gate polls the Vercel commit status for **that exact SHA**, up to 15
  minutes. `failure`/`error` → no update, workflow succeeds with an explicit note.
  Timeout → workflow fails loudly rather than publishing unverified.
- Deployment id extracted from the Vercel status URL and stored on the update.
- Secrets used: `RELEASE_CRON_SECRET` only. `NEXT_PUBLIC_SITE_URL` is optional
  (falls back to `https://urgaynow.com`), which matters because
  `gh secret list` and `gh variable list` are both **empty** on this repository.

### 2.4 Also

- `app/api/updates/revalidate/route.ts` — path allowlist.
- `.env.example` — documents `RELEASE_CRON_SECRET` and `RELEASE_GITHUB_REPOSITORY`.
- `scripts/verify-auto-release.ts` + `npm run test:release`.

---

## 3. Verification — actually executed

### 3.1 Static checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx next lint` | clean, no warnings |
| `npx next build` | success; `/updates` and `/updates/[slug]` still dynamic |
| `npm run test:reviews` | 30/30 |
| `npm run test:theme-engine` | 155/155 |
| Workflow YAML parsed; every step checked for `run`/`uses` | 6/6 steps valid (this is the check the old file failed) |
| Live endpoint fails closed | `POST /api/releases` no auth → 401, bad secret → 401 |

### 3.2 Full flow against a real server and the real database

`next dev` on :3210 against live Supabase, `npm run test:release` →
**57 passed, 0 failed**.

| Requirement | Evidence |
| --- | --- |
| Unauthenticated cannot create an update | 401, 0 rows |
| Wrong secret cannot create an update | 401 |
| Foreign repository rejected | 403, 0 rows |
| Malformed SHA rejected | 400 |
| **Build failed → NO public update** | `deployment.state: "error"` → 422, 0 rows |
| Preview deployment → NO public update | `target: "preview"` → 422, 0 rows |
| Successful deployment → update created | 200, exactly 1 row, `PUBLISHED`, `publishedAt` set, `generatedAutomatically: true` |
| Version generated and higher than all existing | valid semver, above every baseline version |
| Commit + deployment recorded | `sourceCommit`, `deploymentId`, `sourceBranch`, `sourcePreviousCommit` all stored |
| **/updates shows it immediately** | HTML contains `v<version>`, links `/updates/<slug>`, detail page returns 200 |
| Existing updates intact | baseline entry still listed, unchanged, same id and version |
| **Same push processed twice → ONE record** | replay returns 200 `alreadyReleased`, original `updateId`, still exactly 1 row |
| **Rollback/redeploy → no misleading duplicate** | same 1 row, `deploymentId` refreshed, version unchanged |
| Every push gets its own update | second push → new row, different + higher version, different slug |
| Concurrent pushes | 3 simultaneous releases → 3 rows, 3 distinct versions, no unique-violation |
| Real commit messages reach the changelog | `Add…` → What's New, `Fix…` → Bug Fixes, `Reduce…` → Improvements, nothing dropped, MINOR version |
| Cleanup / no pollution | all probe rows deleted, published count back to baseline, pre-existing row untouched |

Probe rows use synthetic SHAs that are not real commits, so they can never block a
genuine release. A sweep at the start of the run deletes anything left by an
interrupted run (matched on the `dpl_probe_` deployment-id prefix), which is what
made an earlier interrupted run self-healing.

### 3.3 Workflow → route data contract

The workflow's `git log` + jq parsing was executed over real history
(`c6e970e..6b21d9e` → 4 commits with multi-line bodies) and posted to the live
endpoint: 4 commits parsed correctly, version `1.1.0` (Feature Release), commit
subjects present in the changelog, commit **bodies correctly not leaked** into
public content. The row was deleted afterwards.

### 3.4 Side effects during testing, disclosed

- Early verification runs posted real changelog notifications to the configured
  `DISCORD_UPDATES_WEBHOOK_URL` before the suppression flag was added (a handful of
  `v1.0.x` / `v1.1.x` probe messages in the UGN updates channel). They were
  notifications only — **no database row was left behind** — and webhook messages
  cannot be recalled through the Discord API.
  `UGN_SKIP_DISCORD_NOTIFICATIONS=1` now prevents recurrence.
- One transient `Can't reach database server` blip from the Supabase pooler during a
  run. The release itself succeeded; the probe's own cleanup connection failed and
  the stray row was removed. `retry()` now guards the verification script's database
  calls. Pre-existing pooler fragility, not introduced here.

---

## 4. Bugs found by testing, not by reading

1. **Empty changelogs.** All four real commits ("Add community reviews page…",
   "Fix review moderation actions…", …) matched none of `feat:` / `fix:` / `perf:`,
   and `generateReleaseInfo` dropped the `other` bucket entirely. A real release
   would have published `summary: "No changes recorded"` with every section empty.
   Fixed by the classifier heuristics plus listing `other`.
2. **Redeploy did not update `deploymentId`.** The route short-circuited on an
   existing `sourceCommit` before reaching the idempotent handler, so a redeploy left
   the stale deployment id. The route now only short-circuits when no commit payload
   was supplied; otherwise dedupe happens in exactly one place.

---

## 5. NOT yet live — two one-time setup steps

The code is complete and tested locally. The production half cannot be activated
from here, and **no real GitHub push → Vercel → update run has been observed yet.**

1. **Vercel project env** — add `RELEASE_CRON_SECRET` (any 32+ random characters) to
   **all** environments so preview deployments behave identically.
2. **GitHub repository secret** — add the identical value:

```
printf '%s' "<value>" | gh secret set RELEASE_CRON_SECRET --repo urgaynow2024-cloud/urgaynowweb
```

Then push to `main`. Vercel deploys, the workflow sees `Vercel: success`, and
`/updates` gains an entry within seconds.

A local test secret already exists in `.env` (gitignored). **It must be replaced by
the same real value in both places above**, and `UGN_SKIP_DISCORD_NOTIFICATIONS`
must **not** be added to Vercel.

Manual trigger once, to confirm end to end without waiting for a push:

```
gh workflow run auto-release.yml --repo urgaynow2024-cloud/urgaynowweb
```

---

## 6. Intentionally NOT changed

`prisma/schema.prisma` and all migrations (the existing `Update` columns —
`sourceCommit`, `deploymentId`, `generatedAutomatically`, `releaseStatus` — already
cover every required field, so no migration was needed), `package.json` `version`,
the admin update manager UI and its server actions, `/updates` and `/updates/[slug]`
rendering, the report system, Community Reviews, authentication, staff permissions,
events, announcements, the seasonal system, `next.config.mjs`, and all existing
published updates.

---

## 7. Open items for a follow-up (pre-existing, out of scope)

- `prisma/migrations/` has **no** migration for the six auto-release columns; they
  exist only because `prisma db push` was used. A fresh `migrate deploy` against a
  new database would produce an `Update` table without them.
- `sql/schema.sql` still describes the old `Update` table.
- `app/admin/updates/actions.ts` duplicates `execGit` / `classifyCommits` /
  `sanitize` from `lib/release-generator.ts`, and the copies have drifted.
- `generateDraftFromRecentChanges` and `regenerateSummary` still call git from a
  server action, so they cannot work on Vercel — they silently fail to
  `/admin/updates?error=1`.
- `createUpdate` / `updateUpdate` never set `releaseStatus`, so a manually published
  update shows as `DRAFT` in the admin Status column.
- `middleware.ts` falls back to a hardcoded dev secret when `AUTH_SECRET` is unset.
- `/updates` and `/updates/<slug>` are missing from `app/sitemap.ts`,
  `app/feed.xml/route.ts` and the footer.
- `Update.images` is unvalidated free-text JSON rendered through `next/image`, whose
  `remotePatterns` allow only two hosts.
