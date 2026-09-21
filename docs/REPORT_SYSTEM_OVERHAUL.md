# UrGayNow Report System Overhaul & Support Ticket System

## Summary of Changes

This document summarizes all changes implemented in the report system overhaul and support ticket system.

---

## 1. Admin Report Center

### `/admin/reports` - Report List Page
- Statistics dashboard: Open, In Review, High Priority, Resolved Today
- Filterable table with columns: ID, Reason, Content, Status, Priority, Assigned, Reporter, Submitted
- Filter controls: Status, Reason, Priority, Content Type, Assigned Staff, Reporter

### `/admin/reports/[id]` - Report Detail Page
- Full report information display
- Reported content preview with metadata
- Audit log with chronological actions
- Staff actions panel:
  - Assign to me / Unassign
  - Change status (Open, In Review, Resolved, Dismissed, Escalated)
  - Change priority (Low, Normal, High, Urgent)
  - Add internal note
  - Resolve with resolution note
  - Dismiss with reason
  - Escalate to urgent

### `/api/admin/reports` - Staff Actions API (PATCH)
Actions supported:
- `assign` - Assign report to staff member
- `unassign` - Remove assignment
- `status` - Change status with optional resolution
- `priority` - Change priority level
- `note` - Add internal note to audit log
- `resolve` - Mark as resolved
- `dismiss` - Mark as dismissed
- `escalate` - Escalate to urgent priority

All actions create audit log entries.

---

## 2. Public Report Buttons

Added report buttons to all public content pages:

| Page | Component | Content Types |
|------|-----------|---------------|
| Gallery | `GalleryGrid.tsx` | Community submissions, Gallery images, Group photos |
| Community List | `app/community/page.tsx` | Community submissions |
| Community Detail | (existing) | Community submissions |
| Staff Cards | `StaffCard.tsx` | Staff profiles |
| Staff Detail | `app/staff/[id]/page.tsx` | Staff profiles |
| Events | `EventClient.tsx` | Events |
| Shop | `ShopGallery.tsx` | Shop designs |
| News List | `AnnouncementCard.tsx` | Announcements |
| News Detail | `app/news/[slug]/page.tsx` | Announcements |

**Button Style**: Outline variant with visible border, flag icon + "Report" text, works in light/dark modes.

---

## 3. User Report History

### `/my-reports` 
- Redirects to `/report/me` (existing page)

### `/report/track/[token]`
- Public tracking page using report token
- Shows status, priority, resolution, staff notes
- No authentication required

### `/report/me`
- Authenticated user's submitted reports
- Links to track pages

---

## 4. Notifications

### Staff Notifications (New Reports)
- Discord webhook: `discordReportsWebhookUrl` setting
- Triggered on new report submission
- Includes: report ID, reason, content type, description, priority, link to admin page

### User Notifications (Resolution)
- Discord webhook notification when report is resolved/dismissed
- Sent to reporter's email (if provided and not anonymous)
- Includes: ticket number, status, resolution details, link to track page

---

## 5. Security Improvements

### Database Rate Limiting
- Replaced in-memory Map with database queries
- Checks both IP and user ID within sliding window
- Configurable via `RATE_LIMIT` constants

### Other Security
- Authentication required for submissions
- Duplicate report prevention
- Permission checks on all admin endpoints
- Anonymous reporting option (hides reporter identity from staff)

---

## 5. Support Ticket System

### `/support` Page
- Existing contact methods (Email, Discord, VRChat)
- New **Support Contact Form** with:

#### Form Fields
1. **Category** (18 options):
   - Bug Report
   - Technical Problem
   - Feature Request
   - General Question
   - Community / Discord
   - Moderation / Safety
   - Moderation Appeal
   - Harassment / Report
   - Report Content
   - Account / Discord Issue
   - Shop / Purchase
   - Creator Support
   - Content / Resources
   - Feedback / Suggestions
   - Partnership / Collaboration
   - Privacy / Data Request
   - Report a Website Issue
   - Other

2. **Subject** (required, max 120 chars)
3. **Description** (required, max 3000 chars)
4. **Contact Method** (required): Discord Username / Email / Other
5. **Contact Information** (required) with helper text

#### Ticket Format
- Unique ticket number: `UGN-YYYY-XXXXX` (e.g., `UGN-2026-00001`)
- Auto-generated with collision detection

#### Ticket Statuses
- Open
- In Progress
- Waiting for User
- Resolved
- Closed

### Database Model: `SupportRequest`
```prisma
model SupportRequest {
  id                String   @id @default(cuid())
  ticketNumber      String   @unique
  category          String
  subject           String
  description       String
  contactMethod     String
  contactInfo       String
  attachments       String   @default("[]")
  status            String   @default("OPEN")
  priority          String   @default("NORMAL")
  assignedStaffId   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### `/api/support/contact` API
- Guest submissions (no auth required)
- Validates all fields
- Generates unique ticket number
- Discord webhook notification to staff
- Returns ticket number on success

---

## 6. Community Page Enhancement

### `/community` Page
Now combines three data sources (matching Gallery page):
- CommunitySubmission
- GalleryImage
- GroupPhoto

All filtered by `status: "APPROVED"` and `published: true`, sorted by creation date (newest first), limited to 50 items.

---

## 7. Schema Fixes

### `schema.sql` Seed Data
- **AnnouncementCategory**: Added explicit `createdAt` and `updatedAt` with `CURRENT_TIMESTAMP`
- **AnnouncementTag**: Added explicit `createdAt` and `updatedAt` with `CURRENT_TIMESTAMP`
- **GuideCategory** backfill: Fixed enum value from `'General'` to `'GENERAL'` (uppercase)

### Prisma Schema
- New `SupportRequest` model
- Updated `AnnouncementCategory`/`AnnouncementTag` seed data compatibility

---

## 8. Dependencies

- **sharp**: Added for production image optimization (`npm install sharp`)

---

## 9. Files Created/Modified

### New Files
```
app/admin/reports/[id]/page.tsx
app/api/admin/reports/route.ts
app/api/support/contact/route.ts
app/my-reports/page.tsx
components/admin/ReportDetailClient.tsx
components/support/SupportContactForm.tsx
lib/reports.ts
prisma/migrations/20260918120000_add_report_system/
```

### Key Modified Files
```
app/admin/reports/page.tsx
app/community/page.tsx
app/support/page.tsx
app/api/report/submit/route.ts
components/GalleryGrid.tsx
components/AnnouncementCard.tsx
components/StaffCard.tsx
components/report/ReportModal.tsx
components/report/ReportForm.tsx
prisma/schema.prisma
schema.sql
package.json (added sharp)
```

---

## 10. Deployment Notes

1. Run `npx prisma db push --accept-data-loss` to sync database
2. Set `discordReportsWebhookUrl` in admin settings for notifications
3. Build passes with `npm run build`
4. Dev server starts with `npm run dev`

---

## Future Enhancements (Not Implemented)

- Admin ticket management UI (`/admin/support`)
- Ticket replies/threading
- Email notifications (in addition to Discord)
- File attachments for support tickets
- SLA tracking
- Ticket categories with custom fields