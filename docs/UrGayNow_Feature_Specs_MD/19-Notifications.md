# Event & Announcement Notifications

## Goal
Keep users informed about events and important announcements without becoming noisy.

## Notification types
- Event reminder, time changed, cancelled (mechanics in 02-Event-Reminders-and-Calendar)
- New announcement (19)
- Poll closing soon (09-Community-Polls-and-Voting)
- Report status update (status model in 12-Report-Tracking)

## Requirements
- User-controlled notification preferences.
- Avoid duplicate notifications.
- Respect timezone (see 02).
- Do not notify users for content they cannot access.
- Provide clear read/unread state.

## Discord webhook notifications
Staff can publish time-sensitive community alerts to the Discord server via webhooks, in addition to in-app notifications. This is opt-in per event/announcement/poll via a "Post to Discord" toggle in the admin editor.

### Webhook targets
Use dedicated environment variables (one per surface, mirroring 23-Updates-Changelog-System):

| Variable | Purpose |
|---|---|
| `DISCORD_EVENTS_WEBHOOK_URL` | New events, event time changes, event cancellations |
| `DISCORD_ANNOUNCEMENTS_WEBHOOK_URL` | New announcements |
| `DISCORD_POLLS_WEBHOOK_URL` | Poll created, poll closing soon |
| `DISCORD_UPDATES_WEBHOOK_URL` | Website updates/changelog (defined in 23) |

### Role mentions
Each webhook post can optionally include one or more **role mentions** so the right people are pinged:

- Staff editors select roles from the Discord guild's role list (fetched via `GET /guilds/{guildId}/roles`, already used by `renderDiscordMessage` in `lib/discord.ts`).
- Roles are stored per post as an array of Discord role IDs.
- The webhook payload embeds them as `<@&ROLE_ID>` mentions in the message content.
- **Default-safe:** if no role is selected, the post is mention-free. Staff must explicitly opt in to mentioning a role; `@here`/`@everyone` are never allowed.
- Mentioned roles are validated against the guild role list before sending; unknown IDs are dropped rather than sent raw.

### Payload format
Send a Discord webhook payload with:
- `content` — plain-text mention line (e.g. `@Event Hosts — new event tonight`), omitted when no roles are selected.
- `embeds` — a branded embed containing:
  - `title` — event/announcement/poll title
  - `description` — short summary (≤256 chars)
  - `color` — brand color (`#750787`)
  - `fields` — key/value pairs: date/time (in event timezone), location/VRChat world, host, category
  - `timestamp` — ISO timestamp
  - `url` — link to the full page on Ur Gay Now
  - `footer` — "Ur Gay Now"

### Reliability
- The database is the source of truth (generic controls in 25-Implementation-Roadmap). A failed Discord webhook must **not** undo or lose the published event/announcement/poll.
- Record webhook delivery status per post (`discordPosted`, `discordPostedAt`, `discordPostStatus`: `pending` | `sent` | `failed`) — the `Update` model already has these fields; extend the pattern to `Event`, `Announcement`, and the new `Poll` model.
- Staff can retry a failed webhook from the admin editor.
- Webhook calls are server-side only, in `use server` action handlers, after the record is committed.

## Acceptance criteria
Users can control what they receive and important event changes reach users who opted in.

Additionally, for Discord webhook notifications:
- Staff can toggle "Post to Discord" when publishing an event, announcement, or poll.
- A posted webhook includes the title, summary, branded embed, link, and timestamp.
- Role mentions are optional, selected from the guild's role list, and never include `@here` or `@everyone`.
- A failed webhook does not lose the published content; status is recorded and retryable.
- Webhook posts are server-side only and gated by admin/staff permissions.