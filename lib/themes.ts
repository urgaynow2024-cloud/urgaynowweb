export type ThemeMode = "manual" | "automatic";

export interface ThemeSchedule {
  id: string;
  themeId: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  enabled: boolean;
  priority: number; // lower = higher priority
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon identifier
  previewGradient: string; // CSS gradient for preview card
  variables: {
    // Brand/accent colors
    brand: string;
    brandSoft: string;
    brandGlow: string;
    // Surface/background
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    // Text
    text: string;
    textMuted: string;
    // Decorative
    decorativePattern?: string;
    decorativeGlow?: string;
  };
  // Light mode overrides (optional)
  light?: Partial<ThemeDefinition["variables"]>;
  // Dark mode overrides (optional)
  dark?: Partial<ThemeDefinition["variables"]>;
}

export const THEME_REGISTRY: Record<string, ThemeDefinition> = {
  default: {
    id: "default",
    name: "Default",
    description: "Clean, modern brand styling",
    icon: "✨",
    previewGradient: "linear-gradient(135deg, #750787 0%, #b547c9 100%)",
    variables: {
      brand: "#750787",
      brandSoft: "rgba(117, 7, 135, 0.12)",
      brandGlow: "rgba(117, 7, 135, 0.35)",
      background: "#ffffff",
      surface: "#fafafa",
      surfaceHover: "#f0f0f0",
      border: "#e5e5e5",
      text: "#1a1a1a",
      textMuted: "#737373",
    },
    light: {},
    dark: {
      brand: "#c084d8",
      brandSoft: "rgba(192, 132, 216, 0.15)",
      brandGlow: "rgba(192, 132, 216, 0.4)",
      background: "#0a0a0a",
      surface: "#141414",
      surfaceHover: "#1e1e1e",
      border: "#2a2a2a",
      text: "#fafafa",
      textMuted: "#a3a3a3",
    },
  },
  christmas: {
    id: "christmas",
    name: "Christmas",
    description: "Snowy, warm festive accents with subtle sparkle",
    icon: "🎄",
    previewGradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #750787 100%)",
    variables: {
      brand: "#d62828",
      brandSoft: "rgba(214, 40, 40, 0.12)",
      brandGlow: "rgba(214, 40, 40, 0.35)",
      background: "#fefefe",
      surface: "#fffdf8",
      surfaceHover: "#faf5eb",
      border: "#e8dcc8",
      text: "#1b4332",
      textMuted: "#5d7b5d",
      decorativePattern: "radial-gradient(circle at 20% 80%, rgba(214, 40, 40, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.06) 0%, transparent 40%)",
      decorativeGlow: "rgba(255, 215, 0, 0.3)",
    },
    light: {},
    dark: {
      brand: "#ff6b6b",
      brandSoft: "rgba(255, 107, 107, 0.15)",
      brandGlow: "rgba(255, 107, 107, 0.4)",
      background: "#0d1b0d",
      surface: "#142314",
      surfaceHover: "#1a2d1a",
      border: "#2d4a2d",
      text: "#e8f5e8",
      textMuted: "#8fab8f",
      decorativePattern: "radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.08) 0%, transparent 40%)",
      decorativeGlow: "rgba(255, 215, 0, 0.4)",
    },
  },
  halloween: {
    id: "halloween",
    name: "Halloween",
    description: "Dark purple/black base, orange accent, spooky glow",
    icon: "🎃",
    previewGradient: "linear-gradient(135deg, #1a0a2e 0%, #4a0e4e 50%, #ff6b00 100%)",
    variables: {
      brand: "#cc4400",
      brandSoft: "rgba(204, 68, 0, 0.1)",
      brandGlow: "rgba(204, 68, 0, 0.3)",
      background: "#f5eef8",
      surface: "#ebe0f5",
      surfaceHover: "#dfcceb",
      border: "#c9a8db",
      text: "#2d103d",
      textMuted: "#6b4a7d",
      decorativePattern: "radial-gradient(ellipse at 50% 0%, rgba(255, 107, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(128, 0, 128, 0.06) 0%, transparent 30%)",
      decorativeGlow: "rgba(255, 107, 0, 0.5)",
    },
    light: {},
    dark: {
      brand: "#ff6b00",
      brandSoft: "rgba(255, 107, 0, 0.12)",
      brandGlow: "rgba(255, 107, 0, 0.4)",
      background: "#0d0514",
      surface: "#1a0d26",
      surfaceHover: "#241436",
      border: "#3d1a5c",
      text: "#f0e6f5",
      textMuted: "#a890b8",
    },
  },
  valentines: {
    id: "valentines",
    name: "Valentine's",
    description: "Pink/red/purple accents, soft romantic details",
    icon: "💕",
    previewGradient: "linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8b2d5e 100%)",
    variables: {
      brand: "#e84393",
      brandSoft: "rgba(232, 67, 147, 0.12)",
      brandGlow: "rgba(232, 67, 147, 0.35)",
      background: "#fff0f5",
      surface: "#fff8fb",
      surfaceHover: "#ffeef5",
      border: "#f5d0e8",
      text: "#5c1a3d",
      textMuted: "#a85a7f",
      decorativePattern: "radial-gradient(circle at 30% 70%, rgba(232, 67, 147, 0.08) 0%, transparent 35%), radial-gradient(circle at 70% 30%, rgba(255, 107, 157, 0.06) 0%, transparent 35%)",
      decorativeGlow: "rgba(232, 67, 147, 0.4)",
    },
    light: {},
    dark: {
      brand: "#ff6b9d",
      brandSoft: "rgba(255, 107, 157, 0.15)",
      brandGlow: "rgba(255, 107, 157, 0.4)",
      background: "#2d0a1a",
      surface: "#3d1026",
      surfaceHover: "#4d1530",
      border: "#6b2545",
      text: "#ffeef5",
      textMuted: "#d4a5bc",
    },
  },
  aprilfools: {
    id: "aprilfools",
    name: "April Fools",
    description: "Playful, silly decorations — usability preserved",
    icon: "🤡",
    previewGradient: "linear-gradient(135deg, #ff6b35 0%, #f7b731 50%, #2ed573 100%)",
    variables: {
      brand: "#ff6b35",
      brandSoft: "rgba(255, 107, 53, 0.12)",
      brandGlow: "rgba(255, 107, 53, 0.35)",
      background: "#fffef7",
      surface: "#fffdf0",
      surfaceHover: "#fff9e0",
      border: "#f5e6a0",
      text: "#3d3500",
      textMuted: "#8a7d1a",
      decorativePattern: "repeating-linear-gradient(45deg, rgba(255, 107, 53, 0.03) 0, rgba(255, 107, 53, 0.03) 10px, transparent 10px, transparent 20px)",
      decorativeGlow: "rgba(255, 107, 53, 0.3)",
    },
    light: {},
    dark: {
      brand: "#f7b731",
      brandSoft: "rgba(247, 183, 49, 0.15)",
      brandGlow: "rgba(247, 183, 49, 0.4)",
      background: "#1a1800",
      surface: "#262200",
      surfaceHover: "#332d00",
      border: "#4d4400",
      text: "#fffef0",
      textMuted: "#b8a830",
    },
  },
  easter: {
    id: "easter",
    name: "Easter",
    description: "Pastel accents, spring motifs, soft decorative shapes",
    icon: "🐰",
    previewGradient: "linear-gradient(135deg, #a8e6cf 0%, #ffd3b6 50%, #ffaaa5 100%)",
    variables: {
      brand: "#88d8b0",
      brandSoft: "rgba(136, 216, 176, 0.15)",
      brandGlow: "rgba(136, 216, 176, 0.35)",
      background: "#fdfdfd",
      surface: "#fafafa",
      surfaceHover: "#f0f5f0",
      border: "#e0ebe0",
      text: "#2d4a3d",
      textMuted: "#6b8a75",
      decorativePattern: "radial-gradient(circle at 25% 25%, rgba(136, 216, 176, 0.08) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(255, 211, 182, 0.08) 0%, transparent 30%)",
      decorativeGlow: "rgba(136, 216, 176, 0.4)",
    },
    light: {},
    dark: {
      brand: "#a8e6cf",
      brandSoft: "rgba(168, 230, 207, 0.15)",
      brandGlow: "rgba(168, 230, 207, 0.4)",
      background: "#0d1a12",
      surface: "#12261a",
      surfaceHover: "#163020",
      border: "#1e422e",
      text: "#e8f5ee",
      textMuted: "#8fc9a8",
    },
  },
  summer: {
    id: "summer",
    name: "Summer",
    description: "Bright warm accents, sunny energy",
    icon: "☀️",
    previewGradient: "linear-gradient(135deg, #ff9f1c 0%, #ffbf69 50%, #fff176 100%)",
    variables: {
      brand: "#ff9f1c",
      brandSoft: "rgba(255, 159, 28, 0.12)",
      brandGlow: "rgba(255, 159, 28, 0.4)",
      background: "#fffef8",
      surface: "#fffdf0",
      surfaceHover: "#fff9e0",
      border: "#ffeaa0",
      text: "#4d3500",
      textMuted: "#8a701a",
      decorativePattern: "radial-gradient(ellipse at 50% -20%, rgba(255, 159, 28, 0.1) 0%, transparent 60%)",
      decorativeGlow: "rgba(255, 159, 28, 0.5)",
    },
    light: {},
    dark: {
      brand: "#ffbf69",
      brandSoft: "rgba(255, 191, 105, 0.15)",
      brandGlow: "rgba(255, 191, 105, 0.4)",
      background: "#1a1500",
      surface: "#261f00",
      surfaceHover: "#332a00",
      border: "#4d3f00",
      text: "#fffef0",
      textMuted: "#c4b030",
    },
  },
  autumn: {
    id: "autumn",
    name: "Autumn",
    description: "Warm earthy accents, subtle falling leaves",
    icon: "🍂",
    previewGradient: "linear-gradient(135deg, #8b4513 0%, #cd853f 50%, #daa520 100%)",
    variables: {
      brand: "#c4722a",
      brandSoft: "rgba(196, 114, 42, 0.12)",
      brandGlow: "rgba(196, 114, 42, 0.35)",
      background: "#fdf8f3",
      surface: "#faf5ef",
      surfaceHover: "#f0ebe0",
      border: "#e0d4c0",
      text: "#3d2a1a",
      textMuted: "#8a755a",
      decorativePattern: "radial-gradient(circle at 10% 90%, rgba(196, 114, 42, 0.06) 0%, transparent 25%), radial-gradient(circle at 90% 10%, rgba(218, 165, 32, 0.05) 0%, transparent 25%)",
      decorativeGlow: "rgba(196, 114, 42, 0.4)",
    },
    light: {},
    dark: {
      brand: "#daa520",
      brandSoft: "rgba(218, 165, 32, 0.15)",
      brandGlow: "rgba(218, 165, 32, 0.4)",
      background: "#1a1208",
      surface: "#241a10",
      surfaceHover: "#2d2214",
      border: "#3d3018",
      text: "#f5efe8",
      textMuted: "#b8a070",
    },
  },
  spring: {
    id: "spring",
    name: "Spring",
    description: "Fresh pastel/green accents, light floral details",
    icon: "🌸",
    previewGradient: "linear-gradient(135deg, #77dd77 0%, #84b6f4 50%, #ffb3de 100%)",
    variables: {
      brand: "#4ec9b0",
      brandSoft: "rgba(78, 201, 176, 0.12)",
      brandGlow: "rgba(78, 201, 176, 0.35)",
      background: "#f5fdf8",
      surface: "#f0faf5",
      surfaceHover: "#e5f5e5",
      border: "#d0e8d0",
      text: "#1a3d2e",
      textMuted: "#5a8a75",
      decorativePattern: "radial-gradient(circle at 20% 80%, rgba(78, 201, 176, 0.07) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(132, 182, 244, 0.06) 0%, transparent 30%)",
      decorativeGlow: "rgba(78, 201, 176, 0.4)",
    },
    light: {},
    dark: {
      brand: "#77dd77",
      brandSoft: "rgba(119, 221, 119, 0.15)",
      brandGlow: "rgba(119, 221, 119, 0.4)",
      background: "#0a1a0f",
      surface: "#102616",
      surfaceHover: "#16301c",
      border: "#1e4228",
      text: "#e8f5eb",
      textMuted: "#8fc9a0",
    },
  },
};

export const THEME_ORDER = [
  "default",
  "christmas",
  "halloween",
  "valentines",
  "aprilfools",
  "easter",
  "summer",
  "autumn",
  "spring",
] as const;

export function getThemeDefinition(id: string): ThemeDefinition | undefined {
  return THEME_REGISTRY[id];
}

export function getAllThemes(): ThemeDefinition[] {
  return THEME_ORDER.map((id) => THEME_REGISTRY[id]).filter(Boolean) as ThemeDefinition[];
}

export function resolveActiveTheme(
  mode: ThemeMode,
  manualThemeId: string | null,
  schedules: ThemeSchedule[],
  now: Date = new Date()
): string {
  if (mode === "manual" && manualThemeId && THEME_REGISTRY[manualThemeId]) {
    return manualThemeId;
  }

  if (mode === "automatic") {
    const activeSchedules = schedules
      .filter((s) => s.enabled && new Date(s.start) <= now && new Date(s.end) >= now)
      .sort((a, b) => a.priority - b.priority);

    if (activeSchedules.length > 0) {
      const themeId = activeSchedules[0].themeId;
      if (THEME_REGISTRY[themeId]) return themeId;
    }
  }

  return "default";
}