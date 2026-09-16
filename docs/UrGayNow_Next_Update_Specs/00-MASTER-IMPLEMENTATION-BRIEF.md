# Ur Gay Now — Next Major Website Update

## Purpose
This is the implementation brief for the next Ur Gay Now overhaul. The goal is **not** to make a few cosmetic tweaks. The current site has several places where the UI looks upgraded but the underlying content flow is still disconnected. Kilo should treat this pack as a real implementation specification: fix the data flows, redesign the admin experience, and make the public pages feel like one intentional product.

## Current problems to fix
- Public Gallery can show `0 photos` even though community submissions/photos exist.
- Community submissions are stored in `CommunitySubmission`, while the public Gallery currently reads `GalleryImage` + `GroupPhoto`, creating a disconnected publishing path.
- Event detail pages need a reliable "read full event" flow with proper Markdown rendering, stable navigation, loading/error handling, and no broken links/actions.
- Staff admin page is functional but looks like a basic database table and does not provide enough context, grouping, or quick management tools.
- Admin Dashboard is visually plain and does not give staff a useful "what needs attention?" overview.
- Links page is mostly a list of cards and needs a richer, categorized, branded link hub.
- Updates/Changelog is manually maintained and should be generated from actual releases/pushes.
- Seasonal themes need to be controllable from Admin without editing code.
- Existing design work must be applied consistently instead of leaving older page layouts in place.

## Non-negotiable implementation rule
Do not declare a feature complete because a component exists. Verify the full path:

`database -> server query -> action/API -> public/admin UI -> empty/loading/error state -> mobile -> production build`

If a feature is supposed to be automatic, test the automatic path rather than only testing the manual admin form.

## Specs in this pack
1. `01-Gallery-Data-Flow-And-Redesign.md`
2. `02-Event-Detail-Reliability-And-UX.md`
3. `03-Staff-Page-Overhaul.md`
4. `04-Admin-Dashboard-Overhaul.md`
5. `05-Links-Hub-Redesign.md`
6. `06-Automatic-Updates-And-Release-Notes.md`
7. `07-Admin-Seasonal-Theme-System.md`
8. `08-Sitewide-Visual-Polish-And-Definition-Of-Done.md`

## Existing files to inspect before changing anything
- `app/gallery/page.tsx`
- `app/api/gallery/submit/route.ts`
- `app/api/community/submit/route.ts`
- `app/admin/gallery/page.tsx`
- `app/admin/staff/page.tsx`
- `app/admin/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/settings/SettingsForm.tsx`
- `app/admin/updates/page.tsx`
- `app/admin/updates/actions.ts`
- `app/updates/page.tsx`
- `app/updates/[slug]/page.tsx`
- `app/events/[slug]/page.tsx`
- `components/event/EventClient.tsx`
- `components/ThemeProvider.tsx`
- `app/globals.css`
- `lib/settings.ts`
- `prisma/schema.prisma`
- `docs/UrGayNow_Feature_Specs_MD/*`

## Quality bar
The finished site should feel playful, modern, community-focused, and intentionally designed — not like a generic CRUD dashboard and not like a collection of AI-generated cards. Reuse the existing brand language, but improve hierarchy, spacing, information density, and interaction design.
