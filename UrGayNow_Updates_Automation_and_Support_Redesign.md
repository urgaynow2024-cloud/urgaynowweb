# UrGayNow — Updates Automation & Support Page Redesign

## Overview

There are currently two issues that need to be fixed:

1. `/updates` is NOT automatically receiving/publishing updates from completed development work.
2. `/support` works, but the page can be significantly improved visually and functionally.

These should be treated as two separate improvements.

Do not break the existing Report System, Support Ticket System, reporting functionality, or existing support submission API.

---

# 1. `/updates` — ACTUALLY FIX THE AUTOMATIC UPDATES SYSTEM

## Current Problem

The public page:

`https://www.urgaynow.com/updates`

currently displays:

> No published updates yet

even though substantial work has already been completed on UrGayNow.

The goal is to make the changelog actually work.

---

# 2. Inspect The Existing `/updates` Implementation

Before changing anything, inspect:

- `/updates`
- The update/changelog database model
- API routes
- Server-side queries
- Admin update management
- Published/draft logic
- Existing update components
- Existing seed data
- Any update creation functionality

Determine exactly why `/updates` currently returns:

`No published updates yet`

Do not assume the database is empty.

Check:

- Database
- Prisma model
- API response
- Query filters
- `published` state
- `publishedAt`
- Status values
- Environment/database connection
- Any caching
- Server-side rendering/cache behaviour

---

# 3. Fix The Actual Data Flow

The intended flow should be:

```text
Completed Development Work
        ↓
Create Changelog Draft
        ↓
Staff Review
        ↓
Publish
        ↓
Database
        ↓
/updates
```

The public page MUST read from the same actual source of truth used by the admin update system.

Do not hard-code updates into the React page.

Do not create a fake frontend-only changelog.

---

# 4. Automatic Update Creation

We want completed major work to be easy to turn into a changelog entry.

The system should support generating a draft update from significant development changes.

However:

DO NOT publish raw Git commits directly.

DO NOT turn `/updates` into a Git log.

Ignore internal changes such as:

- Formatting
- Refactoring
- Dependency updates
- Lockfile changes
- Debugging
- Tests
- Internal database changes
- Temporary fixes
- Generated files

Only meaningful user-facing changes should become changelog content.

---

# 5. Important — Automatic Does NOT Mean Blind Publishing

The preferred system is:

```text
Development work
      ↓
Generate/update draft
      ↓
Staff reviews
      ↓
Staff publishes
      ↓
Public changelog
```

This prevents `/updates` from becoming spammy.

If completely automatic publishing is already part of the existing intended design, verify it carefully before enabling it.

Do not publish developer-only changes.

---

# 6. Create The Current Update

The recently completed Report System + Support Ticket work should be represented in `/updates`.

Create a proper published update if the existing workflow allows it, otherwise create the appropriate draft.

Suggested title:

`Report System & Support Ticket Overhaul`

Suggested summary:

`Major improvements to reporting, moderation support, and user support requests across UrGayNow.`

Include the completed work:

### Reporting

- New admin report center
- Report statistics
- Report filtering
- Report detail pages
- Staff assignment
- Status management
- Priority management
- Internal notes
- Resolution notes
- Dismissal reasons
- Escalation
- Audit logs

### Public Reporting

- Gallery reporting
- Community reporting
- Staff profile reporting
- Event reporting
- Shop reporting
- News/announcement reporting

### Report Tracking

- `/report/me`
- `/report/track/[token]`
- `/my-reports`

### Notifications

- Staff Discord notifications
- Reporter resolution notifications
- Tracking links

### Security

- Database-backed rate limiting
- IP/user rate limiting
- Duplicate report prevention
- Authentication checks
- Permission checks
- Anonymous reporting

### Support

- Support contact form
- Support categories
- `UGN-YYYY-XXXXX` ticket numbers
- Ticket statuses
- Ticket priorities
- Guest submissions
- Staff Discord notifications

### Community

- Combined community content sources
- Approved/published filtering
- Newest-first sorting

### Infrastructure

- `SupportRequest` model
- Prisma migration
- Schema fixes
- `sharp` image optimization

Only include functionality that actually exists.

---

# 7. `/updates` Public Page Design

Once the data is actually connected, improve the page so it feels like a proper changelog.

The page should have:

### Header

**Updates & Changelog**

A short description such as:

> Everything new, improved, and fixed across UrGay Now.

### Update Cards

Each update should clearly show:

- Date
- Category
- Title
- Short summary
- Update content
- Optional version
- Featured state if applicable

Use clear visual hierarchy.

Do not make every update look like a giant block of text.

---

# 8. Update Categories

Use visually clear categories such as:

- New
- Improved
- Fixed
- Security
- Community
- Moderation
- Support

Categories should be subtle and readable.

Do not use tiny, low-contrast tags.

---

# 9. Updates Ordering

Newest published updates should appear first.

Use the actual publication date/time.

Do NOT sort by:

- Database ID
- Created date if it differs from publication date
- Title
- Alphabetical order

Drafts must NEVER appear publicly.

---

# 10. Caching / Refresh Problem

Make sure `/updates` is not displaying stale cached data.

After publishing an update:

```text
Publish
   ↓
Database updated
   ↓
/updates revalidates
   ↓
New update appears
```

Use the appropriate Next.js revalidation/cache strategy.

Do not require manually restarting the entire server just to make a newly published update appear.

---

# 11. `/support` — Major Visual Redesign

Current `/support` is functional but extremely basic.

It currently consists mostly of:

- Page title
- Short description
- Email link
- Emergency notice
- Support form

The page should feel much more polished and welcoming.

The existing support functionality must remain intact.

---

# 12. New Support Page Structure

Create a stronger page hierarchy:

```text
Support & Contact

Need a hand?
We're here to help.

[ Contact Options ]

[ Support Request Form ]

[ What happens next? ]

[ Urgent / Safety Notice ]
```

---

# 13. Hero Section

Create a proper support hero.

Example:

## Need a hand?

Whether you've found a bug, need help with something, have a question, or need to contact the team, we're here to help.

Keep it friendly and concise.

Use the existing UrGayNow design language.

---

# 14. Contact Options

Instead of showing the email as plain text:

```text
✉️ Email
urgaynow2024@gmail.com
```

Create a proper contact card.

Potential cards:

### Email Support

For general questions and support requests.

### Discord

For community assistance and urgent moderation/community concerns.

### Support Request

Submit a ticket and receive a unique ticket number.

Only show contact methods that actually exist.

Do not invent additional contact systems.

---

# 15. Support Form Redesign

The existing form should be visually redesigned.

Keep all existing functionality and validation.

Fields:

- Category
- Subject
- Description
- Contact Method
- Contact Information

The form should use:

- Clear labels
- Helpful descriptions
- Proper spacing
- Clear required indicators
- Good input sizing
- Character counters where appropriate
- Clear focus states
- Error states
- Success state

---

# 16. Category Selection

The support categories should be easier to understand.

Use the existing categories.

Group them visually if useful.

For example:

### Technical

- Bug Report
- Technical Problem
- Website Issue
- Feature Request

### Community & Safety

- Community / Discord
- Moderation / Safety
- Moderation Appeal
- Harassment / Report
- Report Content

### Account & Purchases

- Account / Discord Issue
- Shop / Purchase
- Creator Support

### General

- General Question
- Feedback / Suggestions
- Partnership / Collaboration
- Privacy / Data Request
- Content / Resources
- Other

Do not remove existing categories.

---

# 17. Contact Information Helper Text

Make the contact field clearer.

Instead of simply:

> Please provide at least one way for our staff to contact you.

Explain based on the selected contact method where possible.

For example:

Discord:

> Enter your Discord username so our team can contact you.

Email:

> Enter the email address you'd like us to use for your reply.

Do not expose or unnecessarily store additional personal information.

---

# 18. Submission Success Screen

After submitting a support request, do NOT just show a generic success message.

Show the generated ticket number prominently.

Example:

# Support request submitted!

Your ticket number is:

`UGN-2026-00042`

Keep this number somewhere safe.

Then explain:

> Our team will review your request and contact you using the details you provided.

If a tracking system exists, provide the appropriate tracking link.

---

# 19. "What Happens Next?" Section

Add a small explanatory section:

### What happens next?

1. Your request receives a unique ticket number.
2. Our staff team reviews it.
3. We may contact you if more information is needed.
4. Your ticket is resolved once the issue has been handled.

This makes the support process much clearer to users.

---

# 20. Urgent / Safety Notice

Keep the existing emergency/safety guidance, but redesign it so it does not dominate the page.

It should be a clear informational warning/card near the bottom of the page.

Keep the wording factual.

For urgent community safety concerns, direct users to the appropriate existing Discord/staff contact method.

---

# 21. Visual Design

The redesigned support page should feel:

- Modern
- Friendly
- Clean
- Welcoming
- Professional
- Consistent with UrGayNow
- Good in dark mode
- Good in light mode
- Responsive on mobile

Avoid:

- Giant empty spaces
- Excessive gradients
- Huge cards everywhere
- Tiny text
- Low-contrast labels
- Overly rounded everything
- Excessive animations
- Generic corporate support styling

The page should still feel like UrGayNow.

---

# 22. Accessibility

Make sure:

- Text has sufficient contrast
- Inputs have visible labels
- Focus states are obvious
- Buttons are readable
- Errors are understandable
- Keyboard navigation works
- Mobile touch targets are large enough
- Colour is not the only way information is communicated

---

# 23. Preserve Existing Functionality

Do NOT break:

- `/api/support/contact`
- Ticket number generation
- Discord notifications
- Support categories
- Validation
- Existing database model
- Guest submissions
- Existing contact methods

This is primarily a UI/UX improvement plus fixing the changelog data flow.

---

# 24. Testing

## Updates

Test:

- Existing updates load
- Newly published updates appear
- Drafts remain hidden
- Newest updates appear first
- Publishing does not require a server restart
- Cache/revalidation works
- Mobile layout works
- Dark/light mode works

## Support

Test:

- All categories work
- Form validation works
- Ticket number is generated
- Discord notification still works
- Success screen displays ticket number
- Existing API remains functional
- Mobile layout works
- Dark/light mode works
- Keyboard navigation works

---

# 25. Final Goal

The end result should be:

```text
/updates

REAL DATA
↓
REAL PUBLISHED CHANGELOG
↓
AUTOMATIC REVALIDATION
↓
NEW UPDATES ACTUALLY APPEAR
```

and:

```text
/support

Beautiful Hero
↓
Contact Options
↓
Clean Support Form
↓
Clear Submission Experience
↓
Ticket Number
↓
What Happens Next?
↓
Safety Information
```

Do not just redesign the frontend while leaving `/updates` disconnected from the actual update system.

The most important issue to fix first is:

**Why does `/updates` still say "No published updates yet" when major work has already been completed?**
