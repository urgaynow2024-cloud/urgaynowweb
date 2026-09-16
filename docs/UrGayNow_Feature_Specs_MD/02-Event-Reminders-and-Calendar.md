# Event Reminders & Add to Calendar

## Goal
Let community members remember events without needing to manually track them.

## Features
- **Add to Calendar** button on every event.
- Generate standard calendar data/ICS.
- Support Google Calendar, Outlook, Apple Calendar-compatible downloads where practical.
- Optional website reminder for logged-in users.
- Reminder choices such as:
  - 1 hour before
  - 1 day before
- Users can remove their reminder.
- Show a small reminder state on event cards.

## Requirements
- Never create duplicate reminders.
- Respect event timezone.
- If an event is cancelled or its time changes, update/cancel relevant reminders where possible.
- Calendar links should include title, description, location/world link, start time, and end time.

## Acceptance criteria
- Users can add an event to a calendar in one or two clicks.
- Calendar times are correct across timezones.
- Reminder state is clear.

## Referenced by
The reminder/calendar mechanics defined here are consumed by: 03-Better-Event-Pages, 04-Live-Now-Events, 19-Notifications.
