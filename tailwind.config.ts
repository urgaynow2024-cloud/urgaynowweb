import type { Config } from "tailwindcss";

const config: Config = {
  /*
     * Seasonal themes are night themes. Treating `[data-site-theme="halloween"]`
     * as a dark theme means the existing `dark:` variants - which every UGN
     * component already writes for night backgrounds - resolve to the UGN
     * Halloween palette in `app/globals.css`. Same markup, no component edits.
     */
  darkMode: [
    "variant",
    "&:where(.dark, .dark *, [data-site-theme='halloween'], [data-site-theme='halloween'] *)",
  ],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pride: {
          red: "#e40303",
          orange: "#ff8c00",
          yellow: "#ffed00",
          green: "#008026",
          blue: "#004dff",
          purple: "#750787",
        },
        /*
         * The UGN colour scales are driven by CSS variables that default to the
         * normal UGN palette. Seasonal themes (Halloween 2026) override those
         * variables in `app/globals.css` under
         * `:root[data-site-theme="halloween"]`, which re-themes every component
         * site-wide without touching a single component or layout.
         */
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          50: "rgb(var(--brand-50-rgb) / <alpha-value>)",
          100: "rgb(var(--brand-100-rgb) / <alpha-value>)",
          200: "rgb(var(--brand-200-rgb) / <alpha-value>)",
          300: "rgb(var(--brand-300-rgb) / <alpha-value>)",
          400: "rgb(var(--brand-400-rgb) / <alpha-value>)",
          500: "rgb(var(--brand-500-rgb) / <alpha-value>)",
          600: "rgb(var(--brand-600-rgb) / <alpha-value>)",
          700: "rgb(var(--brand-700-rgb) / <alpha-value>)",
          800: "rgb(var(--brand-800-rgb) / <alpha-value>)",
          900: "rgb(var(--brand-900-rgb) / <alpha-value>)",
          950: "rgb(var(--brand-950-rgb) / <alpha-value>)",
        },
        surface: {
          0: "rgb(var(--surface-0-rgb) / <alpha-value>)",
          50: "rgb(var(--surface-50-rgb) / <alpha-value>)",
          100: "rgb(var(--surface-100-rgb) / <alpha-value>)",
          200: "rgb(var(--surface-200-rgb) / <alpha-value>)",
          300: "rgb(var(--surface-300-rgb) / <alpha-value>)",
          400: "rgb(var(--surface-400-rgb) / <alpha-value>)",
          500: "rgb(var(--surface-500-rgb) / <alpha-value>)",
          600: "rgb(var(--surface-600-rgb) / <alpha-value>)",
          700: "rgb(var(--surface-700-rgb) / <alpha-value>)",
          800: "rgb(var(--surface-800-rgb) / <alpha-value>)",
          900: "rgb(var(--surface-900-rgb) / <alpha-value>)",
          950: "rgb(var(--surface-950-rgb) / <alpha-value>)",
        },
        ink: {
          50: "rgb(var(--ink-50-rgb) / <alpha-value>)",
          100: "rgb(var(--ink-100-rgb) / <alpha-value>)",
          200: "rgb(var(--ink-200-rgb) / <alpha-value>)",
          300: "rgb(var(--ink-300-rgb) / <alpha-value>)",
          400: "rgb(var(--ink-400-rgb) / <alpha-value>)",
          500: "rgb(var(--ink-500-rgb) / <alpha-value>)",
          600: "rgb(var(--ink-600-rgb) / <alpha-value>)",
          700: "rgb(var(--ink-700-rgb) / <alpha-value>)",
          800: "rgb(var(--ink-800-rgb) / <alpha-value>)",
          900: "rgb(var(--ink-900-rgb) / <alpha-value>)",
          950: "rgb(var(--ink-950-rgb) / <alpha-value>)",
        },
        neon: {
          pink: "#ff2d92",
          violet: "#a855f7",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          magenta: "#d946ef",
          rose: "#f43f5e",
        },
      },
      backgroundImage: {
        "pride-gradient":
          "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)",
        "pride-gradient-soft":
          "linear-gradient(135deg, rgba(228,3,3,0.10) 0%, rgba(255,140,0,0.10) 20%, rgba(255,237,0,0.10) 40%, rgba(0,128,38,0.10) 60%, rgba(0,77,255,0.10) 80%, rgba(117,7,135,0.10) 100%)",
        "sidebar-gradient":
          "linear-gradient(180deg, #15171d 0%, #1b1020 55%, #221231 100%)",
        "brand-radial":
          "radial-gradient(120% 120% at 0% 0%, rgba(189,127,206,0.18) 0%, rgba(117,7,135,0.06) 40%, transparent 70%)",
        "hero-mesh":
          "radial-gradient(at 20% 80%, rgba(117,7,135,0.12) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(228,3,3,0.08) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(0,77,255,0.06) 0%, transparent 50%)",
        "hero-mesh-dark":
          "radial-gradient(at 20% 80%, rgba(181,0,160,0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(228,3,3,0.06) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(0,77,255,0.05) 0%, transparent 50%)",
        "glass":
          "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)",
        "glass-dark":
          "linear-gradient(135deg, rgba(21,23,29,0.8) 0%, rgba(21,23,29,0.4) 100%)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65 0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        "grid-pattern":
          "linear-gradient(rgba(117,7,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(117,7,135,0.03) 1px, transparent 1px)",
        "grid-pattern-dark":
          "linear-gradient(rgba(189,127,206,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(189,127,206,0.05) 1px, transparent 1px)",
        "glow-conic":
          "conic-gradient(from 180deg at 50% 50%, rgba(168,89,248,0.15) 0deg, rgba(255,45,146,0.10) 90deg, rgba(6,182,212,0.10) 180deg, rgba(139,92,246,0.15) 270deg, rgba(168,89,248,0.15) 360deg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,17,26,0.04), 0 1px 3px rgba(16,17,26,0.06)",
        "card-hover":
          "0 10px 30px -12px rgba(16,17,26,0.18), 0 4px 12px -6px rgba(16,17,26,0.10)",
        glow: "0 8px 30px -8px rgba(117,7,135,0.45)",
        "glow-strong": "0 0 30px -5px rgba(189,127,206,0.4), 0 0 60px -10px rgba(117,7,135,0.3)",
        "glow-pink": "0 0 25px -5px rgba(255,45,146,0.4), 0 0 50px -10px rgba(255,45,146,0.2)",
        "glow-cyan": "0 0 25px -5px rgba(6,182,212,0.4), 0 0 50px -10px rgba(6,182,212,0.2)",
        "glow-violet": "0 0 25px -5px rgba(168,89,248,0.4), 0 0 50px -10px rgba(168,89,248,0.2)",
        "inner-light": "inset 0 1px 0 0 rgba(255,255,255,0.6)",
        ring: "0 0 0 1px rgba(16,17,26,0.06)",
        "glass": "0 8px 32px -8px rgba(0,0,0,0.08)",
        "glass-dark": "0 8px 32px -8px rgba(0,0,0,0.35)",
        "neon-pink": "0 0 20px -5px rgba(255,45,146,0.4)",
        "neon-violet": "0 0 20px -5px rgba(168,89,248,0.4)",
        "neon-cyan": "0 0 20px -5px rgba(6,182,212,0.4)",
        "card-premium": "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08), 0 0 0 1px rgba(117,7,135,0.08)",
        "card-premium-hover": "0 20px 40px -12px rgba(0,0,0,0.15), 0 8px 16px -4px rgba(0,0,0,0.1), 0 0 0 1px rgba(117,7,135,0.15), 0 0 30px -10px rgba(117,7,135,0.2)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        "spring-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(117,7,135,0.4)" },
          "70%": { boxShadow: "0 0 0 8px rgba(117,7,135,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(117,7,135,0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        "shimmer-move": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "blob-float": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(10px, -8px) scale(1.03)" },
          "66%": { transform: "translate(-8px, 12px) scale(0.98)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(189,127,206,0.3)" },
          "50%": { borderColor: "rgba(189,127,206,0.6)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "slide-up": "slide-up 0.5s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2s infinite",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "shimmer-move": "shimmer-move 2s infinite",
        "blob-float": "blob-float 20s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "text-shimmer": "text-shimmer 3s linear infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};

export default config;
