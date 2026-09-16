# Community Polls & Voting

## Goal
Allow staff to run community votes for contests, events, and decisions.

## Suggested data
Planned model (not yet present in `schema.sql`): `Poll` (`id`, `title`, `description`, `type` = SINGLE/MULTIPLE, `allowAnonymous`, `startAt`, `endAt`, `voteLimit`, `resultsVisibility`, `closed`, `createdAt`, `updatedAt`) with a `PollVote` table (`pollId`, `userId`/`anonId`, `choice`, `createdAt`). Anti-abuse fields (`voteLimit`, `resultsVisibility`) live on `Poll`.

## Features
- Poll creation.
- Multiple choice / single choice.
- Optional anonymous voting (privacy model follows 13-Anonymous-Reporting).
- Start/end dates.
- Vote limits.
- Results visibility settings.
- Closed polls remain viewable.
- Contest anti-abuse controls are specified under Security below.

## Security
- Enforce voting rules and vote limits server-side (generic server-side enforcement in 25-Implementation-Roadmap).
- Prevent duplicate votes where required.
- Never trust client-side vote counts.
- Voting audit trail records each cast vote for staff review (audit logging in 10-Staff-Moderation-Dashboard).

## Acceptance criteria
Staff can publish and close polls, and users can see the appropriate results according to the poll's visibility settings.
