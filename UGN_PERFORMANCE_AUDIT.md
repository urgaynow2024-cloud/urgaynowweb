# UGN Website Performance Audit & Safe Optimization Plan

**Website:** https://www.urgaynow.com/  
**Project:** Ur Gay Now — VRChat LGBTQ+ Community  
**Purpose:** Reduce perceived and actual website lag without changing the existing UGN design, branding, content, permissions, or functionality.

> **Important:** This document is an optimization plan, not a redesign. Do not remove features or change the visual identity just to improve a benchmark score. Measure first, optimize the expensive parts, then verify that everything still works.

---

## 1. Current Assessment

The live UGN homepage contains several different content types on a single page:

- Hero/landing content
- Community feature cards
- Live/upcoming event information
- Latest announcements
- Community statistics
- Staff/team profiles
- Multiple staff avatar images
- Social/external links
- Footer navigation and legal links

The homepage is therefore doing more work than a simple static landing page.

### Important observation

The homepage currently displays staff profiles and avatar images directly on the landing page. It also displays live event and announcement content.

These are **potential performance contributors**, especially if:

- Avatar images are large originals.
- Images are loaded before they enter the viewport.
- Images are PNGs when WebP/AVIF would be sufficient.
- The same images are fetched repeatedly.
- Dynamic data causes unnecessary client-side re-rendering.
- API/database requests happen multiple times during initial page load.

Do not assume any single one of these is the cause until the browser Network panel and performance tools confirm it.

---

# 2. Main Goals

Kilo should optimize the site around these goals:

1. Make the first visible part of the homepage appear quickly.
2. Prevent below-the-fold content from blocking the initial render.
3. Reduce image bandwidth.
4. Reduce unnecessary JavaScript execution.
5. Reduce duplicate API/database requests.
6. Improve caching for static content.
7. Keep animations smooth.
8. Prevent layout shifting while content/images load.
9. Preserve the current UGN UI/UX.
10. Avoid breaking authentication, reports, staff tools, events, news, legal pages, or admin features.

---

# 3. DO NOT Do These Things

Do **not**:

- Redesign the homepage.
- Remove staff profiles.
- Remove events/news.
- Remove community features.
- Replace the current UGN theme.
- Remove accessibility features.
- Disable important animations without checking their purpose.
- Replace working functionality with static placeholder data.
- Remove authentication or permission checks.
- Move sensitive moderation/admin functionality client-side.
- Change database schemas solely for a benchmark score.
- Add random third-party optimization scripts.
- Add another analytics provider without approval.
- Install multiple image optimization libraries when the framework already provides one.
- Disable security headers or caching controls that are intentionally configured.
- Cache private/user-specific data publicly.
- Cache moderation/report/admin data in a way that could expose private information.

---

# 4. Phase 1 — Measure Before Changing Anything

Run a baseline performance test against the production website.

Test at least:

- Desktop
- Mobile
- Fast 4G/throttled connection
- Slow 4G/throttled connection
- Cold cache
- Warm cache

Record:

- LCP
- INP
- CLS
- FCP
- TTFB
- Total transferred bytes
- Number of requests
- JavaScript transferred
- CSS transferred
- Image transferred
- Font transferred
- Long tasks
- Main-thread blocking time

Also record the exact production commit/build being tested.

### Required baseline report

Create:

`docs/performance/baseline.md`

Include:

```text
Test date:
Production URL:
Git commit:
Build environment:

Desktop:
LCP:
INP:
CLS:
FCP:
TTFB:
Transferred:
Requests:

Mobile:
LCP:
INP:
CLS:
FCP:
TTFB:
Transferred:
Requests:
```

Do not report made-up numbers.

---

# 5. Phase 2 — Network Audit

Open Chrome/Edge DevTools:

**Network → Disable cache → Reload**

Sort by:

- Size
- Time
- Waterfall

Look for:

### A. Very large images

Find images larger than:

- 250 KB
- 500 KB
- 1 MB
- 2 MB+

Any large image should be investigated.

### B. Duplicate requests

Look for the same:

- avatar
- API endpoint
- font
- CSS file
- JavaScript chunk
- event request

being downloaded more than once.

### C. Slow API requests

Identify requests taking:

- >250 ms
- >500 ms
- >1 second

Do not automatically optimize every slow request. Determine whether it blocks the first render.

### D. Render-blocking resources

Check whether:

- Fonts
- CSS
- JavaScript
- API calls
- external resources

are blocking the initial page.

---

# 6. Image Optimization

This is one of the first areas to investigate.

## Staff avatars

The homepage currently displays staff avatars.

Make sure staff images use:

- Responsive sizing
- Modern image formats
- Appropriate dimensions
- Lazy loading where appropriate
- Explicit width/height or aspect-ratio
- CDN/object-storage caching

Prefer:

```text
AVIF
WebP
```

where supported.

Do not blindly convert every image if the current image pipeline already handles this.

---

## Above-the-fold images

Images visible immediately should not be lazy-loaded if doing so hurts LCP.

For the main hero image:

- Optimize the actual source file.
- Use the correct display dimensions.
- Preload only if measurement shows it is the LCP resource.
- Do not preload every image.

---

## Below-the-fold images

Staff avatars and other images below the initial viewport should normally be lazy-loaded.

Example:

```tsx
<Image
  src={avatar}
  alt={displayName}
  width={320}
  height={320}
  loading="lazy"
/>
```

Use the project's existing image component/configuration rather than introducing a second image system.

---

# 7. Image Dimensions

Do not send a 3000×3000 image when the card only displays it at approximately 150×150.

The image pipeline should request an appropriate size.

For example:

```text
Original:
3000 × 3000

Displayed:
160 × 160

Requested asset:
320 × 320
```

This can dramatically reduce bandwidth while preserving visual quality.

---

# 8. Prevent Layout Shift

Every staff/avatar/image slot should reserve its space before the image loads.

Use:

```css
aspect-ratio: 1 / 1;
```

or explicit dimensions.

Avoid:

```css
img {
  width: 100%;
  height: auto;
}
```

without a stable parent/container when the image dimensions are unknown.

CLS should be measured before and after the change.

---

# 9. Staff Section Optimization

Do not remove the staff section.

Instead:

### Recommended

Keep the same UI but:

- Render only the intended homepage subset.
- Load optimized thumbnails.
- Lazy-load profiles outside the initial viewport.
- Avoid fetching the entire staff directory if the homepage only displays a subset.
- Link to the full staff page for the remaining staff.
- Cache public staff profile data appropriately.

### Check for this problem

If the homepage currently fetches:

```text
/all staff
/all profile information
/all social links
/all moderation metadata
```

just to display a few staff cards, change this.

The homepage should request only the public data it actually needs.

For example:

```text
Homepage:
featuredStaff [
  id
  displayName
  username
  role
  avatar
  shortBio
  publicLinks
]
```

Do NOT send private staff/moderation fields.

---

# 10. Dynamic Events

The homepage currently displays live event information.

Keep this functionality.

However, check whether the event component:

- Fetches repeatedly.
- Polls unnecessarily.
- Fetches the entire event database.
- Refetches after hydration.
- Fetches both server-side and client-side.
- Requests event data multiple times through different components.

If only one event is displayed, do not request hundreds of events.

Prefer:

```text
homepageEvent:
  id
  title
  status
  start
  end
  description
  image
  link
```

rather than the entire event dataset.

---

# 11. Announcements / News

The homepage only needs a small amount of news.

Prefer fetching:

```text
latest 1–3 announcements
```

rather than the entire news archive.

The full archive should remain on the news page.

If announcements are public and change infrequently, investigate short-lived caching/revalidation.

Example concept:

```ts
revalidate = 60
```

Use a value appropriate to the project's requirements.

Do not cache private or staff-only announcements publicly.

---

# 12. Server vs Client Components

This is especially important if the site uses Next.js.

Audit homepage components for:

```tsx
"use client";
```

Do not remove it blindly.

Instead determine why each component needs to be client-side.

A component should not be client-side simply because:

- It displays text.
- It displays an image.
- It renders a static card.
- It receives server data as props.

Potentially interactive components can remain client-side.

The goal is to avoid turning the entire homepage into one large client bundle.

---

# 13. JavaScript Bundle Audit

Run the production build and inspect the bundle.

Look for:

- Large dependencies
- Duplicate packages
- Client-side libraries used for simple tasks
- Heavy animation libraries
- Date libraries
- Icon libraries importing entire sets
- Large markdown/rendering packages loaded globally
- Admin/moderation packages accidentally bundled into public pages

Admin functionality should not inflate the public homepage bundle.

---

# 14. Avoid Loading Admin Code on Public Pages

The public homepage should not load:

- Admin dashboard code
- Founder controls
- Moderation tools
- Report-management UI
- Staff-only APIs
- Private database clients
- Admin-only dependencies

Make sure these remain route-specific.

---

# 15. Database/API Audit

Check the server logs during a fresh homepage request.

Count:

```text
Database queries
API requests
External requests
Authentication checks
Staff lookups
Event lookups
Announcement lookups
```

Watch for:

```text
N+1 queries
```

Example of a bad pattern:

```text
Get 6 staff
→ query avatar for each
→ query role for each
→ query links for each
→ query permissions for each
```

Prefer fetching the required public data efficiently.

---

# 16. Caching

Review caching for:

### Static assets

Should generally have long cache lifetimes when safely fingerprinted.

Examples:

```text
/_next/static/*
images/*
fonts/*
```

### Public content

Consider short revalidation for:

- Public announcements
- Public events
- Public staff directory data

### Never publicly cache

- Reports
- Moderation cases
- Admin pages
- Private profiles
- Authentication responses
- User-specific data

---

# 17. Fonts

Audit all fonts.

Check:

- Number of font files
- Number of weights
- Font file size
- Whether unused weights are downloaded
- Whether external font providers are used
- Whether fonts block rendering

If the site only uses:

```text
Regular
Medium
Bold
```

do not load:

```text
100
200
300
400
500
600
700
800
900
```

unless actually required.

Use the project's existing font strategy where possible.

---

# 18. Animations

UGN can keep its visual effects.

However, audit:

```text
box-shadow
filter
backdrop-filter
blur
transform
opacity
large gradients
continuous animations
```

Pay particular attention to:

```css
backdrop-filter: blur(...);
```

and large animated elements.

These can be expensive on weaker GPUs/mobile devices.

Do not remove them immediately.

Instead test:

```text
Desktop GPU
Laptop
Mobile
Low-power device
```

If a specific effect causes frame drops, optimize only that effect.

---

# 19. Respect Reduced Motion

Make sure animated UI supports:

```css
@media (prefers-reduced-motion: reduce) {
  ...
}
```

Users who request reduced motion should not receive unnecessary continuous animation.

This is both an accessibility and performance improvement.

---

# 20. Third-Party Resources

Audit all external resources.

Potential examples:

- Social embeds
- Analytics
- Fonts
- External images
- Widgets
- Tracking scripts
- Discord/VRChat integrations

Do not load an external resource on the homepage unless it is actually required.

Social links are fine.

A social link does NOT require loading the social platform's scripts.

Prefer:

```text
normal hyperlink
```

over:

```text
embedded social widget
```

when the widget isn't necessary.

---

# 21. Preconnect Carefully

Only use:

```html
<link rel="preconnect">
```

for domains that are genuinely required early in page load.

Do not add preconnect tags for every external domain.

Too many connections can make performance worse.

---

# 22. Prefetching

Avoid aggressive prefetching.

Do not preload/prefetch:

```text
every staff page
every news page
every event
every social link
every image
```

Prefetch only routes/resources where it provides a measurable benefit.

---

# 23. Mobile Performance

This should be treated as a first-class target.

Test:

```text
iPhone-class device
Android-class device
Slow Android device
Mobile 4G
```

Check:

- Scrolling
- Menu opening
- Staff card animations
- Image loading
- Event cards
- News cards
- Page transitions
- Touch interaction

The site should not merely score well on desktop.

---

# 24. Loading States

Avoid making the page feel frozen.

Where dynamic content takes time:

Use lightweight skeletons or reserved spaces.

Avoid giant:

```text
Loading...
```

screens when only one section is waiting.

The rest of the homepage should remain usable.

---

# 25. Error Handling

Performance work must not hide errors.

After optimization verify:

- Homepage loads.
- Events load.
- News loads.
- Staff loads.
- Images load.
- Report links work.
- Legal pages work.
- Rules work.
- Support works.
- Gallery works.
- Shop works.
- Authentication works.
- Admin remains protected.
- Staff permissions remain correct.

---

# 26. Production Build Verification

Before deployment:

```bash
npm run lint
npm run typecheck
npm run build
```

If the project does not have all three scripts, use the project's existing equivalents.

Do not deploy a performance change that introduces:

- TypeScript errors
- Build errors
- Missing routes
- Broken images
- Broken API calls
- Permission regressions

---

# 27. Recommended Testing Sequence

Do this in order.

## Step 1

Record baseline performance.

## Step 2

Audit Network requests.

## Step 3

Optimize images.

## Step 4

Fix unnecessary homepage API/database work.

## Step 5

Reduce unnecessary client components.

## Step 6

Audit JavaScript bundles.

## Step 7

Review fonts.

## Step 8

Review animations.

## Step 9

Review caching.

## Step 10

Run production build.

## Step 11

Run functional regression testing.

## Step 12

Run performance testing again.

---

# 28. Acceptance Criteria

The optimization is successful only if:

### Performance

- [ ] LCP improves.
- [ ] INP remains responsive.
- [ ] CLS remains low.
- [ ] Initial page payload decreases where possible.
- [ ] Image payload decreases.
- [ ] Unnecessary requests are removed.
- [ ] No obvious long tasks remain on the homepage.

### Functionality

- [ ] Events still work.
- [ ] News still works.
- [ ] Staff profiles still work.
- [ ] Images still work.
- [ ] Report functionality still works.
- [ ] Legal pages still work.
- [ ] Gallery still works.
- [ ] Shop still works.
- [ ] Authentication still works.
- [ ] Admin/staff permissions remain unchanged.

### UX

- [ ] Existing UGN design is preserved.
- [ ] Existing branding is preserved.
- [ ] Mobile layout remains intact.
- [ ] Animations remain where appropriate.
- [ ] Accessibility is not reduced.
- [ ] No new flashing/flickering is introduced.

---

# 29. Before/After Report

After changes, create:

`docs/performance/after.md`

Use:

```text
Production URL:
New commit:
Test date:

                BEFORE       AFTER
LCP:
INP:
CLS:
FCP:
TTFB:
Requests:
Transferred:
JS:
CSS:
Images:

Largest improvements:

Remaining bottlenecks:

Functional tests:
PASS / FAIL
```

---

# 30. Important: Do Not Optimize Based Only on Lighthouse

A Lighthouse score is useful, but it is not the whole goal.

The actual objective is:

> Make UGN feel fast and responsive for real users.

A change that increases a benchmark score while making the site feel worse should not be accepted.

Measure:

- Real loading time
- Real interaction responsiveness
- Mobile performance
- Image loading
- Scroll smoothness
- Navigation responsiveness

---

# 31. Priority Order

Use this order unless measurements show a different bottleneck.

### P0 — Investigate immediately

1. Large homepage images
2. Duplicate network requests
3. Slow API/database requests
4. Excessive client-side JavaScript
5. Admin/private code leaking into public bundles

### P1 — Optimize next

6. Staff avatar loading
7. Event/news data fetching
8. Image dimensions and modern formats
9. Caching/revalidation
10. Font loading

### P2 — Fine tuning

11. Animation performance
12. Third-party resources
13. Prefetching
14. Minor CSS optimizations
15. Reduced-motion support

---

# 32. Suggested Developer Prompt

Give Kilo the following instruction:

```text
Please audit and optimize the Ur Gay Now website for performance.

IMPORTANT:
Do NOT redesign the website.
Do NOT change the UGN branding.
Do NOT remove features.
Do NOT remove staff, events, news, reports, legal pages, authentication, or admin functionality.

The goal is to make the existing site feel faster while preserving its current UI/UX.

Start by measuring the production homepage before changing anything.

Audit:
- Core Web Vitals
- Network requests
- Image sizes/formats
- Staff avatar loading
- API/database requests
- Duplicate requests
- Next.js server/client component usage
- JavaScript bundle size
- Fonts
- Caching
- Animations
- Third-party resources
- Mobile performance

Pay particular attention to the homepage staff section, avatar images, live event data, and latest announcements.

Do NOT guess the cause of lag. Measure it first.

For images:
- Use optimized modern formats where supported.
- Use responsive image sizes.
- Lazy-load below-the-fold images.
- Do not lazy-load the actual LCP image if that hurts LCP.
- Reserve image dimensions to prevent CLS.

For dynamic content:
- Do not fetch the entire staff/event/news database when the homepage only needs a small subset.
- Remove duplicate API requests.
- Avoid unnecessary client-side refetching.
- Keep private/admin/moderation data out of public requests and bundles.

For Next.js:
- Audit unnecessary "use client" usage.
- Keep static/public sections server-rendered where appropriate.
- Do not load admin/moderation dependencies into public routes.

Before deployment:
- Run lint/typecheck/build using the project's existing scripts.
- Test homepage, events, news, staff, reports, legal, gallery, shop, authentication, and admin permissions.
- Test desktop and mobile.

Create a before/after performance report with real measured numbers.

If you discover a potential optimization that could alter functionality or UX, stop and document it instead of making the risky change automatically.

Keep all changes focused on performance and stability.
```

---

# 33. Final Rule

**Measure → identify bottleneck → make the smallest safe change → test → measure again.**

Do not perform a large "performance rewrite" all at once.

The safest approach for UGN is a series of small, measurable optimizations so that if something breaks, the exact change responsible is easy to identify.


---

# 34. IMPORTANT — Do Not Create Test Reports

The report system must **NOT be spammed with test reports while performance work is being performed**.

The screenshot provided shows a real-looking UGN report being submitted:

```text
UGN-000028 — Inappropriate Content
Status: New
Type: Website content
Priority: High
```

This must not happen repeatedly during development/testing.

## Required rule

When testing the report system, Kilo/developers must **not create real production reports just to verify that the system works**.

Do not repeatedly submit:

- Test reports
- Fake moderation reports
- Fake inappropriate-content reports
- Fake user reports
- Fake evidence
- Fake attachments
- Fake Discord report notifications

These can pollute the production moderation dashboard and make real reports harder for staff to identify.

---

## Safe Report-System Testing

Use one of the following approaches instead:

### Preferred — Automated Tests

Test the report creation flow using:

- Unit tests
- Integration tests
- API tests
- Mock database records
- Test fixtures
- A dedicated test database

Example:

```text
Production database
    ↓
DO NOT create fake reports here

Test database
    ↓
Create test reports here
```

---

### Development Environment

If the report system needs to be tested manually, use:

```text
localhost
development environment
staging environment
test database
```

Do not point the test environment at the production report database.

---

### Discord Notifications

Do not repeatedly send test report notifications to the real UGN staff/report channel.

If Discord notifications need testing:

1. Use a dedicated private test channel, or
2. Mock the Discord webhook/API, or
3. Use a development bot/application configuration.

Never spam the real staff channel with test reports.

---

# 35. Report Testing Safety Rule

Add a clear development safeguard where practical:

```text
NODE_ENV=development
```

or an equivalent application-level environment flag should identify non-production environments.

For example:

```env
APP_ENV=development
```

Then test code can prevent accidental production report creation.

Conceptually:

```ts
if (isProduction && isTestReport) {
  throw new Error(
    "Test reports are disabled in production."
  );
}
```

The exact implementation should follow the project's existing architecture.

Do not add a hidden production bypass.

---

# 36. Existing Production Reports Must Be Treated as Real Data

Do not automatically delete existing reports simply because they look like test reports.

Before removing anything from the production database:

- Identify who created it.
- Determine whether it is genuinely a test.
- Check with the appropriate UGN staff/administrator.
- Follow the existing report-retention/deletion process.

Performance work must not silently delete moderation data.

---

# 37. Performance Testing Must Not Trigger Side Effects

This applies beyond reports.

A performance test should not accidentally:

- Create reports
- Send staff notifications
- Send Discord messages
- Create user accounts
- Create moderation cases
- Upload fake evidence
- Send emails
- Trigger webhooks
- Modify production settings
- Modify production data

Performance testing should ideally be read-only against production.

If a workflow requires writes, perform it in a controlled development/staging environment.

---

# 38. Do Not Repeatedly "Test" the Same Production Feature

Once the report flow has been verified, do not keep submitting additional reports to prove that it still works.

Use automated tests or a test environment for repeated testing.

For example:

```text
BAD:

Submit report
→ fix code
→ submit another report
→ fix code
→ submit another report
→ submit another report
→ production dashboard filled with tests


GOOD:

Test fixture
→ automated test
→ fix code
→ automated test
→ verify once in staging
→ one controlled production smoke test if genuinely necessary
```

---

# 39. Kilo Instruction — Report System

Add this to the developer instructions:

```text
IMPORTANT: Do NOT repeatedly create real UGN reports while testing.

The production report dashboard must not be used as a test database.

Do not submit fake reports to test:
- report creation
- report embeds
- report notifications
- report attachments
- report categories
- report priorities
- report status changes

Use unit/integration tests, mocks, fixtures, a test database, localhost, or staging instead.

If a production smoke test is genuinely required, perform the minimum number of tests necessary and do not leave unnecessary fake moderation records behind.

Do not spam the real Discord staff/report channel with test notifications.

Performance testing must be read-only and must not create production side effects.

Do not delete existing production reports automatically. Treat them as real moderation data unless an authorized administrator confirms that they are test records.
```

---

# 40. Acceptance Criteria — Report System

Before the performance work is considered complete:

- [ ] No repeated fake reports were created in production.
- [ ] No report spam was sent to the real staff Discord channel.
- [ ] Automated tests use mocks/fixtures/test data where possible.
- [ ] Development/staging can test report creation without touching production data.
- [ ] Production report functionality still works.
- [ ] Real reports remain intact.
- [ ] Report permissions remain unchanged.
- [ ] Report attachments remain secure.
- [ ] Report details remain staff-only where intended.
