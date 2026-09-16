# Live Now Events Section

## Goal
Make currently active community events immediately discoverable.

## Behaviour
- An event is Live Now when `startAt <= current time` and `endAt > current time`.
- Events without an end time may remain live until manually ended.
- Live events should be shown on the homepage in a dedicated section.
- Show a clear Live Now badge and remaining time when an end time exists.
- Do not show ended events as live.

## UX
Use stronger visual emphasis for live events (see 24-Shared-Design-System) and avoid excessive animation. Respect reduced-motion preferences (see 21-Accessibility-Improvements).

## Acceptance criteria
- Live events update based on current time.
- Ended events automatically leave the Live Now section.
- Upcoming events can move into Live Now without staff editing them.
