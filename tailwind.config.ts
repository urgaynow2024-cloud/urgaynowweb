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
      },
      backgroundImage: {
        "pride-gradient":
          "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)",
        "pride-gradient-soft":
          "linear-gradient(135deg, rgba(228,3,3,0.12) 0%, rgba(255,140,0,0.12) 20%, rgba(255,237,0,0.12) 40%, rgba(0,128,38,0.12) 60%, rgba(0,77,255,0.12) 80%, rgba(117,7,135,0.12) 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
