# Ur Gay Now Feature Implementation Roadmap

## Phase 1 — Foundation
1. Shared design system and UX components
2. Better error/404 pages
3. Accessibility improvements
4. Better mobile UI
5. Search foundation

## Phase 2 — Events
6. Better events lifecycle
7. Live Now section
8. Better event pages
9. Categories/tags
10. Calendar/reminders

## Phase 3 — Moderation
11. Website reports
12. Report tracking
13. Anonymous reporting
14. Staff moderation dashboard
15. Audit logging

## Phase 4 — Community
16. User profiles
17. Staff badges
18. Community submissions
19. Gallery filtering
20. Polls/voting

## Phase 5 — Publishing
21. Announcements/news
22. Updates/changelog
23. Discord publishing webhooks
24. Notification system

## Phase 6 — Homepage
25. What's Happening? homepage
26. Community highlights
27. Cross-content recommendations

## Engineering requirements
- Server-side validation.
- Secure role checks.
- Rate limiting for public forms.
- Safe file uploads.
- Database migrations.
- Error logging.
- Automated tests for critical workflows.
- Mobile/responsive testing.
- Accessibility testing.
- Webhook retry handling.

## Definition of done
A feature is not considered complete until:
- Desktop UI works.
- Mobile UI works.
- Accessibility basics are covered.
- Loading/empty/error states exist.
- Permissions are enforced server-side.
- Database changes have migrations.
- Critical actions have error handling.
- Existing pages do not regress.

## Referenced by
The engineering requirements and definition of done defined here apply site-wide and are referenced by: 03-Better-Event-Pages, 09-Community-Polls-and-Voting, 11-Website-Report-System, 17-Staff-Badges-and-Roles, 23-Updates-Changelog-System.
