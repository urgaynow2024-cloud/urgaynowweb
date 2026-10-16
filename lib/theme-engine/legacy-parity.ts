/**
 * Legacy parity ledger.
 *
 * Every value-bearing rule in the legacy per-theme CSS is listed here, mapped to
 * the theme token that replaces it, and classified.
 *
 * This file is the migration's safety net. `scripts/verify-theme-engine.ts`
 * parses the legacy rules straight out of `app/globals.css` and asserts that
 * each one still produces the *identical* value from the theme engine. That
 * turns "Halloween must not change" from a visual hope into a machine-checked
 * guarantee, and it is why the legacy CSS can be deleted later without anyone
 * having to eyeball 1642 lines.
 *
 * Halloween 2026 is the reference theme. Christmas is listed too because it
 * shares every rule shape; the other nine themes have no legacy CSS to preserve.
 */

export type RuleCategory =
  /** A value consumed by the global token layer (scales, canvas, dividers). */
  | "global-token"
  /** A value that needs a component-scoped token. */
  | "component-token"
  /** Layout/structure that becomes one shared semantic class. */
  | "component-structure"
  /** Hand-drawn seasonal art: motifs, webs, snowbanks, particles. */
  | "decorative-asset"
  /** Keyframes and transitions. */
  | "animation-effect"
  /** Dead, duplicated, or superseded. Nothing depends on it. */
  | "obsolete-duplicate";

export interface ParityEntry {
  /**
   * The legacy selector, exactly as written in `app/globals.css`. Multi-selector
   * rules are joined with ", " and matched against the first selector.
   */
  legacySelector: string;
  /** The CSS property in that rule. */
  property: string;
  /** Dotted path into the resolved `ThemeVisual`, e.g. `card.border`. */
  token: string;
  category: RuleCategory;
  /** Which theme's resolved tokens this entry is checked against. */
  theme?: string;
  /** Human note for the migration. */
  note: string;
}

/**
 * The parity set. `null` in the token path means the rule is intentionally not
 * carried into a token (structure / decoration / animation), which the test
 * asserts is true rather than skipping silently.
 */
export const PARITY_LEDGER: ParityEntry[] = [
  // ---- Canvas & atmosphere -------------------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] body',
    property: "background-color",
    token: "canvas.background",
    category: "global-token",
    note: "Page background.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] body',
    property: "background-image",
    token: "canvas.backgroundImage",
    category: "global-token",
    note: "Five-layer night gradient, whitespace-normalised.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] body::before',
    property: "background-image",
    token: "atmosphere.before",
    category: "decorative-asset",
    note: "Starfield. Twinkle animation becomes effect config.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] body::after',
    property: "background-image",
    token: "atmosphere.after",
    category: "decorative-asset",
    note: "Ground mist. Drift animation becomes effect config.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] ::selection',
    property: "background-color",
    token: "selection.background",
    category: "global-token",
    note: "Text selection highlight.",
  },

  // ---- Hero ----------------------------------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-hero .text-gradient',
    property: "background-image",
    token: "hero.gradientText",
    category: "global-token",
    note: "Pumpkin gradient heading.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-hero h1',
    property: "text-shadow",
    token: "hero.titleShadow",
    category: "global-token",
    note: "Heading glow.",
  },

  // ---- Cards ---------------------------------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] .card, :root[data-site-theme="halloween"] .card-premium',
    property: "background-color",
    token: "card.background",
    category: "global-token",
    note: "Generic card night surface (was rgb(var(--hw-card))).",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .card, :root[data-site-theme="halloween"] .card-premium',
    property: "border-color",
    token: "card.border",
    category: "global-token",
    note: "Card border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .card, :root[data-site-theme="halloween"] .card-premium',
    property: "box-shadow",
    token: "card.shadow",
    category: "global-token",
    note: "Card shadow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .card-premium:hover, :root[data-site-theme="halloween"] .card-hover:hover',
    property: "border-color",
    token: "card.borderHover",
    category: "global-token",
    note: "Card hover border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .card-premium:hover, :root[data-site-theme="halloween"] .card-hover:hover',
    property: "box-shadow",
    token: "card.shadowHover",
    category: "global-token",
    note: "Card hover shadow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .bg-white',
    property: "background-color",
    token: "surfaceLift.background",
    category: "global-token",
    note: "Tailwind bg-white literals become night cards.",
  },
  {
    legacySelector: ".hw-card-treat",
    property: "border-color",
    token: "components.cardTreat.border",
    category: "component-token",
    note: "Featured card edge.",
  },
  {
    legacySelector: ".hw-card-treat",
    property: "box-shadow",
    token: "components.cardTreat.shadow",
    category: "component-token",
    note: "Featured card shadow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-gallery-tile',
    property: "box-shadow",
    token: "components.galleryTile.shadow",
    category: "component-token",
    note: "Gallery tile edge.",
  },

  // ---- Buttons -------------------------------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-primary',
    property: "background-image",
    token: "buttons.primaryImage",
    category: "global-token",
    note: "Primary CTA gradient.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-primary',
    property: "box-shadow",
    token: "buttons.primaryShadow",
    category: "global-token",
    note: "Primary button glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-primary:hover',
    property: "box-shadow",
    token: "buttons.primaryShadowHover",
    category: "global-token",
    note: "Primary button hover glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-cta',
    property: "background-image",
    token: "buttons.ctaImage",
    category: "global-token",
    note: "Hero CTA gradient.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-cta',
    property: "box-shadow",
    token: "buttons.ctaShadow",
    category: "global-token",
    note: "Hero CTA glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-cta:hover',
    property: "box-shadow",
    token: "buttons.ctaShadowHover",
    category: "global-token",
    note: "Hero CTA hover glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary, :root[data-site-theme="halloween"] .btn-outline',
    property: "background-color",
    token: "buttons.secondaryBackground",
    category: "global-token",
    note: "Secondary button fill.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary, :root[data-site-theme="halloween"] .btn-outline',
    property: "border-color",
    token: "buttons.secondaryBorder",
    category: "global-token",
    note: "Secondary button border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary, :root[data-site-theme="halloween"] .btn-outline',
    property: "color",
    token: "buttons.secondaryColor",
    category: "global-token",
    note: "Secondary button text.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary:hover, :root[data-site-theme="halloween"] .btn-outline:hover',
    property: "background-color",
    token: "buttons.secondaryHoverBackground",
    category: "global-token",
    note: "Secondary button hover fill.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary:hover, :root[data-site-theme="halloween"] .btn-outline:hover',
    property: "border-color",
    token: "buttons.secondaryHoverBorder",
    category: "global-token",
    note: "Secondary button hover border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-secondary:hover, :root[data-site-theme="halloween"] .btn-outline:hover',
    property: "box-shadow",
    token: "buttons.secondaryHoverShadow",
    category: "global-token",
    note: "Secondary button hover glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-ghost:hover',
    property: "background-color",
    token: "buttons.ghostHoverBackground",
    category: "global-token",
    note: "Ghost button hover fill.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .btn-ghost:hover',
    property: "color",
    token: "buttons.ghostHoverColor",
    category: "global-token",
    note: "Ghost button hover text.",
  },

  // ---- Badges, inputs, dialogs, focus ------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] .badge-brand',
    property: "background-color",
    token: "badges.brandBackground",
    category: "global-token",
    note: "Brand badge fill.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .badge-brand',
    property: "border-color",
    token: "badges.brandBorder",
    category: "global-token",
    note: "Brand badge border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .badge-brand',
    property: "color",
    token: "badges.brandColor",
    category: "global-token",
    note: "Brand badge text.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .input:focus, :root[data-site-theme="halloween"] select:focus, :root[data-site-theme="halloween"] textarea:focus',
    property: "border-color",
    token: "components.inputFocus.border",
    category: "component-token",
    note: "Form focus border.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .input:focus, :root[data-site-theme="halloween"] select:focus, :root[data-site-theme="halloween"] textarea:focus',
    property: "box-shadow",
    token: "components.inputFocus.ring",
    category: "component-token",
    note: "Form focus ring.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] [role="dialog"], :root[data-site-theme="halloween"] .modal-panel',
    property: "background-color",
    token: "dialog.background",
    category: "global-token",
    note: "Modal surface — includes the report modal. Presentation only.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] [role="dialog"], :root[data-site-theme="halloween"] .modal-panel',
    property: "border",
    token: "dialog.border",
    category: "global-token",
    note: "Modal border. Legacy is the `border` shorthand; the token holds the colour and the stylesheet owns the width/style. NOTE: covers the report modal — presentation only.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] [role="dialog"], :root[data-site-theme="halloween"] .modal-panel',
    property: "box-shadow",
    token: "dialog.shadow",
    category: "global-token",
    note: "Modal shadow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] [role="dialog"]',
    property: "background-image",
    token: "dialog.backgroundImage",
    category: "global-token",
    note: "Modal corner glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] *:focus-visible',
    property: "--tw-ring-color",
    token: "focus.ringColor",
    category: "global-token",
    note: "Accessible focus ring colour.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] *:focus-visible',
    property: "--tw-ring-offset-color",
    token: "focus.ringOffset",
    category: "global-token",
    note: "Focus ring offset.",
  },

  // ---- Dividers, chrome, scrollbar ----------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div[class*="border-t"], :root[data-site-theme="halloween"] main > div[class*="border-b"], :root[data-site-theme="halloween"] hr',
    property: "border-color",
    token: "divider.border",
    category: "global-token",
    note: "Section rules and hr.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div[class*="border-t"]::after',
    property: "background",
    token: "divider.accent",
    category: "global-token",
    note: "Section rule highlight.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .scrollbar-thin',
    property: "scrollbar-color",
    token: "scrollbar.thumb",
    category: "global-token",
    note: "Thin scrollbar tint (the token is the thumb; transparent is kept in CSS).",
  },

  // ---- Live pill, stat, event card ----------------------------------------
  {
    legacySelector: ".hw-live-pill",
    property: "background-image",
    token: "components.livePill.backgroundImage",
    category: "component-token",
    note: "Live Now banner gradient.",
  },
  {
    legacySelector: ".hw-live-pill",
    property: "border-color",
    token: "components.livePill.border",
    category: "component-token",
    note: "Live Now banner border.",
  },
  {
    legacySelector: ".hw-live-pill",
    property: "box-shadow",
    token: "components.livePill.shadow",
    category: "component-token",
    note: "Live Now banner glow.",
  },
  {
    legacySelector: ".hw-live-pill::after",
    property: "background",
    token: "components.livePill.sheenImage",
    category: "component-token",
    note: "Sheen sweep across the pill.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-live-pill span.uppercase',
    property: "text-shadow",
    token: "components.livePill.labelShadow",
    category: "component-token",
    note: "LIVE label glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-stat-card .text-4xl',
    property: "text-shadow",
    token: "components.stat.valueShadow",
    category: "component-token",
    note: "Community highlight number glow.",
  },
  {
    legacySelector: ".hw-stat-card::after",
    property: "background",
    token: "components.stat.glow",
    category: "component-token",
    note: "Stat card inner glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-event-card',
    property: "background-image",
    token: "components.eventCard.backgroundImage",
    category: "component-token",
    note: "Event card inner gradient.",
  },

  // ---- Section band wash --------------------------------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div::before',
    property: "background",
    token: "components.section.wash",
    category: "component-token",
    note: "Top-edge wash on every homepage band.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div::before',
    property: "height",
    token: "components.section.washHeight",
    category: "component-token",
    note: "Wash height.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div::before',
    property: "opacity",
    token: "components.section.washOpacity",
    category: "component-token",
    note: "Wash opacity.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div:nth-of-type(even)::after',
    property: "opacity",
    token: "components.section.motifOpacity",
    category: "decorative-asset",
    note: "Corner motif opacity.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div:nth-of-type(even)::after',
    property: "width",
    token: "components.section.motifSize",
    category: "decorative-asset",
    note: "Corner motif size.",
  },

  // ---- Rules deliberately NOT carried into a token -------------------------
  {
    legacySelector: ':root[data-site-theme="halloween"]',
    property: "--brand-500-rgb",
    token: null as unknown as string,
    category: "global-token",
    note: "The whole palette block: 34 scale triplets. These are now the theme's brand/surface/ink scales and are verified triplet-by-triplet by the dedicated scale-parity check, not by this ledger row.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"]',
    property: "--brand-500-rgb",
    token: null as unknown as string,
    category: "global-token",
    note: "Christmas palette block, same shape; covered by the scale-parity check.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"].dark',
    property: "--theme-textMuted",
    token: null as unknown as string,
    category: "obsolete-duplicate",
    note: "Legacy `.dark` override of the old --theme-* variables. Those variables are 11/13 unread; the replacement is the single token set, which is scheme-aware already.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"].dark',
    property: "--theme-textMuted",
    token: null as unknown as string,
    category: "obsolete-duplicate",
    note: "As above, for Christmas.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-card-treat",
    property: "border-color",
    token: "components.cardTreat.border",
    category: "component-token",
    theme: "christmas",
    note: "Christmas featured card edge. Mirror of `.hw-card-treat`.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-card-treat:hover",
    property: "box-shadow",
    token: null as unknown as string,
    category: "component-structure",
    note: "Hover treatment is emitted by the shared card layer; no separate token.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-staff-card",
    property: "border-color",
    token: "card.border",
    category: "global-token",
    theme: "christmas",
    note: "Staff card uses the shared card border token.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-staff-card::after",
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Snowflake corner motif. Decoration config.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-feature-card::after",
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Snowflake corner motif on feature cards. Decoration config.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-feature-card .rounded-2xl",
    property: "box-shadow",
    token: "components.featureCard.iconShadow",
    category: "component-token",
    theme: "christmas",
    note: "Feature icon shadow.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-event-card:hover",
    property: "border-color",
    token: "card.borderHover",
    category: "global-token",
    theme: "christmas",
    note: "Event card hover uses the shared card hover border.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-live-pill",
    property: "background-image",
    token: "components.livePill.backgroundImage",
    category: "component-token",
    theme: "christmas",
    note: "Christmas Live Now gradient.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-feature-card:hover .rounded-2xl",
    property: "box-shadow",
    token: "components.featureCard.iconHoverShadow",
    category: "component-token",
    theme: "christmas",
    note: "Feature icon hover shadow.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-staff-card:hover",
    property: "border-color",
    token: "components.staffCard.hoverBorder",
    category: "component-token",
    theme: "christmas",
    note: "Staff card hover border.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-staff-card:hover::after",
    property: "opacity",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Hover state of the corner motif. Decoration config.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-feature-card:hover::after",
    property: "opacity",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Hover state of the corner motif. Decoration config.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-live-pill::after",
    property: "background",
    token: "components.livePill.sheenImage",
    category: "component-token",
    theme: "christmas",
    note: "Christmas sheen sweep.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-stat-card",
    property: "position",
    token: null as unknown as string,
    category: "component-structure",
    note: "Establishes the glow layer's containing block. Part of `.ugc-stat-card`.",
  },
  {
    legacySelector: ":root[data-site-theme=\"christmas\"] .cw-stat-card::after",
    property: "background",
    token: "components.stat.glow",
    category: "component-token",
    theme: "christmas",
    note: "Christmas stat glow.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-hero::before',
    property: "content",
    token: null as unknown as string,
    category: "obsolete-duplicate",
    note: "Cancels the generic section wash on the hero. The new hero class simply omits the wash; no token needed.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] .hw-hero::after',
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Hero glow orb. Becomes decoration config, not a component token.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div',
    property: "position",
    token: null as unknown as string,
    category: "component-structure",
    note: "Establishes the containing block for the section wash. Becomes part of the shared `.ugc-section-band` class.",
  },
  {
    legacySelector: ':root[data-site-theme="halloween"] main > div:nth-of-type(even)::after',
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Corner motif SVG. Becomes a decoration asset, chosen by theme config.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-hero',
    property: "position",
    token: null as unknown as string,
    category: "component-structure",
    note: "Same shared hero class as `.hw-hero`; one implementation.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-hero::before',
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Christmas hero aurora. Decoration config.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-hero::after',
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Christmas hero glow orb. Decoration config.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-hero .text-gradient',
    property: "background-image",
    token: "hero.gradientText",
    category: "global-token",
    theme: "christmas",
    note: "Christmas heading gradient (value-checked in the Christmas parity pass).",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-hero h1',
    property: "text-shadow",
    token: "hero.titleShadow",
    category: "global-token",
    theme: "christmas",
    note: "Christmas heading glow.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] body',
    property: "background-color",
    token: "canvas.background",
    category: "global-token",
    theme: "christmas",
    note: "Christmas canvas.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-card-treat::before',
    property: "background",
    token: "components.cardTreat.hairline",
    category: "component-token",
    theme: "christmas",
    note: "Christmas card hairline.",
  },
  {
    legacySelector: ':root[data-site-theme="christmas"] .cw-feature-card::after',
    property: "background-image",
    token: null as unknown as string,
    category: "decorative-asset",
    note: "Corner motif on feature/staff cards. Decoration config.",
  },
  {
    legacySelector: '.hw-hero, .cw-hero',
    property: "position",
    token: null as unknown as string,
    category: "component-structure",
    note: "Becomes one shared `.ugc-hero` class.",
  },
  {
    legacySelector: ".hw-card-treat::before",
    property: "content",
    token: null as unknown as string,
    category: "component-structure",
    note: "Hairline pseudo-element becomes part of `.ugc-card-treat`; its colour is `cardTreat.hairline`.",
  },
];

/** Rules in the ledger that must keep producing an identical value. */
export function parityValueEntries(): ParityEntry[] {
  return PARITY_LEDGER.filter((entry) => typeof entry.token === "string" && entry.token.length > 0);
}

/** Rules the ledger documents as intentionally not tokenised. */
export function parityNonValueEntries(): ParityEntry[] {
  return PARITY_LEDGER.filter((entry) => !(typeof entry.token === "string" && entry.token.length > 0));
}
