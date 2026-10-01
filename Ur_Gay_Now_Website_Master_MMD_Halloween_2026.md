# Ur Gay Now — Website Master Markdown Document

**Project:** Ur Gay Now — VRChat LGBTQ+ Community  
**Website:** https://www.urgaynow.com/  
**Date:** October 1, 2026  
**Season:** Halloween 2026

## Purpose

This MMD is the master specification for upgrading the UGN website into a polished, secure, responsive Halloween-season community platform.

## Core Requirements

- Full Halloween 2026 visual theme while preserving UGN identity.
- Use the exact supplied official Halloween icon without redrawing or distorting it.
- Real functional report system, not a mock form.
- Private Discord webhook notification for successful reports.
- Protected staff report dashboard.
- Server-side authorization for every report/staff operation.
- Bot Terms of Service.
- Bot Privacy Policy.
- UGN Ownership & IP documentation.
- Responsive desktop/tablet/mobile design.
- Accessibility and reduced-motion support.
- Security, rate limiting, validation and performance testing.
- Maintain `CHANGE.md` with the actual implementation state.

## Halloween Theme

Palette:

```text
Near Black       #0D0A12
Charcoal         #15111C
Dark Purple      #1A1026
Deep Purple      #2A123D
UGN Purple       #6D28D9
Dark Red         #8F1D2C
Halloween Red    #B42335
Warm Orange      #F97316
Pumpkin Orange   #FF8A1F
Ghost White      #F5F1F7
Muted Grey       #A8A0AD
```

Use subtle spider webs, bats, pumpkins, ghosts, sparkles, leaves, moon/night atmosphere, fog and purple/orange glows. Do not overload the page. Respect `prefers-reduced-motion`, avoid layout shifting, and keep decorations out of the way of controls and text.

The final design should feel like:

> **Ur Gay Now, but it's Halloween.**

It should remain welcoming, LGBTQ+ friendly, cute, spooky and modern rather than generic, corporate, gore-focused or childish.

## Official Halloween Icon

The supplied Halloween icon is the source-of-truth asset.

- Use the exact supplied asset.
- Do not regenerate, redraw or replace it.
- Preserve proportions and transparency.
- Use selectively in the header, Halloween banner, hero, legal/report headers and footer.

## Report System

Create a real end-to-end reporting system.

Report categories should include:

```text
Harassment
Hate Speech / Discrimination
Sexual Misconduct
Safeguarding Concern
Threats
Spam / Raid
Scam / Fraud
Inappropriate Content
Staff Misconduct
Rule Violation
Other
```

The report form should support, where appropriate:

- Category
- Reported person
- Discord username/ID
- Description
- Incident date/time
- Relevant links
- Evidence upload
- Additional information

On submission:

1. Validate server-side.
2. Prevent accidental duplicate submissions.
3. Generate a unique report ID such as `UGN-000123`.
4. Securely persist the report.
5. Record timestamp/status.
6. Send a Discord webhook notification.
7. Make the report available only to authorized staff.
8. Give the reporter a clear confirmation.

Statuses:

```text
New
Reviewing
Waiting for Information
Action Taken
Resolved
Dismissed
```

## Discord Webhook

Use a private Discord webhook for staff notifications.

The webhook secret must:

- Never be client-side.
- Never be hardcoded into frontend code.
- Never be exposed through public API responses.
- Never be committed to Git.

Use secure server-side configuration such as:

```text
UGN_REPORT_WEBHOOK_URL
```

A webhook notification should contain non-excessive information such as report ID, category, reported user, timestamp and a protected dashboard link.

Sensitive evidence and private report contents should not be dumped into a broadly accessible Discord channel.

If webhook delivery fails after the report is stored, do not lose the report. Record the notification failure and allow an authorized retry where appropriate.

## Staff Report Dashboard

Create a protected staff dashboard allowing authorized staff to:

- Search reports.
- Filter by category/status.
- Sort reports.
- Open reports.
- View protected evidence.
- Assign reports.
- Add internal notes.
- Change status.
- Record moderation actions.
- Resolve/dismiss reports.
- Retry failed webhook notifications where authorized.

Add an audit timeline containing important events such as:

```text
Report submitted
Assigned to Moderator
Staff note added
Status changed
Action recorded
Report resolved
```

Every permission check must happen server-side. Hiding a button is not sufficient.

## Report Security

Protect against:

- ID manipulation.
- Unauthorized API access.
- Public evidence URLs.
- Report spam.
- Duplicate submissions.
- Malicious file uploads.
- Webhook secret exposure.

Validate file type/size and prevent executable uploads.

## Bot Terms of Service

Create a first-party page such as:

```text
/legal/bot/terms
```

Old reference:

https://alang0991.github.io/urgaynow-bot-site/tos.html

Use the old page as a reference but substantially improve it.

Sections:

1. Introduction
2. What the Bot Does
3. Eligibility and Use
4. Authorized Server
5. Acceptable Use
6. Prohibited Use
7. Moderation and Staff Features
8. Reports and User Submissions
9. Discord / Third-Party Services
10. Availability and Changes
11. Suspension or Removal
12. Intellectual Property
13. Disclaimers
14. Limitation of Liability
15. Changes to These Terms
16. Contact

Use plain English and do not make exaggerated legal claims.

## Bot Privacy Policy

Create:

```text
/legal/bot/privacy
```

Old reference:

https://alang0991.github.io/urgaynow-bot-site/privacy.html

Sections:

1. Overview
2. Information We Process
3. Why We Process It
4. Discord Information
5. Moderation / Report Information
6. Logs and Technical Data
7. Data Sharing
8. Data Retention
9. Data Security
10. User Requests
11. Children's Privacy
12. Third-Party Services
13. Changes to This Policy
14. Contact

The policy must match the actual bot/database implementation. Do not claim data is collected, retained or deleted unless that is actually true.

## UGN Ownership / Intellectual Property

Add a clear UGN ownership/IP section and, where appropriate, a public page such as:

```text
/legal/ownership
```

The policy should establish that work specifically created for UGN as part of an official UGN project, commission, employment/volunteer arrangement, or other documented UGN engagement is treated according to the applicable agreement.

Where an agreement validly assigns ownership to UGN, that work is UGN-owned as specified by the agreement.

Do not claim ownership of unrelated personal or pre-existing creator work merely because the creator is a member or staff member.

This distinction must be explicit.

UGN-specific materials may include, where applicable:

- UGN branding
- UGN logos
- UGN website code
- UGN-specific UI
- UGN documentation
- UGN bot code/configuration
- UGN moderation systems
- UGN staff tools
- UGN-specific marketing materials
- Commissioned assets

Respect third-party/open-source/asset licences and any separate agreements.

## Legal Footer

Add:

```text
Legal
Community Rules
Bot Terms of Service
Bot Privacy Policy
UGN Ownership & IP
Report a User
Report a Problem
Contact / Support
```

The UGN website should become the canonical location for the bot legal documents. Where possible, handle old GitHub legal URLs with redirects rather than breaking existing links.

## Legal Page Design

Use the Halloween design system but keep legal text highly readable.

Add:

- Clear headings
- Section anchors
- Table of contents where useful
- Last updated date
- Mobile-friendly typography
- Good contrast

Do not put distracting particles behind legal text.

## Accessibility

Maintain:

- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Good contrast
- Correct heading hierarchy
- Accessible forms
- Reduced-motion support
- Touch-friendly mobile controls

## Responsive Design

The website must work on:

- Desktop
- Laptop
- Tablet
- Mobile
- Small phone screens
- Touch devices

No horizontal overflow, overlapping decorations, inaccessible controls or PC-only interactions.

## Security

Check:

- Authentication
- Server-side authorization
- API permissions
- Input validation
- File validation
- Rate limiting
- Secure cookies
- Secret management
- Webhook protection
- Error handling

Never expose database credentials, API secrets, webhook URLs, private reports, private evidence or internal staff notes.

## Performance

Prefer existing infrastructure, CSS/SVG animations and optimized assets. Do not add heavy dependencies solely for Halloween effects.

## Do Not Break Existing Functionality

Do not unnecessarily remove or rewrite existing:

- Discord integrations
- VRChat integrations
- Events
- News
- Staff
- Community pages
- Shop
- Partners
- Support
- Authentication
- Admin functionality
- Existing APIs
- Existing database functionality

This is an upgrade, not permission for an unrelated rewrite.

## Testing

Before completion, verify:

### Public

- Homepage
- Navigation
- Halloween theme
- Halloween icon
- Desktop
- Tablet
- Mobile
- Legal pages
- Report submission
- Validation
- Confirmation

### Reports

- Submission
- Persistence
- Report ID
- Duplicate protection
- Webhook
- Staff dashboard
- Search/filter
- Assignment
- Notes
- Status changes
- Audit history
- Evidence protection
- Webhook retry

### Security

- Logged-out users blocked from staff reports.
- Normal members blocked from staff reports.
- Unauthorized staff blocked from restricted functions.
- Report ID manipulation tested.
- API authorization tested.
- Webhook secret protected.
- Evidence protected.
- Rate limiting tested.

### Accessibility

- Keyboard navigation
- Focus states
- Reduced motion
- Contrast
- Screen-reader labels
- Mobile touch targets

## Priority

```text
P0 — Security / Data Protection
P0 — Report Submission
P0 — Report Authorization
P0 — Discord Webhook
P0 — Staff Report Dashboard

P1 — Bot Privacy Policy
P1 — Bot Terms of Service
P1 — Ownership / IP Documentation
P1 — Halloween Design System
P1 — Official Halloween Icon
P1 — Responsive Design

P2 — Seasonal Decorations
P2 — Animation Polish
P2 — UI Refinements

P3 — Performance
P3 — Accessibility Polish
P3 — Final QA
```

## Critical Rule

Do not fake functionality.

If a button says `Submit Report`, it must actually submit a report.

If a page says `Staff Reports`, it must actually enforce authorization.

If the system says a webhook was sent, delivery must actually have occurred or the system must accurately show its state.

If a legal document says data is stored/deleted, the implementation must match.

The website and documentation must describe reality.
