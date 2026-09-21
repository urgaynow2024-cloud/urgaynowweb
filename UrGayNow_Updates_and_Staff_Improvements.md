# UrGayNow — Updates Changelog & Staff Page Improvements

## Overview

The Report System Overhaul and Support Ticket System have already been implemented.

However, there are two areas that now need improvement:

1. **`/updates` does not automatically reflect major completed changes.**
2. **`/staff` needs a visual/UX redesign, particularly around staff role and moderation tags, while preserving the existing staff ranking/order exactly.**

These are improvements to the existing system. Do not rebuild working functionality unnecessarily.

---

# 1. Automatic Updates & Changelog System

## Current Problem

The `/updates` page:

`https://www.urgaynow.com/updates`

does not automatically receive updates when major website features or systems are completed.

For example, the recently completed:

- Report System Overhaul
- Admin Report Center
- Public Reporting
- Report Tracking
- Support Ticket System
- Security improvements
- Community page improvements

are not automatically represented in the public Updates & Changelog.

The goal is to make `/updates` a properly maintained changelog system without turning it into a raw Git commit feed.

---

# 2. Inspect the Existing Updates System

Before making changes, inspect the existing implementation.

Find:

- `/updates`
- The database model powering updates
- Existing update/changelog API routes
- Existing admin UI
- Existing update creation/editing system
- Existing categories/tags
- Existing publishing system
- Existing update sorting/order
- Existing featured update functionality

Do not create duplicate systems if an existing update/changelog system already exists.

Extend the existing implementation where possible.

---

# 3. Structured Changelog Entries

Updates should support structured information such as:

- Title
- Slug
- Summary
- Description/content
- Category
- Version
- Status
- Published state
- Featured state
- Created date
- Updated date
- Published date

Suggested categories:

- New
- Improvement
- Fix
- Security
- Performance
- Maintenance
- Community
- Moderation
- Support

The public changelog should be written for normal UrGayNow users, not developers.

---

# 4. Group Related Changes

Do NOT create a separate public update for every individual code change.

A major feature should be grouped into one meaningful update.

For example:

## Report System & Support Ticket Overhaul

### New

- Support contact form
- Support ticket system
- Public report tracking
- User report history
- Staff notifications

### Improvements

- Admin report management
- Report filtering
- Staff assignment
- Report priorities
- Audit logging

### Security

- Database-backed rate limiting
- Duplicate report prevention
- Permission checks
- Anonymous reporting

This keeps `/updates` readable.

---

# 5. Automatic Draft Generation

When a significant feature or system is completed, the system should be able to generate a **changelog draft**.

Important:

DO NOT automatically publish every code change.

Instead:

```text
Development Changes
        ↓
Generate Changelog Draft
        ↓
Staff Review
        ↓
Publish
        ↓
/updates
```

Generated entries should initially be `DRAFT`.

Staff should be able to review and edit them before publication.

---

# 6. Do Not Turn `/updates` Into a Git Feed

Do NOT blindly expose:

- Commit messages
- File names
- Prisma migrations
- Dependency updates
- Formatting changes
- Internal refactors
- Debug changes
- Tests
- Temporary fixes
- Generated files
- Internal developer notes

Only meaningful user-facing changes should become changelog content.

If Git/development metadata is used to help generate a draft, it should only be used as an internal source for creating the draft.

---

# 7. Admin Changelog Management

If an admin update manager does not already exist, create:

`/admin/updates`

It should allow authorized staff to:

- View drafts
- View published updates
- Create an update
- Edit an update
- Preview an update
- Publish an update
- Unpublish an update
- Delete drafts
- Mark an update as featured

A:

`Generate from recent changes`

action can be added if practical.

Generated updates must always start as drafts.

---

# 8. Add the Current Completed Work

Create a changelog draft for the recently completed Report/Support overhaul.

Suggested title:

`Report System & Support Ticket Overhaul`

Suggested summary:

`Major improvements to reporting, moderation support, and user support requests across UrGayNow.`

The draft should include the completed work from the existing implementation, including:

### Report Management

- New admin report center
- Report statistics
- Advanced report filtering
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
- Report tracking links

### Security

- Database-backed rate limiting
- IP and user rate limiting
- Duplicate report prevention
- Authentication checks
- Admin permission checks
- Anonymous reporting

### Support Tickets

- New support contact form
- Support categories
- Unique `UGN-YYYY-XXXXX` ticket numbers
- Ticket statuses
- Ticket priorities
- Guest submissions
- Staff Discord notifications

### Community

- Community page data aggregation
- Approved/published filtering
- Newest-first sorting

### Infrastructure

- `SupportRequest` model
- Prisma migration
- Schema fixes
- `sharp` image optimization

Only include functionality that is actually implemented.

---

# 9. Public `/updates` Requirements

Verify that:

`https://www.urgaynow.com/updates`

supports:

- Newest updates first
- Date
- Category
- Title
- Summary
- Full changelog content
- Featured updates
- Light mode
- Dark mode
- Mobile responsiveness

Only published updates should appear publicly.

Drafts must NEVER appear on the public page.

---

# 10. Staff Page Redesign — `/staff`

The current Staff page works, but the presentation can be improved.

The goal is to make `/staff` feel like a polished UrGayNow staff directory rather than a basic list of cards.

Improve:

- Visual hierarchy
- Staff cards
- Role presentation
- Moderation tags
- Spacing
- Alignment
- Profile previews
- Mobile responsiveness
- Light/dark mode
- Overall consistency

## CRITICAL

This is a **visual/UX redesign only**.

Do NOT change:

- Staff members
- Staff roles
- Staff permissions
- Staff hierarchy
- Staff ranking
- Existing staff data
- Existing staff order

The existing staff ranking/order must remain exactly as it currently is.

---

# 11. Preserve Existing Staff Ranking

This is extremely important.

The redesign previously caused staff positions/ranking to change.

Do NOT allow this to happen again.

Before changing `/staff`:

1. Inspect how staff are currently ordered.
2. Identify the existing source of truth for the ranking/order.
3. Preserve it exactly.
4. Make the redesign around that existing order.

Do NOT automatically sort staff by:

- Name
- Username
- Recently joined
- Recently active
- Database ID
- Updated date
- Number of tags
- Number of permissions
- Role name
- Alphabetical order

If an existing field such as:

```text
rank
priority
displayOrder
sortOrder
position
```

is responsible for the current ordering, continue using that field.

Do not overwrite its values.

If the current order is hard-coded, preserve the exact hard-coded order.

If the current ranking looks unusual, DO NOT "fix" it.

The existing hierarchy is the source of truth unless an administrator specifically asks for it to be changed.

---

# 12. Staff Profile Role Tag — IMPORTANT UI FIX

The small role tag shown on staff profiles/cards currently looks poor and is difficult to read.

For example, the current style resembles:

```text
🔺 Founder
```

inside a very small, low-contrast pill.

This needs to be redesigned.

## Problems With The Current Tag

The current role tag is:

- Too small
- Too low contrast
- Hard to read
- Visually cramped
- Looks washed out
- Does not stand out from the card background
- Feels more like a disabled UI element than an active staff role
- Does not match the importance of the staff member's role

The role tag should feel intentional and polished.

---

# 13. Redesign The Primary Staff Role Tag

The primary staff role should be clearly visible directly on the staff profile/card.

Instead of a tiny faded pill, use a cleaner role treatment with:

- Better text contrast
- Slightly larger text
- Better vertical padding
- Better horizontal padding
- Clear icon sizing
- More balanced spacing
- Stronger border or background treatment
- Rounded corners that match the rest of the UrGayNow UI
- Proper light/dark mode support

The tag should remain compact, but it must be readable at a glance.

Do NOT make it enormous.

The goal is:

**Small + clean + readable + premium**

not:

**Tiny + faded + cramped**

---

# 14. Role Tag Visual Hierarchy

The primary role tag should sit naturally near the staff member's name.

Example:

```text
Alex
[ ♢ Founder ]
```

or:

```text
Alex
Founder
```

with a subtle but clearly visible role treatment.

Avoid making the role tag look like a generic notification/status badge.

The role should visually communicate:

"This person is a Founder/Administrator/Moderator"

rather than looking like a random decorative label.

---

# 15. Role Tag Styling

Create a consistent visual system for roles such as:

- Founder
- Administrator
- Moderator
- Community
- Support
- Creator / Contributor

Use role-specific styling where appropriate, but keep the overall component consistent.

For example:

```text
Founder       → distinctive leadership treatment
Administrator → administrative treatment
Moderator     → moderation treatment
Community     → community treatment
Support       → support treatment
Creator       → creator treatment
```

Do NOT make the colours so pale that the text becomes difficult to read.

Do NOT use colour as the only way to identify a role.

Every role must remain readable in:

- Light mode
- Dark mode
- Mobile
- Reduced brightness

---

# 16. Secondary Moderation / Responsibility Tags

Secondary tags such as:

```text
Community
Reports
Discord
Safety
Support
```

should be visually separate from the primary role.

They should be smaller/subtler than the primary role, but still readable.

Do NOT turn every tag into a large colourful pill.

Use a restrained treatment such as:

```text
Founder
Community · Reports · Discord
```

or a small set of clean secondary chips.

The primary role must always have the strongest visual hierarchy.

---

# 17. Do Not Let Tags Affect Ranking

Tags are descriptive information only.

Having more tags must NOT:

- Increase staff ranking
- Change staff card position
- Move staff into another section
- Change staff hierarchy
- Change permissions

The existing staff ranking/order remains the source of truth.

---

# 18. Staff Cards

Improve the existing cards without changing their order.

Each card can contain:

- Avatar
- Display name
- Username where available
- Clearly visible primary role tag
- Secondary tags
- Short bio
- Optional status
- Staff profile link
- Report button

The card should feel modern and clean without becoming overly decorative.

Do not overcrowd the card with badges.

The role tag should be easy to notice without overpowering the staff member's name.


---

# 15. Staff Cards

Improve the existing cards without changing their order.

Each card can contain:

- Avatar
- Display name
- Username where available
- Primary role
- Secondary tags
- Short bio
- Optional status
- Staff profile link
- Report button

The card should feel modern and clean without becoming overly decorative.

Do not overcrowd the card with badges.

---

# 16. Staff Sections

If the current Staff page already uses sections/groups, preserve the existing staff hierarchy and ordering.

Sections may visually separate groups such as:

### Leadership

Founder / Administrators

### Moderation

Moderators / Safety

### Community

Community / Support

### Contributors

Creators / Contributors

However:

DO NOT automatically move staff into different sections based on their tags.

Do not change the existing grouping logic unless it is already how the current page works.

If the current system has an established ordering/grouping, preserve it.

---

# 17. Staff Profile Pages

Make:

`/staff/[id]`

visually match the redesigned staff cards.

The profile can include:

- Large avatar/header
- Name
- Primary role
- Secondary tags
- Bio
- Responsibilities
- Joined date where available
- Social/community links where available
- Report Staff Member button

The profile should feel like an expanded version of the staff card.

Do not change the underlying staff permissions or hierarchy.

---

# 18. Report Staff Button

Keep the existing staff reporting functionality.

The report button should remain accessible but should not overpower the profile.

Use the existing report system rather than creating a separate reporting implementation.

Example:

```text
⚑ Report
```

or the existing UrGayNow report button style.

---

# 19. Important Data Safety Rule

The Staff redesign must NOT modify staff data just to make the UI look better.

Do not:

- Rewrite staff roles
- Change permissions
- Change rankings
- Change display order
- Delete tags
- Rename roles
- Reassign staff
- Change staff IDs
- Modify moderation permissions

unless explicitly required by a separate administrative request.

This task is primarily UI/UX.

---

# 20. Testing Requirements

After implementation:

## Updates

Test:

- `/updates`
- `/admin/updates`
- Creating a draft
- Editing a draft
- Previewing a draft
- Publishing a draft
- Confirming published updates appear publicly
- Confirming drafts do NOT appear publicly
- Confirming newest updates appear in the correct order

## Staff

Before the redesign, record the current staff order.

After the redesign, verify:

- Same staff members
- Same ranking
- Same order
- Same roles
- Same permissions
- Same staff data

Only the visual presentation should have changed.

Also test:

- Desktop
- Mobile
- Light mode
- Dark mode
- Staff profile pages
- Report Staff button

---

# 21. Final Requirement

Do not treat this as an opportunity to rewrite working systems.

The goal is:

```text
Better changelog management
+
Better Staff page UI
+
Cleaner moderation tags
+
EXACT SAME STAFF RANKING/HIERARCHY
+
No loss of existing functionality
```

The existing Report System and Support Ticket System are already implemented.

This task is about properly documenting those completed changes through `/updates` and improving the `/staff` presentation without altering the underlying staff hierarchy.
