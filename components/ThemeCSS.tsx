"use client";

import { useEffect } from "react";
import { THEME_REGISTRY, type ThemeDefinition } from "@/lib/themes";
import { useSeasonalTheme } from "./ThemeProvider";
import { useTheme } from "./ThemeProvider";

const RGB_VARIABLE_KEYS = [
  "brand",
  "background",
  "surface",
  "border",
  "text",
  "textMuted",
] as const;

function hexToRgbTriplet(value: string): string | null {
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;

  const hex = match[1];
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `${red} ${green} ${blue}`;
}

function themeToCSSVars(theme: ThemeDefinition, dark: boolean): Record<string, string> {
  const values = {
    ...theme.variables,
    ...(dark ? theme.dark ?? {} : theme.light ?? {}),
  };
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    vars[`--theme-${key}`] = value;

    if (RGB_VARIABLE_KEYS.includes(key as (typeof RGB_VARIABLE_KEYS)[number])) {
      const triplet = hexToRgbTriplet(value);
      if (triplet) {
        vars[`--theme-${key}-rgb`] = triplet;
      }
    }
  }

  return vars;
}

export function ThemeCSS({ initialTheme }: { initialTheme: string }) {
  const { seasonalTheme } = useSeasonalTheme();
  const { theme: colourMode } = useTheme();

  useEffect(() => {
    const html = document.documentElement;

    const applyTheme = () => {
      const attributeTheme = html.getAttribute("data-site-theme");
      const themeId =
        (attributeTheme && THEME_REGISTRY[attributeTheme]
          ? attributeTheme
          : seasonalTheme && THEME_REGISTRY[seasonalTheme]
            ? seasonalTheme
            : initialTheme && THEME_REGISTRY[initialTheme]
              ? initialTheme
              : "default");
      const theme = THEME_REGISTRY[themeId] || THEME_REGISTRY.default;
      const dark = html.classList.contains("dark") || colourMode === "dark";
      const vars = themeToCSSVars(theme, dark);

      for (let index = html.style.length - 1; index >= 0; index--) {
        const name = html.style.item(index);
        if (name?.startsWith("--theme-")) {
          html.style.removeProperty(name);
        }
      }

      for (const [key, value] of Object.entries(vars)) {
        html.style.setProperty(key, value);
      }

      html.setAttribute("data-site-theme", themeId);
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["data-site-theme", "class"] });

    return () => observer.disconnect();
  }, [seasonalTheme, colourMode, initialTheme]);

  return null;
}
