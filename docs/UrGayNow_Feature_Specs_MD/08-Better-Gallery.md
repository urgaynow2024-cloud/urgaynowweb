# Better Community Gallery

## Goal
Surface approved community content in a searchable, filterable showcase and let visitors browse submissions in detail without losing their place.

## What belongs here vs the submission flow
Community submissions live in `CommunitySubmission` (see 07-Community-Submissions); this document covers only the gallery *presentation layer* — how approved content is displayed, filtered, sorted, and opened. Reporting, staff moderation, and creator attribution are handled by the shared systems referenced below.

## Gallery data model
`GalleryImage` (schema.sql:204) is the read model for publicly shown community media. Its own status enum `gallery_status` has three states:
`PENDING`, `APPROVED`, `REJECTED` (schema.sql:22).

Columns: `title`, `description`, `imageUrl`, `status`, `submitterName`, `rejectionReason`, `reviewedAt`, `createdAt`.
Index: `(status, createdAt)` (schema.sql:415). Only `APPROVED` rows are ever returned to visitors.

## Sources
- Approved `CommunitySubmission` rows (`published = true`) feed the gallery content (see 07-Community-Submissions).
- Creator attribution is resolved from submitter identity, surfaced via profiles (see 16-User-Community-Profiles).

## Display features
- Grid and responsive layouts.
- Category filter (mapped from `CommunitySubmission.type`, see 07-Community-Submissions).
- Creator filtering.
- Search by title/description/tags.
- Newest / popular sorting.
- Submission detail pages with a clean lightbox experience.
- Optional likes/favourites.

## UX
- Strong image previews.
- Lazy loading offscreen images.
- Descriptive alt text derived from the submission `title`/`description`.
- Lightbox/detail keeps scroll position so focus returns to the originating card.

## Accessibility
Follow the shared accessibility requirements in 21-Accessibility-Improvements (keyboard navigation, focus states, reduced-motion, alt text, no colour-only cues). Lazy loading and preview images must retain accessible alt text.

## Reporting & moderation integration (not duplicated here)
- Report content and follow report status via the shared report system (see 11-Website-Report-System, 12-Report-Tracking).
- Staff moderation controls and the audit log live in the Staff Dashboard (see 10-Staff-Moderation-Dashboard).
- Unpublishing a submission hides it from the gallery; rejected submissions never appear.

## Acceptance criteria
A visitor can find approved community content by creator, type, or search term, open a detail/lightbox view, and return to the grid without losing their place. Only `APPROVED` gallery rows are visible.
