# Links — Build a Real Community Link Hub

## Goal
Replace the current simple list of cards with a branded, useful link hub that helps visitors immediately find the community's important destinations.

## Information architecture
Links should support categories such as:
- Community
- VRChat
- Socials
- Support
- Creators / Partners
- Other

Add a category field to `Link` or introduce a dedicated category model if the project needs richer management.

## Featured links
The top of the page should have 2–4 featured destinations with larger cards.
Examples include the configured Discord and VRChat links.

Featured cards should support:
- Icon/logo
- Title
- Short description
- External-link indicator
- Optional badge such as `Community`, `Official`, or `VRChat`

## All links
Use compact cards grouped by category. Each card should have:
- icon
- title
- description if available
- optional domain label
- external-link indicator

Avoid relying on emoji strings for every icon. Support a consistent icon identifier and optionally uploaded logos.

## Admin > Links
Add:
- category
- description
- featured toggle
- active toggle if needed
- icon selector
- destination URL
- display order

Show a live preview in the form.

## Validation
- Require valid HTTP/HTTPS URLs for external links.
- Normalize/trim URLs.
- Open external links with safe attributes.
- Never render arbitrary HTML from a link record.

## Visual direction
The page should feel closer to a polished community landing page than an admin-generated list:
- strong hero
- featured destinations
- category sections
- subtle branded accents
- responsive cards
- clear external-link affordance

## Empty state
If no links exist, show a useful branded empty state rather than a large blank area.

## Acceptance tests
- Discord and VRChat settings appear correctly when configured.
- Database links appear under the correct categories.
- Featured links are visually distinct.
- Admin edits update the public page.
- Invalid URLs are rejected.
- Mobile layout is clean.
