# Report Tracking

## Goal
Allow reporters to understand the status of reports they submitted without exposing private moderation information.

## Statuses
This is the **canonical report-status taxonomy**, shared by the reporter view and the staff moderation dashboard (see 10-Staff-Moderation-Dashboard):
- Received
- Under Review
- Action Taken
- Resolved
- Dismissed

These map to the `ReportStatus` / `report_status` enum enforced in `schema.prisma:169` and `schema.sql:46`, and migrated on existing databases by `prisma/migrations/20260914124000_reconcile_report_status`.

## Privacy
Users should only be able to access reports they are authorised to view. Anonymous reports should not expose reporter identity.

## Tracking
Generate a non-guessable report reference/token. Avoid sequential public IDs that allow enumeration.

## User view
Show:
- Reference
- Date submitted
- Category
- Current status
- Last updated
- Safe staff response if provided

Do not expose:
- Internal moderation notes
- Staff identities unless intentionally configured
- Private evidence
- Other users' personal information

## Acceptance criteria
A reporter can securely check progress without needing Discord.

## Referenced by
The report status and privacy model defined here is consumed by: 08-Better-Gallery, 11-Website-Report-System, 16-User-Community-Profiles, 19-Notifications.
