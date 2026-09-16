# Gallery — Fix the Data Flow and Redesign the Experience

## Problem
The current public Gallery queries:
- `GalleryImage` where `status = APPROVED`
- all `GroupPhoto` records

Community submissions are stored separately in `CommunitySubmission`. The submission API creates a `CommunitySubmission` row with `PENDING` status, but the public Gallery does not read that model. This can produce the exact symptom: **"0 photos" even though photos exist in the community submission system.**

## Required architecture
Create one canonical public-gallery read path.

### Preferred approach
Treat approved and published `CommunitySubmission` records as gallery content. Continue supporting legacy `GalleryImage` records during migration, and continue supporting `GroupPhoto` as a distinct community-moments type.

Public Gallery should combine:
1. Published + approved `CommunitySubmission`
2. Legacy `GalleryImage` records that are approved and published/eligible
3. `GroupPhoto` records

Normalize all three sources into one presentation type before rendering.

Example normalized fields:
- `id`
- `sourceType`: `SUBMISSION | GALLERY_IMAGE | GROUP_PHOTO`
- `sourceId`
- `title`
- `description`
- `imageUrl`
- `submitterName`
- `category`
- `createdAt`
- `href`
- `status`

Do not expose pending/rejected content publicly.

## Publishing workflow
When a moderator approves a `CommunitySubmission`:
- set `status = APPROVED`
- set `published = true`
- set `publishedAt = now()`
- create a moderation log entry
- invalidate/revalidate the Gallery route

When a moderator rejects it:
- keep it out of the public Gallery
- store rejection reason
- log the action

When staff unpublish an approved submission:
- set `published = false`
- retain the record and moderation history
- remove it from public Gallery immediately after cache revalidation

## Do not create duplicate records unnecessarily
Do not copy the same image into both `CommunitySubmission` and `GalleryImage` merely to make the page work. If a compatibility sync is temporarily required, add an explicit source reference and uniqueness protection.

## Public Gallery redesign
Replace the current basic gallery presentation with:

### Header
- Eyebrow: `Community`
- Large title: `Community Gallery`
- Short description explaining that these are approved community moments.
- Primary CTA: `Share a photo`
- Secondary CTA: `View group moments`

### Toolbar
- Search
- Category/type filter
- Sort: Newest / Oldest
- Optional creator/submitter filter
- Clear filters
- Result count

### Categories
Map the existing `CommunitySubmissionType` values into friendly labels:
- Artwork
- Avatars
- Screenshots
- Photography
- VRChat Worlds
- Creator Projects
- Other

### Cards
Every card should have:
- Strong image preview
- Title
- Type badge
- Submitter/creator where available
- Date where useful
- Hover/focus treatment
- Accessible alt text
- Clear click target

### Detail view
Open a proper detail route or modal containing:
- Large image
- Title
- Description
- Category
- Submitted by
- Date
- Report action
- Share/copy link
- Back to Gallery

Preserve the user's scroll position when closing a modal.

## Empty states
Never show a generic "0 photos" card when there are no results without explaining why.

Use separate states:
- No published photos yet: `The community gallery is waiting for its first approved photo.`
- Search returned nothing: `Nothing matched those filters.`
- Data request failed: `The gallery could not be loaded. Try again.`
- Loading: skeleton grid, not a blank page.

## Admin Gallery
Redesign Admin > Gallery so staff can see:
- Pending submissions
- Approved/published
- Approved but unpublished
- Rejected
- Legacy gallery images
- Group photos

Add a prominent `Needs review` queue at the top.

## Image implementation
Replace avoidable raw `<img>` usage with `next/image` where practical. Configure remote image sources correctly. Do not blindly suppress `@next/next/no-img-element`; only keep `<img>` where a dynamic/untrusted source or special rendering case genuinely requires it.

## Acceptance tests
1. Submit a photo through the public submission form.
2. Confirm it appears in Admin > Gallery/Moderation as pending.
3. Approve it.
4. Confirm it appears in the public Gallery without manually creating another GalleryImage.
5. Confirm rejected submissions never appear publicly.
6. Confirm unpublishing removes it from the public Gallery.
7. Confirm the Gallery no longer reports 0 when approved community submissions exist.
8. Test with 0, 1, 12, and 13+ published items.
9. Test desktop and mobile.
10. Test broken image URLs and database failure states.
