# Better Event Pages

## Goal
Create dedicated event pages that contain everything a visitor needs to understand and attend an event.

## Page sections
- Cover image
- Event title
- Status: Upcoming / Live Now / Past
- Date and time
- Timezone
- Host
- Location
- VRChat world link
- Description
- Rules / expectations
- Tags and category
- Add to Calendar (mechanics in 02-Event-Reminders-and-Calendar)
- Set Reminder (mechanics in 02)
- Share
- Related/upcoming events

## UX
The event page should have strong hierarchy and responsive layouts (see 24-Shared-Design-System). Important actions should remain easy to find on mobile (see 18-Better-Mobile-UI).

## Validation
- External VRChat links are validated/sanitised server-side (see 25-Implementation-Roadmap engineering requirements).
- Staff can preview an event before publishing.
- Missing optional fields should not create empty visual sections.

## Acceptance criteria
A visitor should be able to answer **what, when, where, who, and how to join** without leaving the event page.
