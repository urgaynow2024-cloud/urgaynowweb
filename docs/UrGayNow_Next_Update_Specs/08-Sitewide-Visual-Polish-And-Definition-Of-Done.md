# Sitewide Visual Polish + Definition of Done

## Goal
Make the entire site feel updated, not just the newly touched pages.

## Shared visual language
Use the existing Ur Gay Now brand but establish a stronger design system:
- consistent typography scale
- consistent container widths
- consistent button sizes
- consistent card radii
- consistent borders
- consistent shadows
- consistent status badges
- consistent iconography
- consistent form controls

## Avoid the "AI card soup" look
Do not put every sentence inside a card. Cards should represent a meaningful object or action.

Use:
- sections
- dividers
- whitespace
- typography hierarchy
- grouped controls
- occasional cards for important content

## Empty states
Every major page needs a designed empty state with:
- icon/illustration
- clear title
- one-sentence explanation
- useful action when one exists

Examples:
- Gallery
- Links
- Events
- Updates
- Staff
- Reports
- Moderation queues

## Loading states
Use skeletons that match the final layout rather than generic grey blocks.

## Error states
Use friendly branded error panels with:
- what went wrong
- retry where possible
- safe fallback navigation

Do not expose stack traces to visitors.

## Image warnings
The build currently reports multiple `@next/next/no-img-element` warnings. Audit every warning and replace raw `<img>` with `next/image` when appropriate.

Do not disable the ESLint rule just to make the build output quiet.

## Performance
- Lazy-load below-the-fold images.
- Use responsive image sizes.
- Avoid loading huge original images into thumbnails.
- Keep client components limited to interactive areas.
- Avoid unnecessary page-wide client-side state.

## Accessibility
- keyboard navigation
- visible focus states
- semantic headings
- descriptive labels
- alt text
- reduced motion
- sufficient contrast
- no colour-only status indicators

## Verification checklist
Before calling this overhaul complete:

### Public
- [ ] Home
- [ ] Events list
- [ ] Event detail
- [ ] Gallery
- [ ] Community
- [ ] Staff
- [ ] Links
- [ ] Partners
- [ ] Shop
- [ ] Guides / FAQ
- [ ] Rules
- [ ] Updates
- [ ] Support
- [ ] Search
- [ ] 404

### Admin
- [ ] Dashboard
- [ ] Staff
- [ ] Announcements
- [ ] Events
- [ ] Gallery
- [ ] Group Photos
- [ ] Links
- [ ] Partners
- [ ] Shop
- [ ] Moderation
- [ ] Reports
- [ ] Guides
- [ ] Rules
- [ ] Updates
- [ ] Settings
- [ ] Theme

### Engineering
- [ ] `tsc --noEmit`
- [ ] ESLint passes without newly introduced warnings
- [ ] production build succeeds
- [ ] database migrations are included
- [ ] server-side permissions are enforced
- [ ] public forms are rate limited
- [ ] uploads are validated
- [ ] critical actions have error handling
- [ ] cache revalidation is correct
- [ ] mobile tested
- [ ] accessibility basics tested

## Important implementation rule for Kilo
If an existing implementation conflicts with these specs, update the implementation instead of writing another parallel component that leaves the old broken path in place.

Do not stop after creating UI components. Trace each feature through the database and server actions and remove/replace obsolete paths where appropriate.
