# Updates & Changelog — Automatic Release System

## Goal
The Updates page should no longer depend on someone manually remembering to write a release after every push. Every production push should be able to produce a reliable release record containing the version and what changed.

## Source of truth
Git history + deployment metadata are the source of truth for automatic release generation. The database stores the public release record.

## Required database changes
Extend `Update` or add a release metadata model with fields equivalent to:
- `sourceCommit`
- `sourcePreviousCommit`
- `sourceBranch`
- `deploymentId` or deployment reference when available
- `generatedAutomatically`
- `releaseStatus`

Add a uniqueness constraint around the source commit/range so the same push cannot create duplicate updates.

## Versioning
Use semantic versioning.

Suggested rules from commit messages:
- `BREAKING CHANGE` or `!` -> MAJOR
- `feat:` -> MINOR
- `fix:`, `perf:`, `refactor:`, `docs:`, `chore:` -> PATCH unless configured otherwise

If commit messages do not follow Conventional Commits, use a safe fallback:
- default to PATCH
- include the commit subject in the release notes

Never silently overwrite a manually chosen release version.

## Automatic pipeline
Create a GitHub Actions workflow or equivalent CI workflow triggered after pushes to the production branch.

Flow:
1. Detect the pushed commit SHA.
2. Determine the previous successfully released SHA.
3. Collect commits between them.
4. Classify commits.
5. Determine the next version from the latest published release.
6. Generate a release title and summary.
7. Generate sections:
   - What's New
   - Improvements
   - Bug Fixes
   - Security / Moderation
8. Store the release in the database.
9. Mark it as automatically generated.
10. Publish only after the production deployment succeeds, if deployment status is available.
11. Trigger the existing Discord update webhook.
12. Record success/failure independently for Discord.

## What the public update should show
Example structure:

`v1.8.0 — Community & Admin Refresh`

- release date
- short summary
- changed areas
- feature bullets
- improvements
- bug fixes
- security/moderation notes when relevant
- optional screenshots
- link to the commit/deployment where appropriate

Do not dump raw commit hashes as the primary user-facing content.

## Admin controls
Admin > Updates should still allow manual edits.

Add filters:
- Automatic
- Manual
- Major
- Minor
- Patch
- Failed Discord delivery

Manual controls:
- edit
- publish/unpublish where allowed
- retry Discord
- mark as reviewed
- regenerate summary

## Prevent bad releases
The automation must not publish:
- secrets
- environment variables
- access tokens
- internal credentials
- raw error dumps containing sensitive information

Sanitize commit messages before storing/displaying them.

## Reliability
If release creation succeeds but Discord fails:
- keep the update published
- mark Discord delivery as failed
- allow retry

If database creation fails:
- fail the release job clearly
- do not claim that the release was published

If deployment fails:
- do not publish a successful-production release record merely because the commit exists.

## Admin dashboard integration
Show:
- current version
- latest release date
- release pipeline status
- failed webhook count

## Existing page changes
Update:
- `app/updates/page.tsx`
- `app/updates/[slug]/page.tsx`
- `app/admin/updates/page.tsx`
- `app/admin/updates/actions.ts`
- `app/admin/updates/UpdateForm.tsx`

The current manual version suggestion can remain as a fallback, but the release pipeline becomes the normal path.

## Acceptance tests
1. Push a test commit to the configured release branch.
2. Confirm exactly one release is created.
3. Confirm the version increments correctly.
4. Confirm commit categories are reflected in the release sections.
5. Confirm a second run for the same SHA does not duplicate the release.
6. Confirm deployment failure does not create a false published release.
7. Confirm Discord failure does not delete/rollback the release.
8. Confirm manual releases still work.
