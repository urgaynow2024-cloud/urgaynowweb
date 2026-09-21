"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("ugn-theme") as Theme | null;
    const initial =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("ugn-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('ugn-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

type SeasonalThemeContextValue = {
  seasonalTheme: string;
  refresh: () => Promise<void>;
};

const SeasonalThemeContext = createContext<SeasonalThemeContextValue | null>(null);

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [seasonalTheme, setSeasonalTheme] = useState<string>("default");
  const [mounted, setMounted] = useState(false);

  const fetchTheme = async () => {
    try {
      const res = await fetch("/api/theme/active", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSeasonalTheme(data.themeId);
        document.documentElement.setAttribute("data-site-theme", data.themeId);
      }
    } catch {
      setSeasonalTheme("default");
      document.documentElement.setAttribute("data-site-theme", "default");
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTheme();
  }, []);

  const refresh = async () => {
    await fetchTheme();
  };

  if (!mounted) {
    return (
      <SeasonalThemeContext.Provider value={{ seasonalTheme: "default", refresh: () => Promise.resolve() }}>
        {children}
      </SeasonalThemeContext.Provider>
    );
  }

  return (
    <SeasonalThemeContext.Provider value={{ seasonalTheme, refresh }}>
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme(): SeasonalThemeContextValue {
  const ctx = useContext(SeasonalThemeContext);
  if (!ctx) throw new Error("useSeasonalTheme must be used within SeasonalThemeProvider");
  return ctx;
}