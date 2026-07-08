import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        brand: {
          DEFAULT: "#750787",
          50: "#faf5fb",
          100: "#f3e8f5",
          200: "#e8d0ec",
          300: "#d6abe0",
          400: "#bd7fce",
          500: "#a256bb",
          600: "#8a3aa3",
          700: "#750787",
          800: "#611f6e",
          900: "#511a5c",
        },
        // Neutral, slightly cool surface palette used across the admin shell.
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#e2e5ec",
          300: "#cdd2dd",
          400: "#9aa2b4",
          500: "#6b7384",
          600: "#4d5467",
          700: "#383d4d",
          800: "#23262f",
          900: "#15171d",
          950: "#0c0d12",
        },
      },
      backgroundImage: {
        "pride-gradient":
          "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)",
        "pride-gradient-soft":
          "linear-gradient(135deg, rgba(228,3,3,0.12) 0%, rgba(255,140,0,0.12) 20%, rgba(255,237,0,0.12) 40%, rgba(0,128,38,0.12) 60%, rgba(0,77,255,0.12) 80%, rgba(117,7,135,0.12) 100%)",
        "sidebar-gradient":
          "linear-gradient(180deg, #15171d 0%, #1b1020 55%, #221231 100%)",
        "brand-radial":
          "radial-gradient(120% 120% at 0% 0%, rgba(189,127,206,0.18) 0%, rgba(117,7,135,0.06) 40%, transparent 70%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,17,26,0.04), 0 1px 3px rgba(16,17,26,0.06)",
        "card-hover":
          "0 10px 30px -12px rgba(16,17,26,0.18), 0 4px 12px -6px rgba(16,17,26,0.10)",
        glow: "0 8px 30px -8px rgba(117,7,135,0.45)",
        "inner-light": "inset 0 1px 0 0 rgba(255,255,255,0.6)",
        ring: "0 0 0 1px rgba(16,17,26,0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
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
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.5s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
