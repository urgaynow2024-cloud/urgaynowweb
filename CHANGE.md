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