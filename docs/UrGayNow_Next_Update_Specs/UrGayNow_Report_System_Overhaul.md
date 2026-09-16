# 🚨 Ur Gay Now — Report System Overhaul

## Problem

The current Ur Gay Now website does not provide a clear, reliable way for normal users to submit reports.

There needs to be an obvious **Report** action throughout the public website, with a complete flow from:

`User submits report → Report is stored → Staff are notified → Staff review report → Staff take action → User can see the report status`

This should be a real working system, not just a button or placeholder UI.

---

# 1. Add a Public Report System

Users should be able to report content directly from the places where problems can occur.

### Reportable content

At minimum, allow reports for:

- Community photos
- Gallery content
- Group photos
- Events
- User profiles
- Staff/member content where appropriate
- Comments/posts if those features exist
- Shop/design content if applicable

Every report button should open the same consistent report modal.

### Report button

Use a small but obvious:

`⚑ Report`

or

`Report`

button.

It should not dominate the page, but users should never have to hunt through the website to find it.

---

# 2. Report Modal

The report modal should contain:

### Report reason

Required dropdown/select:

- Harassment
- Hate or discriminatory content
- Sexual/inappropriate content
- NSFW content
- Violence or gore
- Scam/fraud
- Spam
- Copyright/ownership issue
- Impersonation
- Personal information
- Community rules violation
- Other

### Description

Allow the user to explain what happened.

Requirements:

- Required
- Reasonable character limit
- Character counter
- Clear placeholder text
- Do not erase the text if validation fails

Example:

`Tell the moderation team what is wrong with this content...`

### Optional evidence

Where technically possible:

- Screenshot upload
- Additional links
- Supporting information

Do not make evidence mandatory unless the report type requires it.

### Submission

Button:

`Submit Report`

While submitting:

`Submitting...`

After success:

`Report submitted successfully`

Do not allow accidental duplicate submissions from repeated clicks.

---

# 3. Report Database

Create a proper report model/table.

Suggested fields:

- `id`
- `reporterId`
- `reportedUserId`
- `contentType`
- `contentId`
- `reason`
- `description`
- `evidence`
- `status`
- `priority`
- `assignedTo`
- `staffNotes`
- `resolution`
- `createdAt`
- `updatedAt`
- `resolvedAt`

### Statuses

Use:

- `OPEN`
- `IN_REVIEW`
- `RESOLVED`
- `DISMISSED`
- `ESCALATED`

Do not delete reports simply because they have been resolved.

Reports are moderation records and should remain available to authorized staff.

---

# 4. Prevent Report Abuse

The system should include basic protections.

### Duplicate protection

If the same user repeatedly reports the exact same content for the exact same reason while an existing report is open, do not create unlimited duplicate reports.

Instead show:

`You already have an open report for this content.`

### Rate limiting

Add reasonable rate limits to report submissions.

The exact limit should be configurable later.

### Authentication

Users must be signed in to submit a report.

If someone is not signed in:

`You need to sign in before submitting a report.`

---

# 5. Admin / Staff Report Center

The Admin Console MUST have a dedicated:

`Reports`

section.

The current admin area should not simply hide reports somewhere inside another page.

Navigation:

```text
Dashboard
Staff
Announcements
Events
Rules
Guides / FAQ
Links
Partners
Gallery
Group Photos
Shop Designs
Moderation
Reports
Settings
```

Reports should be a first-class moderation tool.

---

# 6. Reports Dashboard

The Reports page should immediately show useful information.

Top statistics:

```text
Open Reports
In Review
High Priority
Resolved Today
```

Then show the report queue.

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ Reports                                      + Filters       │
├──────────────────────────────────────────────────────────────┤
│ Open       In Review       High Priority       Resolved      │
│ 12         4               2                   31            │
├──────────────────────────────────────────────────────────────┤
│ Report       Reason          Target       Priority   Status │
│ #1042        Harassment      Photo        High       Open   │
│ #1041        Spam            Profile      Normal     Review │
│ #1040        Copyright       Design       Normal     Open   │
└──────────────────────────────────────────────────────────────┘
```

---

# 7. Filters

Staff should be able to filter reports by:

- Status
- Reason
- Priority
- Content type
- Assigned staff member
- Reporter
- Reported user
- Date
- Unassigned reports

Also provide search.

Search should support:

- Report ID
- Username
- VRChat username
- Content ID
- Description text

---

# 8. Report Details

Clicking a report should open a proper report detail view.

Show:

### Reporter

- Username
- Avatar
- Account information relevant to moderation
- Previous report count where appropriate

### Reported user

- Username
- Avatar
- Relevant account information

### Reported content

Display the actual content being reported.

Do NOT make staff open a separate page just to understand what the report is about.

### Report information

Show:

- Reason
- Description
- Submitted date
- Current status
- Priority
- Assigned staff member
- Evidence

---

# 9. Staff Actions

Authorized staff should be able to:

- Assign report
- Change status
- Change priority
- Add internal notes
- Request more information
- Resolve
- Dismiss
- Escalate
- Open the reported content
- Open the reported user's moderation history

Potential actions:

```text
Assign
Mark In Review
Escalate
Resolve
Dismiss
```

Dangerous actions should require confirmation.

---

# 10. Internal Staff Notes

Staff notes must NOT be visible to normal users.

Example:

```text
Internal Notes

Reviewed the reported image.
Confirmed it violates the community rules.
Removed the image and issued a warning.
```

Every staff action should ideally be logged.

---

# 11. Audit Log

Create a moderation audit trail.

Example:

```text
Report #1042

23:41 — Report submitted by Bluey
23:45 — Assigned to ModeratorName
23:52 — Status changed to In Review
00:04 — Internal note added
00:07 — Content removed
00:08 — Report resolved
```

This makes it possible to understand what happened to a report.

---

# 12. User Report History

Users should have a place where they can see reports THEY submitted.

Example:

`My Reports`

```text
#1042
Harassment
Submitted: Sep 16
Status: In Review

#1031
Spam
Submitted: Sep 12
Status: Resolved
```

Users should see the status and basic resolution information.

They should NOT see:

- Staff internal notes
- Private moderation information
- Other users' reports
- Sensitive staff information

---

# 13. Notifications

When a report is submitted:

### Staff notification

Authorized staff should receive a notification that a new report exists.

Example:

`🚨 New report #1042 requires review.`

When the report is resolved:

### User notification

The reporter should receive:

`Your report #1042 has been reviewed.`

Do not expose private moderation details.

---

# 14. Permissions

Reports contain potentially sensitive moderation information.

Only authorized roles should access the Reports Center.

Example permission structure:

```text
reports.view
reports.assign
reports.review
reports.resolve
reports.dismiss
reports.escalate
reports.notes
reports.manage
```

Do NOT rely only on hiding the Reports button.

Every server action/API route must verify permissions.

---

# 15. API / Server Security

Every report endpoint must validate:

- Authentication
- User permissions
- Report ownership where applicable
- Valid content IDs
- Valid report reasons
- Input length
- Rate limits
- CSRF/request protections where applicable

Never trust:

- Client-provided user IDs
- Client-provided staff IDs
- Client-provided permissions
- Client-provided report status

The server must determine these values.

---

# 16. Content Deletion and Reports

If reported content gets deleted after a report is submitted, the report should NOT disappear.

Instead show:

`Reported content is no longer available.`

The report should remain in the moderation system.

This is important for audit history.

---

# 17. Reportable Content Must Have Context

When creating a report, store enough information to identify what was reported.

For example:

```text
contentType: COMMUNITY_PHOTO
contentId: abc123
reportedUserId: user123
```

Do not store only the current URL because URLs can change.

---

# 18. Empty States

The Reports page should have useful empty states.

For staff:

`✨ No reports need attention`

For users:

`You haven't submitted any reports yet.`

Do not show a giant blank page.

---

# 19. Error Handling

If submission fails:

`We couldn't submit your report. Please try again.`

The user's description should remain in the form.

If the content no longer exists:

`This content is no longer available and cannot be reported.`

If the user has already reported it:

`You already have an open report for this content.`

---

# 20. UI Requirements

The report system needs to match the redesigned Ur Gay Now visual style.

Use:

- Dark UI
- Purple/pink accent system
- Rounded cards
- Clear status badges
- Good spacing
- Accessible contrast
- Responsive layouts
- Mobile-friendly report modal
- Consistent buttons and icons

Avoid making the Reports page look like a generic database admin panel.

---

# 21. IMPORTANT: This Must Actually Work

Do NOT consider this feature complete if only the following exist:

- A Report button
- A modal
- A fake success message
- A frontend-only report array
- Placeholder report cards
- A static Reports admin page

The complete flow must work:

```text
User
 ↓
Report button
 ↓
Report modal
 ↓
Validation
 ↓
API/server action
 ↓
Database
 ↓
Staff notification
 ↓
Admin Reports queue
 ↓
Staff review
 ↓
Staff action
 ↓
Audit log
 ↓
Report status
 ↓
User notification/history
```

---

# 22. Testing Checklist

Before marking the feature complete, test:

- [ ] Signed-in user can report content
- [ ] Signed-out user cannot submit
- [ ] Report reason is required
- [ ] Description validation works
- [ ] Duplicate reports are handled
- [ ] Rate limiting works
- [ ] Report is actually stored in the database
- [ ] Report appears in Admin Reports
- [ ] Staff can open the report
- [ ] Staff can assign it
- [ ] Staff can change status
- [ ] Staff can add internal notes
- [ ] Staff can resolve it
- [ ] Staff can dismiss it
- [ ] Staff can escalate it
- [ ] Audit history is recorded
- [ ] Reporter can see their report
- [ ] Reporter receives appropriate status notification
- [ ] Deleted content does not delete the report record
- [ ] Unauthorized users cannot access reports
- [ ] API/server permission checks work independently of the UI
- [ ] Mobile layout works
- [ ] Empty states work
- [ ] Error states work

---

# Definition of Done

The Ur Gay Now website has a **real, end-to-end reporting system** when a normal user can report something from the public website and an authorized staff member can receive, review, investigate, action, and resolve that report from the Admin Console.

There must be **no dead Report buttons, fake data, placeholder queues, or frontend-only implementations**.

The Reports system should be treated as a core moderation feature, not an optional extra.
