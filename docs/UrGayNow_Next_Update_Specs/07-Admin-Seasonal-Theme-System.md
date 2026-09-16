# Admin-Controlled Seasonal Theme System

## Goal
Let staff change the site's seasonal visual theme directly from Admin without editing source code.

## Supported themes
The initial theme registry must include:
- Default
- Christmas
- Halloween
- Valentine's
- April Fools
- Easter
- Summer
- Autumn
- Spring

The registry should be extensible so more themes can be added later.

## Admin controls
Create `Admin > Settings > Appearance` or `Admin > Theme` with:

### Theme selector
Show every theme as a visual preview card containing:
- name
- small preview
- accent palette
- seasonal icon/illustration
- `Active` state

### Activation mode
Support:
- Manual
- Automatic by date

### Automatic scheduling
Each theme can optionally have:
- start date/time
- end date/time
- enabled toggle

The active theme is selected using the configured schedule. If multiple schedules overlap, use an explicit priority/order rather than relying on object order.

### Preview
Admin can preview a theme without activating it publicly.

Preview should be session/client scoped and must not change the public theme.

## Technical implementation
Create a theme registry in code containing design tokens, not full page-specific CSS.

Use a root attribute such as:
`data-site-theme="halloween"`

CSS variables control:
- brand/accent
- accent-soft
- background
- surface
- border
- text
- decorative glow
- seasonal pattern/illustration where applicable

The existing light/dark theme remains separate from the seasonal theme.

Example conceptual state:
- colour mode: `dark`
- seasonal theme: `halloween`

These are two different settings.

## Storage
Store the selected theme and schedule in `Setting` or a dedicated `SiteTheme` model.

If using `Setting`, use stable keys such as:
- `siteThemeMode`
- `siteThemeManual`
- `siteThemeSchedule`

Prefer a structured model if schedules become complex.

## Seasonal visual direction
### Christmas
Snowy/frosted details, warm festive accents, subtle stars/lights.

### Halloween
Dark purple/black base, orange accent, spooky decorative details, subtle glow.

### Valentine's
Pink/red/purple accents, hearts used sparingly, soft romantic details.

### April Fools
Playful temporary decorations, intentionally silly microcopy/decorations, but preserve usability and accessibility.

### Easter
Pastel accents, spring motifs, soft decorative shapes.

### Summer
Bright warm accents, sunny decorative elements, lighter visual energy.

### Autumn
Warm earthy accents, leaves/falling shapes used subtly.

### Spring
Fresh pastel/green accents, light floral/nature details.

## Safety/accessibility
- Seasonal decoration must never block controls.
- Do not rely on colour alone for status.
- Respect `prefers-reduced-motion`.
- Provide a reduced-decoration option if animated effects are introduced.
- Do not create flashing effects.

## Cache/revalidation
Changing the active theme in Admin must invalidate the public layout/theme configuration. Do not require a rebuild for a normal theme switch.

## Acceptance tests
1. Founder/Admin can switch themes from Admin.
2. Public site updates without source-code edits.
3. Manual theme overrides automatic schedule.
4. Automatic schedule activates the expected theme.
5. Ended theme falls back to Default or the next scheduled theme.
6. Light/dark mode continues to work independently.
7. Mobile remains usable.
8. Reduced-motion users do not receive disruptive animations.
