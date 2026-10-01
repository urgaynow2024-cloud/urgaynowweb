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
| 🛡️ Protected staff report dashboard | Implemented and verified (including permission tests) |
| 📜 Bot Terms of Service | Implemented, verified renders |
| 🔐 Bot Privacy Policy | Implemented, verified renders |
| ©️ UGN Ownership / IP documentation | Implemented, verified renders |
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