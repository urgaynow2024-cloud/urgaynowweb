# Events — Fix "Read Full Event" and Upgrade Event Pages

## Problem
The event detail experience currently renders description/rules manually by splitting strings instead of using the site's Markdown renderer. This makes rich event content inconsistent and increases the chance that a "full event" interaction appears broken or incomplete.

## Required changes

### Full event rendering
Use the shared Markdown component for:
- Description
- Rules & Expectations
- Any future event sections that accept Markdown

Do not render Markdown by manually splitting on `\n` or `\n\n`.

### Stable event detail structure
The event page should have:
1. Hero image/title/status
2. Date & time
3. Host
4. Location
5. VRChat world
6. Tags
7. Action bar
8. Full description
9. Rules
10. Related events

On mobile, these sections should stack cleanly without huge blank spaces.

### "Read full event"
If the Events listing has a summary/preview interaction, it must route to `/events/[slug]` using the event slug. Do not use an index/id that can become stale.

Every event card must have a clear accessible link with the event title as its accessible name.

### Error handling
- Missing event -> branded 404 state.
- Unpublished event -> not publicly accessible unless valid preview access is provided.
- Broken cover image -> graceful branded fallback.
- Invalid VRChat URL -> show the URL safely but do not make assumptions about its destination.
- Calendar/reminder failure -> toast with a useful message and preserve the page.

### Preview mode
Preview links must remain staff-only and token-protected. Never expose unpublished event content through a normal public route.

### Image optimization
Replace event-page `<img>` tags with `next/image` where the source configuration allows it. Preserve the current visual crop and responsive behavior.

## UX improvements
Add:
- Back to Events link
- Sticky/compact action bar on desktop where appropriate
- `Live now`, `Upcoming`, `Past`, `Archived` status treatment
- Clear timezone display
- Copy/share button
- Calendar export
- Reminder controls
- Related event cards

## Acceptance tests
1. Open an event from `/events` and use the full event link.
2. Confirm the complete event renders.
3. Confirm Markdown headings, lists, links, emphasis, and paragraphs render correctly.
4. Confirm a missing slug returns the branded 404.
5. Confirm an unpublished event cannot be opened normally.
6. Confirm preview mode works only with the correct token.
7. Test on mobile.
