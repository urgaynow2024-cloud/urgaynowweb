# Staff — Full Directory and Admin Management Overhaul

## Goal
Make Staff feel like a real team directory and make Admin > Staff useful for management. The current table is functional but visually flat and gives staff very little context.

## Public Staff page
Create a stronger directory experience:

### Header
- `Meet the Team`
- Short explanation of what the team does.
- Optional filter/search.

### Staff cards
Each person gets:
- Avatar/photo
- Name
- Rank badge
- Short bio
- VRChat username
- Social links when supplied
- Hosted event indicator where relevant

Use role-specific visual badges, but do not rely on colour alone.

### Grouping
Allow staff to be grouped by rank/department where appropriate. Use the configured `sortOrder` within each group.

### Profile detail
Clicking a staff member can open `/staff/[id]` if that route is implemented, or a clean detail modal. It should show their full bio and links.

## Admin > Staff redesign
Replace the database-table-first experience with a management workspace.

### Top section
- Page title + description
- `Add staff` primary action
- Search
- Rank filter
- Active filters
- View toggle: List / Cards

### Summary cards
Show:
- Total staff
- Founders/owners
- Moderation roles
- Event/community roles
- Recently added

Do not hard-code role names into calculations; derive counts from the current configured roles.

### Staff list
Each row/card should show:
- Avatar
- Name
- VRChat username
- Rank
- Bio preview
- Sort order
- Last updated
- Actions

Actions:
- Edit
- Duplicate (optional)
- Move/reorder
- Delete

Destructive actions require confirmation.

### Reordering
Provide a simple reorder control. Persist `sortOrder`. Prefer a server action or API with validation rather than trusting client values.

### Add/Edit form
Split into sections:
1. Identity
2. Role
3. Profile
4. Social links
5. Display order

Add:
- Image preview
- URL validation
- Character limits
- Helpful placeholders
- Unsaved changes warning where practical

### Better visual hierarchy
Use a premium admin panel layout:
- dark sidebar
- clear page header
- compact stats
- elevated content surface
- subtle borders
- consistent icons
- fewer giant empty areas
- no excessive gradients

## Acceptance tests
- Search works.
- Rank filter works.
- Add/edit/delete work.
- Reordering persists.
- Duplicate VRChat username is handled cleanly.
- Empty state is useful.
- Mobile layout is usable.
