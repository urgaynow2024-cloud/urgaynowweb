# Website Report System

## Goal
Provide an in-site reporting system that is easier and safer than requiring users to report everything through Discord.

## Report categories
- Harassment
- Hate speech
- NSFW / sexual content
- Scam / fraud
- Impersonation
- Rule violation
- Website bug
- Event issue
- Community content
- Other

## Report fields
- Category
- Subject / target
- Description
- Page URL
- Optional contact information
- Optional screenshots/evidence
- Anonymous toggle where appropriate

## Security
Generic controls (server-side validation, file type/size, rate limiting, bot protection, filename sanitisation) are defined in 25-Implementation-Roadmap. Report-specific:
- Do not expose private report data publicly.
- Do not expose reporter identity unless the reporter opts in (anonymous mode in 13-Anonymous-Reporting).

## Discord webhook
On submission, optionally send a structured embed to a dedicated moderation webhook containing:
- Report ID
- Category
- Summary
- Target
- Page
- Evidence count
- Anonymous status
- Link to staff dashboard

## Discord webhook configuration
- The webhook target is supplied via an environment variable so the URL is never committed to the repo (secret management in 25-Implementation-Roadmap; 23-Updates-Changelog-System uses the parallel `DISCORD_UPDATES_WEBHOOK_URL`).
- Env var for the report webhook: `DISCORD_REPORTS_WEBHOOK_URL`, loaded at runtime by the deployment environment (never committed to the repository; secret handling in 25-Implementation-Roadmap).
- Posting is best-effort: a failed/unavailable webhook must not prevent the report from being stored. Track delivery status and let staff retry failed posts.
- A webhook is never the only storage mechanism.

## Acceptance criteria
Reports are stored reliably even if Discord is unavailable (Discord is best-effort only; the webhook must never be the only storage mechanism, per 25).

## Referenced by
Report submission defined here is consumed by: 08-Better-Gallery, 13-Anonymous-Reporting, 14-FAQ-Help-System, 16-User-Community-Profiles.