# Better Events System

## Goal
Replace the current event lifecycle with a persistent system where events remain useful after their start time instead of disappearing.

## Requirements
- Three primary states:
  - **Upcoming** — event has not started.
  - **Live Now** — current time is between the start and end time.
  - **Past Events** — event has ended and is archived.
- Events must never disappear solely because the start date has passed.
- If an event has no end time, it remains Live/Active until staff explicitly end or archive it.
- Past events should remain browsable and searchable.
- Staff can publish, edit, unpublish, archive, restore, and delete events.
- Event cards should clearly show status, date, time, host, category, and cover image (card design in 24-Shared-Design-System).
- Use the same event data across the homepage, event listing, search, and event detail page (homepage in 20, search in 15, pages in 03).

## Suggested data
Mirrors the `Event` table (schema.sql:151). User-facing presentation of these fields is specified in 03-Better-Event-Pages; the canonical field list itself lives in schema.sql.
- id
- title
- slug
- summary
- description
- coverImage
- startAt
- endAt
- timezone
- hostId / hostName
- location
- worldLink
- category
- tags
- rules
- status
- publishedAt
- archivedAt
- createdAt
- updatedAt

## UX
The Events page should have tabs or filters for **Upcoming**, **Live Now**, and **Past Events**. Live events should receive stronger visual emphasis without hiding other events.

## Acceptance criteria
- A started event remains visible.
- An ended event moves into Past Events.
- A currently running event appears in Live Now.
- Past events can be opened from their original event pages.
- Date/time handling respects the event timezone (see 02-Event-Reminders-and-Calendar).
