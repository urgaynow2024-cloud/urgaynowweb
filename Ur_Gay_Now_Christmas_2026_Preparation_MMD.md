# Ur Gay Now — Christmas 2026 Preparation MMD

## Purpose

Prepare the UGN website for a future Christmas 2026 seasonal theme **without activating Christmas on the live site and without breaking the current Halloween website or any existing functionality**.

This is a preparation and architecture task first. Christmas must remain disabled on production until explicitly approved.

---

## 1. NON-NEGOTIABLE SAFETY RULES

### Do not break existing functionality

Do not modify, replace, refactor, or migrate unrelated functionality.

The following systems are protected:

- Report submission
- Report database/storage
- Discord report webhook
- Staff report dashboard
- Report permissions
- Report IDs
- Report evidence/security handling
- Report audit history
- Authentication
- Staff management
- Events
- Announcements/news
- Navigation
- Footer links
- Forms
- Existing database behaviour
- Existing API routes
- Existing responsive behaviour

If a change is not required for the seasonal theme architecture, leave it alone.

### Do not activate Christmas

The production site must remain Halloween-themed.

Do not change the production seasonal state from Halloween to Christmas.

Christmas must be implemented so it can be previewed/tested locally or through a safe development mechanism without becoming the live production theme.

---

## 2. EXISTING UGN UI IS THE SOURCE OF TRUTH

Do **not** redesign UGN.

The existing UGN layout, spacing, components, navigation, cards, buttons, typography, responsive behaviour, and overall UX must remain recognizable.

Christmas is a seasonal visual layer, not a website redesign.

The goal is:

> Existing UGN website + Christmas atmosphere

Not:

> Completely redesigned Christmas website

---

## 3. SEASONAL THEME ARCHITECTURE

Create a clean seasonal theme architecture that can support:

- `none`
- `halloween`
- `christmas`
- future seasonal themes

Use the architecture that best fits the existing codebase.

Do not blindly create a new framework or introduce unnecessary dependencies.

Conceptually, the application should be able to determine something like:

```text
CURRENT_SEASON = "halloween"
```

and later:

```text
CURRENT_SEASON = "christmas"
```

The exact implementation is up to the existing project architecture.

### Important

The current Halloween implementation must continue working.

There must also be a safe way to return to the normal UGN appearance.

---

## 4. CHRISTMAS MUST BE ISOLATED

Christmas CSS, components, assets, configuration, and effects should be isolated as much as reasonably possible.

Avoid:

- scattering Christmas-specific CSS across unrelated components
- replacing existing component styles
- modifying shared components unnecessarily
- hard-coded Christmas colours throughout the application
- changing existing functionality simply to support decoration

Prefer:

- theme variables
- seasonal classes/data attributes
- isolated seasonal components
- reusable seasonal effects
- configuration-driven theme values

Example concept:

```css
[data-season="christmas"] {
    --season-primary: ...;
    --season-secondary: ...;
    --season-accent: ...;
}
```

This is only an example. Follow the project's existing styling architecture instead of forcing this exact implementation.

---

## 5. CHRISTMAS VISUAL DIRECTION

Christmas should feel atmospheric and polished while still looking like UGN.

Suggested starting palette:

```text
#0A0D18 — winter night
#111827 — deep blue
#1E293B — winter slate
#312E81 — deep purple
#6D28D9 — UGN purple
#38BDF8 — icy blue
#E0F2FE — ice
#F8FAFC — snow white
#DC2626 — Christmas red
#16A34A — Christmas green
#FACC15 — warm Christmas lights
```

Purple and blue should remain important so the website still feels like UGN.

Do not turn the entire site into bright red and green.

---

## 6. HEADER

Prepare Christmas styling for the existing header.

The future Christmas logo must:

- replace the normal UGN logo in the exact existing logo slot
- use the same container/position
- preserve responsive behaviour
- preserve click behaviour
- preserve dimensions where practical

There must be exactly ONE logo.

Do not create a second logo beside the existing one.

Do not activate the Christmas logo on production yet.

---

## 7. HERO

Prepare the existing hero for a Christmas atmosphere.

Future Christmas styling may include:

- winter night background
- subtle moonlight
- stars
- gentle snowfall
- soft winter fog
- Christmas lights
- subtle icy glow
- atmospheric lighting

Keep:

- existing hero content
- existing buttons
- existing layout
- existing accessibility
- existing responsive behaviour

Do not turn the hero into a completely different page.

---

## 8. GLOBAL BACKGROUND

The future Christmas theme should feel like an environment rather than a collection of Christmas emojis.

Possible effects:

- subtle snowfall
- distant stars
- winter fog
- soft particles
- subtle frost around selected edges
- Christmas light glow

Do not create:

- giant decorations
- excessive emojis
- flashing effects
- distracting animations
- effects covering text
- effects that interfere with buttons
- effects that make scrolling difficult

---

## 9. CARDS

Prepare Christmas styling for the existing:

- What We Offer cards
- Event cards
- Announcement cards
- Community Highlight cards
- Staff cards
- Other major homepage cards

Possible styling:

- frosted/glass appearance
- subtle winter border
- purple/blue glow
- icy highlights
- small Christmas-light accents
- subtle snow details

Do not change card functionality.

---

## 10. EVENTS

Christmas event cards should eventually be visually recognizable as seasonal content.

Do not modify:

- event data structure
- event API
- event registration
- event functionality
- event dates
- event permissions

Only prepare visual theming.

---

## 11. ANNOUNCEMENTS

Prepare the existing announcement/news cards for the Christmas theme.

Do not modify the announcement backend or content system.

---

## 12. STAFF

Prepare the existing staff cards for Christmas styling.

Keep:

- profile images
- names
- roles
- links
- Report buttons
- report functionality
- staff permissions

Do not touch the report backend.

---

## 13. FOOTER

Prepare the footer for the Christmas atmosphere.

Keep all existing:

- links
- social links
- navigation
- legal links
- community links
- support links

Only the visual styling should change.

---

## 14. BUTTONS

Keep existing button shapes and UX.

Christmas mode may add:

- subtle glow
- icy highlight
- Christmas-light accents
- seasonal hover lighting

Do not make buttons harder to read or operate.

---

## 15. ANIMATION AND ACCESSIBILITY

Christmas animation must be optional/reducible.

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- disable/reduce snowfall
- disable unnecessary floating particles
- remove continuous decorative movement
- retain readable/static styling

Animations must not cause:

- flashing
- rapid brightness changes
- excessive motion
- content obstruction
- poor performance

---

## 16. MOBILE / TABLET / DESKTOP

Christmas styling must work on:

- desktop
- laptop
- tablet
- mobile

Do not assume hover exists.

Do not make Christmas decorations interfere with:

- touch targets
- menus
- scrolling
- buttons
- forms
- report controls

---

## 17. PERFORMANCE

Seasonal effects must be lightweight.

Avoid adding large dependencies just for decorative effects.

Prefer:

- CSS where practical
- lightweight existing libraries where already available
- optimized static assets
- lazy loading where appropriate

Do not create an effect that significantly increases page load time.

---

## 18. REPORT SYSTEM PROTECTION

This is extremely important.

The report system has already been fixed.

Do not rewrite it.

Do not refactor it.

Do not change its database schema.

Do not change its API contract.

Do not change webhook behaviour.

Do not change report IDs.

Do not change staff permissions.

Do not change evidence handling.

If report UI receives Christmas styling, only modify presentation.

After changes, verify that:

1. A report can still be submitted.
2. The report still reaches the backend.
3. The report is stored correctly.
4. The Discord webhook still works.
5. Staff can still access reports.
6. Existing permissions remain intact.
7. Report IDs remain intact.
8. Evidence/security behaviour remains intact.

---

## 19. DATABASE SAFETY

Do not introduce database migrations for purely visual seasonal theming unless absolutely necessary.

Prefer configuration or application-level theme state.

If a database change is genuinely required:

- explain why
- document the migration
- ensure it is backwards compatible
- do not run destructive migrations
- do not delete existing data

---

## 20. PRODUCTION SAFETY

Christmas must not accidentally become active because of:

- default configuration
- missing environment variables
- build-time fallback
- deployment behaviour
- server restart
- cache
- client-side fallback

The safe fallback should remain the currently approved production theme.

Do not make:

```text
undefined -> christmas
```

a possible production fallback.

---

## 21. PREVIEW / TEST MODE

Create a safe development/preview method for testing Christmas without enabling it for everyone.

Use whichever approach best fits the existing architecture, such as:

- development-only theme selector
- local configuration
- preview query parameter
- admin-only preview
- staging configuration

Do not expose an insecure public production switch.

Do not create a client-side control that lets ordinary users activate hidden production themes unless explicitly approved.

---

## 22. HALLOWEEN COMPATIBILITY

Before considering this task complete:

Halloween must still render correctly.

Verify:

- Halloween colours
- Halloween assets
- Halloween effects
- Halloween logo
- Halloween event styling
- existing Halloween layout
- report functionality
- navigation
- mobile layout

Christmas preparation must not overwrite Halloween styling.

---

## 23. NORMAL THEME COMPATIBILITY

The website must still support a normal/no-season appearance.

Verify that disabling seasonal styling does not remove or alter:

- UGN branding
- content
- navigation
- functionality
- accessibility
- responsive behaviour

---

## 24. DO NOT OVERENGINEER

Do not turn this into a massive rewrite.

Do not:

- replace the CSS framework
- replace the component system
- migrate the app
- rewrite the homepage
- replace the existing theme system if one already exists
- add unnecessary packages
- refactor unrelated code
- rename unrelated files
- change APIs without necessity

Use the smallest safe architectural changes required.

---

## 25. TESTING REQUIREMENTS

Before reporting completion, run the project's appropriate checks.

At minimum, where supported by the existing project:

```text
TypeScript/typecheck
Lint
Unit tests
Build
```

Also perform a visual/manual check of:

```text
Normal theme
Halloween theme
Christmas preview
Desktop
Tablet
Mobile
Reduced motion
Header
Hero
Cards
Events
Announcements
Staff
Footer
Report UI
```

Most importantly:

## Verify that Christmas is NOT active in production.

---

## 26. CHANGE.md

Update the root-level:

```text
CHANGE.md
```

Document only changes actually made.

Include:

- date
- files changed
- new files
- theme architecture changes
- seasonal configuration changes
- assets added
- CSS changes
- components changed
- dependencies added, if any
- tests run
- test results
- manual checks
- known issues
- anything intentionally NOT changed

Do not claim a test passed if it was not actually run.

---

## 27. FINAL ACCEPTANCE CHECKLIST

- [ ] Christmas theme architecture exists.
- [ ] Christmas is NOT active in production.
- [ ] Halloween remains functional.
- [ ] Normal/no-season mode remains functional.
- [ ] Christmas can be safely previewed/tested.
- [ ] Existing UGN UI structure remains intact.
- [ ] No unnecessary redesign occurred.
- [ ] No report backend changes occurred.
- [ ] Report system still works.
- [ ] Discord webhook still works.
- [ ] Staff permissions remain intact.
- [ ] Existing events still work.
- [ ] Existing announcements still work.
- [ ] Navigation still works.
- [ ] Footer links still work.
- [ ] Mobile layout works.
- [ ] Tablet layout works.
- [ ] Desktop layout works.
- [ ] Reduced-motion behaviour works.
- [ ] No unnecessary dependencies were introduced.
- [ ] No destructive database changes occurred.
- [ ] Build passes.
- [ ] Typecheck passes.
- [ ] Lint passes where applicable.
- [ ] Relevant tests pass.
- [ ] CHANGE.md is updated honestly.

---

# FINAL INSTRUCTION TO KILO

This is a **PREPARATION** task.

Do not activate Christmas.

Do not break Halloween.

Do not break the report system.

Do not redesign UGN.

Build a safe, reusable seasonal architecture so Christmas 2026 can later be enabled with a controlled configuration change instead of another large website modification.

If you discover that an existing implementation would need to be changed in a risky way to accomplish something, STOP and document the issue in `CHANGE.md` rather than making an unsafe refactor.

**Safety and preservation of the existing UGN website take priority over adding Christmas effects.**
