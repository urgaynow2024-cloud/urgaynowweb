# Community Submissions

## Goal
Give members a safe way to submit artwork, avatars, screenshots, creations, and other community content for staff review, then surface approved work in the community gallery.

## Submission types
- Artwork
- Avatar
- Screenshot
- Photography
- VRChat world
- Creator project
- Other approved community content

## Workflow
1. User submits content with a type, title, description, and media.
2. Submission enters `PENDING` in `CommunitySubmission`.
3. Staff `APPROVE`, `REJECT`, or `REQUEST_CHANGES` (`community_submission_status` enum, schema.sql:42).
4. Approved content is marked `published = true` with `publishedAt`; it then appears in the gallery (see 08-Better-Gallery).

## Submission data model
`CommunitySubmission` (schema.sql:229) holds:
- `type` (`community_submission_type` enum, schema.sql:38)
- `status` (`community_submission_status` enum, schema.sql:42)
- `title`, `description`, `imageUrl`
- `submitterName`, `submitterEmail`
- `fileName`, `fileSize`, `contentType`
- `rejectionReason`, `changeRequestNote`, `reviewedAt`, `reviewedBy`
- `published`, `publishedAt`

Indexing: `(status, createdAt)` plus indexes on `type`, `published`, `reviewedBy` (schema.sql:420-424).

## Moderation history
Each staff action writes a row to `CommunitySubmissionModerationLog` (schema.sql:266) with `action`, `note`, `performedBy` (FK -> `Staff`), `performedAt`. This is the submission-specific audit trail; the shared audit log lives in the Staff Dashboard (see 10-Staff-Moderation-Dashboard).

## Reports
Community submissions have their own report table `CommunitySubmissionReport` (schema.sql:252) linked to `CommunitySubmission` with `ON DELETE CASCADE`. Reporting flows and visibility reuse the shared report system (see 11-Website-Report-System, 12-Report-Tracking).

## Configuration
- `published` defaults to `false`; only approved submissions are published.
- A `Setting` row may enable per-type auto-approval for low-risk categories (e.g. `auto_approve_types = "SCREENSHOT,ARTWORK"`). Auto-approved submissions still enter through `PENDING` and are immediately transitioned, keeping the audit trail complete.

## Integration with profiles
Approved submissions attribute to the submitter and surface on their community profile (see 16-User-Community-Profiles). Unpublished or rejected content is never shown publicly.

## Acceptance criteria
An unreviewed submission is never visible in the public gallery. Only submissions that are `APPROVED` and `published = true` appear. Staff actions are recorded in the moderation log. A submission flagged as inappropriate can be unpublished and hidden from the gallery while the report is reviewed.
