# Updates & Changelog System

## Goal
Create an automatic, card-based update system for website releases.

## Public page
Route suggestion: `/updates`

Each update card should show:
- Version
- Title
- Release date
- Update type
- Short summary
- Small change highlights
- Read full update action

Clicking opens a dedicated update page or modal containing:
- Full summary
- What's New
- Improvements
- Bug Fixes
- Security / Moderation
- Images where applicable
- Credits
- Related updates

## Versioning
Use semantic versioning:
- Major: breaking/large platform changes
- Minor: new backwards-compatible features
- Patch: fixes and small improvements

Version numbers should be generated or suggested by the release workflow rather than repeatedly typed by hand.

## Admin publishing & storage
Admin editor inputs: Version, Type, Title, Summary, What's New, Improvements, Bug Fixes, Security/Moderation, Images, Publish date, Draft/Published state, Post to Discord toggle. Saving a draft must never post to Discord.

Storage fields: `id`, `slug`, `version`, `type`, `title`, `summary`, `whatsNew`, `improvements`, `bugFixes`, `securityNotes`, `images`, `authorId`, `publishedAt`, `createdAt`, `updatedAt`, `discordPostedAt`, `discordPostStatus`.

## Discord webhook
Use a dedicated environment variable:
`DISCORD_UPDATES_WEBHOOK_URL`

Publishing an update can send a branded Discord embed containing version, title, summary, highlights, release date, and a link to the full update.

## Reliability
The database is the source of truth (generic controls in 25-Implementation-Roadmap). A failed Discord webhook must not undo or lose the published update. Record webhook delivery status and allow staff to retry.

## Implementation

### Public pages
- `app/updates/page.tsx` — list of published updates as cards, newest first. Each card shows version, type badge, release date, title, summary, and a "Read full update" link.
- `app/updates/[slug]/page.tsx` — detail page with full summary, What's New, Improvements, Bug Fixes, Security & Moderation, images, and prev/next navigation between releases.

### Admin pages
- `app/admin/updates/page.tsx` — list with search, Discord status column, and per-row edit/delete.
- `app/admin/updates/new/page.tsx` — create form with auto-suggested version numbers (calls `suggestVersion()` for MAJOR/MINOR/PATCH).
- `app/admin/updates/[id]/page.tsx` — edit form with a "Retry Discord post" button when status is `failed`.

### Actions (`app/admin/updates/actions.ts`)
- `createUpdate` — validates version + title, generates a unique slug, creates the record, posts to Discord if published + toggled.
- `updateUpdate` — same flow for edits; preserves the existing slug when the title is unchanged.
- `retryUpdateWebhook` — re-sends the webhook for a failed post.
- `deleteUpdate` — removes the record.
- `suggestVersion(type)` — reads the latest published version, splits on `.`, and increments the appropriate segment (e.g. `1.2.3` + MINOR → `1.3.0`). Returns `1.0.0` when no updates exist yet.

### Webhook
- `lib/discord-webhook.ts` `sendContentWebhook("DISCORD_UPDATES_WEBHOOK_URL", { surface: "UPDATE", ... })` builds a branded embed with version, title, summary, type, release date, and a link to `/updates/{slug}`.
- `postUpdateWebhook()` in actions.ts records `discordPostedAt` and `discordPostStatus` (`sent`/`failed`) after the call — a failure never undoes the published update.

### Form
- `app/admin/updates/UpdateForm.tsx` — all spec fields plus the shared `DiscordWebhookPanel` for the Post to Discord toggle + role picker. A "Publish" checkbox controls draft vs. published state; drafts never post to Discord.

## Acceptance criteria
- Staff can create drafts.
- Staff can publish updates.
- Version appears consistently throughout the site.
- Published updates appear as cards.
- Cards open detailed information.
- Publishing can post to the dedicated Discord webhook.
- Discord failure does not lose the update.
- Older updates remain searchable and accessible (see 15-Website-Search).

Additionally:
- `tsc --noEmit` and `next lint` pass.
- Version numbers are suggested automatically; staff only confirm or override.
- The `/updates` route is linked from the main navigation (`lib/nav-links.ts`).
