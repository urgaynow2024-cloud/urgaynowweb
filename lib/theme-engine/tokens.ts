/**
 * UGN Theme Engine — the design token contract.
 *
 * This module is the SINGLE SOURCE OF TRUTH for the website's visual UI.
 *
 * How the engine works:
 *   A theme is nothing but a partial token object. `resolveTheme()` in
 *   `./resolve.ts` merges it over `DEFAULT_TOKENS`, so any token a theme does
 *   not define is inherited from the Default UGN design system. That is the
 *   literal implementation of "themes inherit from Default when an override is
 *   not provided".
 *
 *   The merged tokens are emitted as CSS custom properties by `./css.ts` and
 *   rendered onto `<html>` by the server. The stylesheet contains exactly ONE
 *   implementation of every component, written entirely against these tokens.
 *   There is no per-theme component CSS and no seasonal overlay.
 *
 * Why RGB triplets ("R G B" and not "#rrggbb"): Tailwind's colour scales are
 * defined as `rgb(var(--brand-500-rgb) / <alpha-value>)`, which lets a single
 * colour be reused at any opacity. Every scale token is therefore a triplet.
 * The freeform CSS tokens (gradients, shadows, borders) are stored verbatim as
 * CSS strings because they compose several colours at once.
 */

export const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export const SURFACE_STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export const INK_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type BrandStep = (typeof BRAND_STEPS)[number];
export type SurfaceStep = (typeof SURFACE_STEPS)[number];
export type InkStep = (typeof INK_STEPS)[number];

/** A colour as a space-separated RGB triplet, e.g. `"117 7 135"`. */
export type Rgb = string;

export type Scale<S extends number> = Record<S, Rgb>;

/**
 * The freeform, CSS-ready half of the contract. These are the properties the
 * MMD requires a theme to be able to control that cannot be expressed as a
 * single colour: gradients, shadows, borders, backgrounds, focus rings and
 * decorative effects.
 *
 * Every field is a complete CSS value, so a theme override is a one-liner and
 * the base stylesheet stays a single implementation.
 */
export interface ThemeVisual {
  /** `color-scheme`. Decides whether the browser renders native controls dark. */
  scheme: "light" | "dark";

  /** Page canvas: `background-color` plus an optional `background-image`. */
  canvas: {
    background: string;
    backgroundImage: string;
    /** `fixed` for the night themes so the gradient does not scroll away. */
    attachment: "scroll" | "fixed";
    color: string;
  };

  /** Body ::before / ::after atmosphere layers (starfield, mist, aurora). */
  atmosphere: {
    before: string;
    after: string;
  };

  /** Cards, the single most-reused surface on the site. */
  card: {
    background: string;
    backgroundHover: string;
    border: string;
    borderHover: string;
    shadow: string;
    shadowHover: string;
  };

  /** Anything that renders as a light panel on a night canvas (`bg-white`). */
  surfaceLift: {
    background: string;
  };

  buttons: {
    primaryImage: string;
    primaryColor: string;
    primaryShadow: string;
    primaryShadowHover: string;
    ctaImage: string;
    ctaColor: string;
    ctaShadow: string;
    ctaShadowHover: string;
    secondaryBackground: string;
    secondaryBorder: string;
    secondaryColor: string;
    secondaryHoverBackground: string;
    secondaryHoverBorder: string;
    secondaryHoverShadow: string;
    ghostHoverBackground: string;
    ghostHoverColor: string;
  };

  badges: {
    brandBackground: string;
    brandBorder: string;
    brandColor: string;
  };

  /** Focus ring, used by every interactive element. */
  focus: {
    ringColor: string;
    ringOffset: string;
  };

  /** Modals and dialogs (including the report modal). */
  dialog: {
    background: string;
    backgroundImage: string;
    border: string;
    shadow: string;
  };

  /** Dividers, `hr`, and section rules. */
  divider: {
    border: string;
    accent: string;
  };

  /** Header and footer chrome. */
  chrome: {
    headerBackground: string;
    headerBorder: string;
    footerBackground: string;
    footerBorder: string;
  };

  /** The hero band. `overlay` paints behind the hero content. */
  hero: {
    overlay: string;
    titleShadow: string;
    gradientText: string;
    decoration: string;
  };

  /** Text selection highlight. */
  selection: {
    background: string;
    color: string;
  };

  /** Seasonal scrollbar tint. */
  scrollbar: {
    thumb: string;
  };

  /**
   * Component-level tokens.
   *
   * The global tokens above cover the shared primitives (canvas, card, buttons,
   * badges, dialogs, dividers, hero). These cover the *specific* homepage and
   * card treatments that the legacy per-theme CSS handled by re-declaring
   * shadows per theme — the live-event pill, the stat card, the feature and
   * staff card corners, gallery tiles, section washes and the seasonal banner
   * and strip.
   *
   * Every field is a complete CSS value. `none` is a valid value and is what the
   * Default theme uses, which is why the Default theme inherits no seasonal
   * treatment at all.
   */
  components: {
    /** Featured card treatment (`.card-treat`): border, shadow, top hairline. */
    cardTreat: {
      border: string;
      shadow: string;
      hairline: string;
    };
    /** The "Live Now" pill above the events list. */
    livePill: {
      backgroundImage: string;
      border: string;
      shadow: string;
      sheenImage: string;
      labelShadow: string;
    };
    /** Community highlight stat cards. */
    stat: {
      valueShadow: string;
      glow: string;
    };
    eventCard: {
      backgroundImage: string;
    };
    featureCard: {
      iconShadow: string;
      iconHoverShadow: string;
    };
    staffCard: {
      hoverBorder: string;
      hoverShadow: string;
    };
    galleryTile: {
      shadow: string;
    };
    /** Soft top-edge wash on every major section band. */
    section: {
      wash: string;
      washHeight: string;
      washOpacity: string;
      motifOpacity: string;
      motifSize: string;
    };
    /** Seasonal banner above the header. */
    banner: {
      background: string;
      border: string;
      shadow: string;
      color: string;
      accent: string;
    };
    /** Seasonal strip inside the hero. */
    strip: {
      background: string;
      border: string;
      color: string;
      shadow: string;
    };
    /** Form control focus treatment. */
    inputFocus: {
      border: string;
      ring: string;
    };
  };
}

export interface ThemeTokens {
  brand: Scale<BrandStep>;
  /**
   * The un-stepped brand colour (`brand.DEFAULT` in Tailwind, `--brand-rgb`).
   *
   * This is a separate slot from `brand[700]` on purpose: in the legacy
   * Halloween palette they genuinely differ (`109 40 217` vs `112 44 222`), and
   * aliasing one to the other silently changed the CTA colour.
   */
  brandDefault: Rgb;
  surface: Scale<SurfaceStep>;
  ink: Scale<InkStep>;
  visual: ThemeVisual;
  /** Accent colours a theme can expose to decoration layers and content. */
  accents: {
    /** Headline seasonal colour, e.g. Halloween orange / Christmas gold. */
    primary: string;
    /** Supporting seasonal colour, e.g. Christmas red / Pride red. */
    secondary: string;
    /** Tertiary accent used by particles and lights. */
    tertiary: string;
    /** Readable text colour for content drawn directly on the canvas. */
    onCanvas: string;
  };
  /** Font stack for this theme. Omitted themes inherit the UGN stack. */
  fontSans?: string;
}

/**
 * The Default UGN design system.
 *
 * Every value here is copied verbatim from the `:root` block that has shipped
 * in `app/globals.css` since the site launched, so `default` is guaranteed to
 * render pixel-identically to the pre-engine UGN site. This is the base that
 * every other theme inherits from.
 */
export const DEFAULT_TOKENS: ThemeTokens = {
  brand: {
    50: "250 245 251",
    100: "243 232 245",
    200: "232 208 236",
    300: "214 171 224",
    400: "189 127 206",
    500: "162 86 187",
    600: "138 58 163",
    700: "117 7 135",
    800: "97 31 110",
    900: "81 26 92",
    950: "45 10 50",
  },
  brandDefault: "117 7 135",
  surface: {
    0: "255 255 255",
    50: "248 247 250",
    100: "240 238 244",
    200: "228 224 234",
    300: "205 199 214",
    400: "168 160 181",
    500: "138 127 155",
    600: "110 98 128",
    700: "82 71 99",
    800: "54 44 70",
    900: "26 21 40",
    950: "15 11 22",
  },
  ink: {
    50: "247 248 250",
    100: "238 240 244",
    200: "226 229 236",
    300: "205 210 221",
    400: "154 162 180",
    500: "107 115 132",
    600: "77 84 103",
    700: "56 61 77",
    800: "35 38 47",
    900: "21 23 29",
    950: "12 13 18",
  },
  visual: {
    scheme: "light",
    canvas: {
      background: "#ffffff",
      // The subtle UGN brand wash that has always been on the page background.
      attachment: "scroll",
      backgroundImage: `radial-gradient(60rem 60rem at 110% -10%, rgba(189, 127, 206, 0.04) 0%, transparent 60%),
        radial-gradient(50rem 50rem at -10% 110%, rgba(117, 7, 135, 0.03) 0%, transparent 55%)`,
      color: "rgb(var(--ink-800-rgb))",
    },
    atmosphere: { before: "none", after: "none" },
    card: {
      background: "#ffffff",
      backgroundHover: "#fafafa",
      border: "rgb(var(--surface-200-rgb))",
      borderHover: "rgb(var(--brand-300-rgb))",
      shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      shadowHover: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
    surfaceLift: { background: "#ffffff" },
    buttons: {
      primaryImage: "linear-gradient(135deg, rgb(var(--brand-600-rgb)) 0%, rgb(var(--brand-700-rgb)) 100%)",
      primaryColor: "#ffffff",
      primaryShadow: "0 10px 15px -3px rgb(var(--brand-500-rgb) / 0.3)",
      primaryShadowHover: "0 20px 25px -5px rgb(var(--brand-500-rgb) / 0.4)",
      ctaImage: "linear-gradient(135deg, rgb(var(--brand-500-rgb)) 0%, rgb(var(--brand-700-rgb)) 100%)",
      ctaColor: "#ffffff",
      ctaShadow: "0 10px 15px -3px rgb(var(--brand-500-rgb) / 0.4)",
      ctaShadowHover: "0 20px 25px -5px rgb(var(--brand-500-rgb) / 0.5)",
      secondaryBackground: "#ffffff",
      secondaryBorder: "rgb(var(--surface-300-rgb))",
      secondaryColor: "rgb(var(--ink-700-rgb))",
      secondaryHoverBackground: "rgb(var(--brand-50-rgb))",
      secondaryHoverBorder: "rgb(var(--brand-300-rgb))",
      secondaryHoverShadow: "none",
      ghostHoverBackground: "rgb(var(--brand-50-rgb))",
      ghostHoverColor: "rgb(var(--brand-700-rgb))",
    },
    badges: {
      brandBackground: "rgb(var(--brand-100-rgb))",
      brandBorder: "rgb(var(--brand-200-rgb))",
      brandColor: "rgb(var(--brand-800-rgb))",
    },
    focus: {
      ringColor: "rgb(var(--brand-500-rgb) / 0.9)",
      ringOffset: "#ffffff",
    },
    dialog: {
      background: "#ffffff",
      backgroundImage: "none",
      border: "rgb(var(--surface-200-rgb))",
      shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
    },
    divider: {
      border: "rgb(var(--surface-200-rgb))",
      accent: "none",
    },
    chrome: {
      headerBackground: "rgb(255 255 255 / 0.8)",
      headerBorder: "rgb(var(--surface-200-rgb))",
      footerBackground: "rgb(var(--surface-50-rgb))",
      footerBorder: "rgb(var(--surface-200-rgb))",
    },
    hero: {
      overlay: "none",
      titleShadow: "none",
      gradientText: "linear-gradient(135deg, rgb(var(--brand-500-rgb)) 0%, rgb(var(--brand-700-rgb)) 100%)",
      decoration: "none",
    },
    selection: {
      background: "rgb(var(--brand-200-rgb) / 0.5)",
      color: "inherit",
    },
    scrollbar: { thumb: "rgb(var(--surface-300-rgb))" },
    components: {
      cardTreat: {
        border: "rgb(var(--surface-200-rgb))",
        shadow: "0 10px 30px -18px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(var(--brand-700-rgb) / 0.08)",
        hairline: "none",
      },
      livePill: {
        backgroundImage: "none",
        border: "transparent",
        shadow: "none",
        sheenImage: "none",
        labelShadow: "none",
      },
      stat: { valueShadow: "none", glow: "none" },
      eventCard: { backgroundImage: "none" },
      featureCard: { iconShadow: "none", iconHoverShadow: "none" },
      staffCard: { hoverBorder: "rgb(var(--brand-200-rgb))", hoverShadow: "none" },
      galleryTile: { shadow: "0 10px 30px -18px rgb(0 0 0 / 0.1)" },
      section: {
        wash: "none",
        washHeight: "22rem",
        washOpacity: "0.9",
        motifOpacity: "0.08",
        motifSize: "11rem",
      },
      banner: {
        background: "rgb(var(--brand-700-rgb))",
        border: "rgb(var(--brand-200-rgb))",
        shadow: "none",
        color: "#ffffff",
        accent: "rgb(var(--brand-200-rgb))",
      },
      strip: {
        background: "rgb(var(--brand-50-rgb))",
        border: "rgb(var(--brand-200-rgb))",
        color: "rgb(var(--brand-800-rgb))",
        shadow: "none",
      },
      inputFocus: {
        border: "rgb(var(--brand-400-rgb))",
        ring: "rgb(var(--brand-500-rgb) / 0.15)",
      },
    },
  },
  accents: {
    primary: "rgb(var(--brand-500-rgb))",
    secondary: "rgb(var(--brand-300-rgb))",
    tertiary: "rgb(var(--brand-200-rgb))",
    onCanvas: "rgb(var(--ink-800-rgb))",
  },
};
