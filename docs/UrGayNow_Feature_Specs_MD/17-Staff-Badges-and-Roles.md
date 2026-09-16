# Staff Badges & Roles

## Goal
Make staff identity and responsibilities obvious without making the interface cluttered. The role list and permissions are defined in 10-Staff-Moderation-Dashboard; this document covers the visual badge layer on top of those roles.

## Canonical roles
Inherit from 10-Staff-Moderation-Dashboard. Each role maps to a visual badge with a stable `roleKey` (used in code and data) and a human-readable label.

| Role Key | Display Label | Tooltip | Typical Permissions |
|---|---|---|---|
| `founder` | Founder | "Founder — sets platform direction and has unrestricted access." | All permissions |
| `admin` | Admin | "Admin — manages staff, settings, and oversees moderation." | All except founder-only actions |
| `moderator` | Moderator | "Moderator — reviews reports, submissions, and takes moderation action." | Reports, submissions, gallery moderation |
| `event_manager` | Event Manager | "Event Manager — creates, edits, and manages events." | Events CRUD |
| `community_manager` | Community Manager | "Community Manager — manages announcements, polls, and community content." | Announcements, polls, community submissions |

## Community badges
Non-staff badges that signal contribution without implying moderation power.

| Badge Key | Display Label | Tooltip | Criteria |
|---|---|---|---|
| `verified_creator` | Verified Creator | "Verified Creator — community member whose work has been reviewed and featured." | Featured in gallery or shop; approved by staff |
| `event_host` | Event Host | "Event Host — regularly hosts community events." | Has published events |
| `contributor` | Contributor | "Contributor — has published community submissions." | Approved submissions |

## Requirements
- Badges come from server-side role data (never client-supplied — see 25-Implementation-Roadmap secure role checks).
- Each badge can have a tooltip explaining its meaning.
- Staff-only permissions remain independent from visual badges (see 10).
- Badge data is derived from the `Staff.rank` field (staff roles) and contribution records (community badges); the visual layer never writes back to permission tables.
- A single `RoleBadge` component renders all badges consistently, accepting only a `roleKey` (or badge key) plus an optional `tooltip` override.

## Data flow
1. Server components load staff/contributor data via Prisma (e.g. `prisma.staff.findMany`, `prisma.communitySubmission` aggregates).
2. The server maps `rank` strings to canonical role keys using a shared `roleMap` constant exported from a `lib/roles.ts` module.
3. The mapped role key is passed to the `RoleBadge` client component as a prop.
4. The client component is presentational only — it never calls an API to determine the badge and never grants permissions.

## Component: `RoleBadge`
- Located at `components/RoleBadge.tsx`.
- Props: `role: string` (canonical role key), `tooltip?: string`, `size?: "sm" | "md"`.
- Renders a small pill with an icon, label, and optional `title` attribute for tooltip accessibility.
- Uses the shared design system tokens (see 24-Shared-Design-System-and-UX) so colors and typography match the rest of the platform.
- Supports keyboard focus with visible focus rings.

## Rendering surfaces
Badges must appear consistently where staff identity or contribution matters:

- **Staff directory** (`/staff`) — beside each member's name and on their card (extends `StaffCard`).
- **Announcements** (`/news/[slug]`) — author byline with badge(s) for staff authors.
- **Event pages** (`/events/[slug]`) — host badge for staff-hosted events; `Event Manager` badge on the moderation view.
- **Community profiles** (`/community/[id]`) — badges section listing earned community badges and staff roles.
- **Moderation dashboard** (`/admin/moderation`) — staff action attribution in the audit log and report actions.
- **Community submissions** (`/community/[id]`) — submitter badges where applicable.

## Accessibility
- Every badge includes a `title` attribute (native tooltip) describing its meaning.
- Badges that convey status also include a text label (never icon-only) so screen readers can announce them.
- Color is never the sole indicator of role or status.

## Security
- Badges are read-only decorations. No route, handler, or component may grant or revoke permissions based on badge presence, badge styling, or badge visibility.
- The `Staff.rank` field is the source of truth for both permissions (checked server-side in `lib/auth.ts` and action handlers) and badges (mapped in `lib/roles.ts`); the two concerns share the same enum but are enforced independently.

## Acceptance criteria
- Badges render consistently from server-side role data, and visual badges never grant permissions.
- Every staff badge has a tooltip explaining its meaning.
- The `RoleBadge` component is presentational and accepts only server-supplied role keys.
- Badges appear on all listed rendering surfaces.
- Accessibility basics are covered (title attributes, text labels, focus rings).
