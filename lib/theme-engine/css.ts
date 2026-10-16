import { BRAND_STEPS, INK_STEPS, SURFACE_STEPS, type ThemeTokens } from "./tokens";

/**
 * Serialises resolved tokens into CSS custom properties.
 *
 * Everything the stylesheet needs comes from here, which is what allows the
 * stylesheet to contain exactly one implementation of every component: the
 * custom properties change, the rules do not.
 */
export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const step of BRAND_STEPS) vars[`--brand-${step}-rgb`] = tokens.brand[step];
  for (const step of SURFACE_STEPS) vars[`--surface-${step}-rgb`] = tokens.surface[step];
  for (const step of INK_STEPS) vars[`--ink-${step}-rgb`] = tokens.ink[step];

  // `brand.DEFAULT` is the un-stepped brand colour and is its own slot.
  vars["--brand-rgb"] = tokens.brandDefault;

  const v = tokens.visual;

  vars["--theme-scheme"] = v.scheme;
  vars["--theme-canvas-bg"] = v.canvas.background;
  vars["--theme-canvas-image"] = v.canvas.backgroundImage;
  vars["--theme-canvas-attachment"] = v.canvas.attachment;
  vars["--theme-canvas-color"] = v.canvas.color;

  vars["--theme-atmosphere-before"] = v.atmosphere.before;
  vars["--theme-atmosphere-after"] = v.atmosphere.after;

  vars["--theme-card-bg"] = v.card.background;
  vars["--theme-card-bg-hover"] = v.card.backgroundHover;
  vars["--theme-card-border"] = v.card.border;
  vars["--theme-card-border-hover"] = v.card.borderHover;
  vars["--theme-card-shadow"] = v.card.shadow;
  vars["--theme-card-shadow-hover"] = v.card.shadowHover;

  vars["--theme-surface-lift"] = v.surfaceLift.background;

  vars["--theme-btn-primary-image"] = v.buttons.primaryImage;
  vars["--theme-btn-primary-color"] = v.buttons.primaryColor;
  vars["--theme-btn-primary-shadow"] = v.buttons.primaryShadow;
  vars["--theme-btn-primary-shadow-hover"] = v.buttons.primaryShadowHover;
  vars["--theme-btn-cta-image"] = v.buttons.ctaImage;
  vars["--theme-btn-cta-color"] = v.buttons.ctaColor;
  vars["--theme-btn-cta-shadow"] = v.buttons.ctaShadow;
  vars["--theme-btn-cta-shadow-hover"] = v.buttons.ctaShadowHover;
  vars["--theme-btn-secondary-bg"] = v.buttons.secondaryBackground;
  vars["--theme-btn-secondary-border"] = v.buttons.secondaryBorder;
  vars["--theme-btn-secondary-color"] = v.buttons.secondaryColor;
  vars["--theme-btn-secondary-hover-bg"] = v.buttons.secondaryHoverBackground;
  vars["--theme-btn-secondary-hover-border"] = v.buttons.secondaryHoverBorder;
  vars["--theme-btn-secondary-hover-shadow"] = v.buttons.secondaryHoverShadow;
  vars["--theme-btn-ghost-hover-bg"] = v.buttons.ghostHoverBackground;
  vars["--theme-btn-ghost-hover-color"] = v.buttons.ghostHoverColor;

  vars["--theme-badge-brand-bg"] = v.badges.brandBackground;
  vars["--theme-badge-brand-border"] = v.badges.brandBorder;
  vars["--theme-badge-brand-color"] = v.badges.brandColor;

  vars["--theme-focus-ring"] = v.focus.ringColor;
  vars["--theme-focus-offset"] = v.focus.ringOffset;

  vars["--theme-dialog-bg"] = v.dialog.background;
  vars["--theme-dialog-image"] = v.dialog.backgroundImage;
  vars["--theme-dialog-border"] = v.dialog.border;
  vars["--theme-dialog-shadow"] = v.dialog.shadow;

  vars["--theme-divider"] = v.divider.border;
  vars["--theme-divider-accent"] = v.divider.accent;

  vars["--theme-header-bg"] = v.chrome.headerBackground;
  vars["--theme-header-border"] = v.chrome.headerBorder;
  vars["--theme-footer-bg"] = v.chrome.footerBackground;
  vars["--theme-footer-border"] = v.chrome.footerBorder;

  vars["--theme-hero-overlay"] = v.hero.overlay;
  vars["--theme-hero-title-shadow"] = v.hero.titleShadow;
  vars["--theme-hero-gradient-text"] = v.hero.gradientText;
  vars["--theme-hero-decoration"] = v.hero.decoration;

  vars["--theme-selection-bg"] = v.selection.background;
  vars["--theme-selection-color"] = v.selection.color;
  vars["--theme-scrollbar-thumb"] = v.scrollbar.thumb;

  const c = v.components;
  vars["--theme-card-treat-border"] = c.cardTreat.border;
  vars["--theme-card-treat-shadow"] = c.cardTreat.shadow;
  vars["--theme-card-treat-hairline"] = c.cardTreat.hairline;

  vars["--theme-live-pill-image"] = c.livePill.backgroundImage;
  vars["--theme-live-pill-border"] = c.livePill.border;
  vars["--theme-live-pill-shadow"] = c.livePill.shadow;
  vars["--theme-live-pill-sheen"] = c.livePill.sheenImage;
  vars["--theme-live-pill-label-shadow"] = c.livePill.labelShadow;

  vars["--theme-stat-value-shadow"] = c.stat.valueShadow;
  vars["--theme-stat-glow"] = c.stat.glow;

  vars["--theme-event-card-image"] = c.eventCard.backgroundImage;

  vars["--theme-feature-icon-shadow"] = c.featureCard.iconShadow;
  vars["--theme-feature-icon-hover-shadow"] = c.featureCard.iconHoverShadow;

  vars["--theme-staff-hover-border"] = c.staffCard.hoverBorder;
  vars["--theme-staff-hover-shadow"] = c.staffCard.hoverShadow;

  vars["--theme-gallery-tile-shadow"] = c.galleryTile.shadow;

  vars["--theme-section-wash"] = c.section.wash;
  vars["--theme-section-wash-height"] = c.section.washHeight;
  vars["--theme-section-wash-opacity"] = c.section.washOpacity;
  vars["--theme-section-motif-opacity"] = c.section.motifOpacity;
  vars["--theme-section-motif-size"] = c.section.motifSize;

  vars["--theme-banner-bg"] = c.banner.background;
  vars["--theme-banner-border"] = c.banner.border;
  vars["--theme-banner-shadow"] = c.banner.shadow;
  vars["--theme-banner-color"] = c.banner.color;
  vars["--theme-banner-accent"] = c.banner.accent;

  vars["--theme-strip-bg"] = c.strip.background;
  vars["--theme-strip-border"] = c.strip.border;
  vars["--theme-strip-color"] = c.strip.color;
  vars["--theme-strip-shadow"] = c.strip.shadow;

  vars["--theme-input-focus-border"] = c.inputFocus.border;
  vars["--theme-input-focus-ring"] = c.inputFocus.ring;

  vars["--theme-accent-primary"] = tokens.accents.primary;
  vars["--theme-accent-secondary"] = tokens.accents.secondary;
  vars["--theme-accent-tertiary"] = tokens.accents.tertiary;
  vars["--theme-accent-on-canvas"] = tokens.accents.onCanvas;

  if (tokens.fontSans) vars["--font-sans"] = tokens.fontSans;

  return vars;
}

/**
 * Renders the token set as an inline `<style>` body.
 *
 * Server-rendered into `<head>` so the active theme is correct on the very
 * first painted frame. No client-side token application, no flash, and no
 * dependency on JavaScript to see the right theme.
 */
export function tokensToCss(tokens: ThemeTokens, selector = ":root"): string {
  const vars = tokensToCssVars(tokens);
  const declarations = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}
