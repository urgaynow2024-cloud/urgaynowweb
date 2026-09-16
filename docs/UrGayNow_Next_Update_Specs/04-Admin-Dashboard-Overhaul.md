# Admin Console — Complete Dashboard Redesign

## Goal
Turn `/admin` into an actual control centre rather than a collection of stat cards and recent links.

The admin screenshot shows the current console already has a dark sidebar and basic navigation, but the main dashboard and individual management pages still feel like generic CRUD screens. The redesign should improve information architecture as well as styling.

## Admin shell
Keep the existing left navigation concept, but improve it:
- Collapsible sidebar
- Section groups
- Active route indicator
- Icons + labels
- Small notification/attention counts
- Persistent `View site` button
- Current admin identity
- Theme control
- Keyboard shortcut for command palette

### Navigation groups
**Manage**
- Dashboard
- Staff
- Announcements
- Events
- Gallery
- Group Photos
- Links
- Partners
- Shop Designs

**Safety**
- Moderation
- Reports
- Rules

**Help / Publishing**
- Guides / FAQ
- Updates

**System**
- Settings
- Theme
- Audit Log / System Health if available

## Dashboard content
### Hero / welcome
Show:
- `Good evening, [name]`
- Short status sentence
- Current site theme
- Current release version
- Last deployment/release time if available

### Needs attention
This should be the most important section.
Show actionable counts:
- Pending community submissions
- Open reports
- Draft/scheduled announcements
- Upcoming events needing attention
- Failed Discord webhook deliveries
- Missing group-photo banners
- Failed/unfinished releases

Each item links directly to the relevant queue.

### Site overview
Compact cards for:
- Staff
- Events
- Gallery
- Community submissions
- Announcements
- Guides
- Links
- Updates

Clicking a metric should open the relevant management page.

### Recent activity
Show a real activity stream based on moderation/content changes. Include:
- actor
- action
- target
- time
- link

Do not invent activity from simple `createdAt` rows when an audit log exists.

### Quick actions
Use a visually distinct action grid:
- New announcement
- New event
- Add staff
- Review submissions
- Add gallery image
- New update
- Add link

## System health
Add a small health panel showing:
- Database status
- Storage/upload status
- Discord webhook status
- Current deployed version
- Last successful build/release

Do not expose secrets.

## Responsive behavior
On smaller screens:
- sidebar becomes a drawer
- needs-attention cards become a single-column queue
- tables become cards or horizontal scroll where appropriate
- no text gets clipped

## Design direction
Avoid:
- excessive emoji as UI icons
- giant empty dashboard panels
- every section being a rounded card inside another rounded card
- arbitrary gradients on every component

Prefer:
- consistent icon set
- clear typography
- meaningful grouping
- compact status pills
- deliberate spacing
- subtle hover states

## Acceptance tests
1. Admin can identify outstanding work within a few seconds.
2. Every attention item links to the correct page.
3. Dashboard counts match database values.
4. Failed integrations are visible.
5. Current release version is visible.
6. Sidebar works on desktop and mobile.
7. Founder/Admin-only controls are protected server-side.
