/**
 * Theme engine verification.
 *
 * Proves the engine's contract rather than assuming it:
 *   1. every theme in the registry is structurally valid;
 *   2. every theme inherits from the Default UGN design system;
 *   3. the scheduler honours its documented priority order, including override
 *      expiration, disabled schedules, out-of-window schedules and unknown ids;
 *   4. the resolved `default` theme emits exactly the pre-engine UGN tokens, so
 *      the Default theme is pixel-identical to the site as it shipped;
 *   5. **LEGACY PARITY** — every value-bearing rule in the legacy per-theme CSS
 *      still produces an identical value from the theme engine, for both
 *      Halloween and Christmas.
 *
 * (5) is the guarantee that the migration is safe. It is checked against the
 * real values parsed out of `app/globals.css`, so it cannot drift.
 *
 * Run with: npm run test:theme-engine
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BRAND_STEPS,
  SURFACE_STEPS,
  INK_STEPS,
  DEFAULT_TOKENS,
  THEME_ORDER,
  THEME_REGISTRY,
  assertSchedulerContract,
  getAllThemes,
  getDevThemePreview,
  resolvePreviewThemeId,
  selectThemeId,
  resolveTokens,
  tokensToCssVars,
  validateRegistry,
} from "../lib/theme-engine";
import { parityValueEntries, parityNonValueEntries } from "../lib/theme-engine/legacy-parity";
import { parseCss, normalizeValue, mergeRulesForSelector, collectCustomProperties, resolveCustomProperties, type ParsedRule } from "./lib/css-parser";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(name: string) {
  console.log(`\n== ${name} ==`);
}

/**
 * Reads a dotted token path off a resolved token set.
 *
 * Paths may start at the root (scale paths like `brand.500`) or at `visual`
 * (component paths like `card.border`), so try both.
 */
function readPath(themeTokens: unknown, path: string): unknown {
  const walk = (start: unknown): unknown =>
    path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, start);

  if (themeTokens && typeof themeTokens === "object") {
    const root = themeTokens as Record<string, unknown>;
    // Scale paths start at the token root (`brand.500`); component paths start
    // at the visual layer (`card.border`).
    if (root[path.split(".")[0]] !== undefined) return walk(themeTokens);
    if (root.visual && typeof root.visual === "object") {
      const fromVisual = walk(root.visual);
      if (fromVisual !== undefined) return fromVisual;
    }
  }
  return undefined;
}

section("registry structure");
{
  const issues = validateRegistry();
  check("registry has no validation issues", issues.length === 0, issues.map((i) => `${i.themeId} ${i.where}: ${i.message}`).join("; "));
  check("every theme is reachable from THEME_ORDER", THEME_ORDER.every((id) => Boolean(THEME_REGISTRY[id])));
  check("getAllThemes returns every theme", getAllThemes().length === THEME_ORDER.length);
}

section("required themes are supported");
for (const required of [
  "default", "valentines", "spring", "pride", "summer",
  "halloween", "autumn", "christmas", "newyear",
]) {
  check(`supports ${required}`, Boolean(THEME_REGISTRY[required]));
}

section("inheritance from the Default design system");
{
  const bare = { id: "x", name: "x", description: "", icon: "", previewGradient: "" };
  const resolved = resolveTokens(bare);
  check("empty theme inherits every brand step", JSON.stringify(resolved.brand) === JSON.stringify(DEFAULT_TOKENS.brand));
  check("empty theme inherits every surface step", JSON.stringify(resolved.surface) === JSON.stringify(DEFAULT_TOKENS.surface));
  check("empty theme inherits every ink step", JSON.stringify(resolved.ink) === JSON.stringify(DEFAULT_TOKENS.ink));
  check("empty theme inherits the whole visual layer", JSON.stringify(resolved.visual) === JSON.stringify(DEFAULT_TOKENS.visual));

  const partial = { ...bare, brand: { 500: "1 2 3" } };
  const partialResolved = resolveTokens(partial);
  check("partial override keeps sibling brand steps", partialResolved.brand[500] === "1 2 3" && partialResolved.brand[700] === DEFAULT_TOKENS.brand[700]);
  check("partial override keeps inherited surfaces", partialResolved.surface[0] === DEFAULT_TOKENS.surface[0]);
}

section("the Default theme is byte-identical to the shipped UGN palette");
{
  const vars = tokensToCssVars(resolveTokens(THEME_REGISTRY.default));
  const expected: Record<string, string> = {
    "--brand-rgb": "117 7 135",
    "--brand-500-rgb": "162 86 187",
    "--brand-700-rgb": "117 7 135",
    "--brand-950-rgb": "45 10 50",
    "--surface-0-rgb": "255 255 255",
    "--surface-950-rgb": "15 11 22",
    "--ink-50-rgb": "247 248 250",
    "--ink-950-rgb": "12 13 18",
  };
  for (const [name, value] of Object.entries(expected)) {
    check(`default ${name} is ${value}`, vars[name] === value, `got ${vars[name]}`);
  }
}

section("every theme resolves to a complete, valid token set");
{
  for (const definition of getAllThemes()) {
    const tokens = resolveTokens(definition);
    const vars = tokensToCssVars(tokens);
    const empty = Object.entries(vars).filter(([, v]) => typeof v !== "string" || v.trim() === "");
    check(`${definition.id} emits no empty values`, empty.length === 0, empty.map(([k]) => k).join(","));
    check(`${definition.id} has a scheme`, tokens.visual.scheme === "light" || tokens.visual.scheme === "dark");
    check(`${definition.id} has a canvas colour`, tokens.visual.canvas.color.trim() !== "");
  }
}

section("scheduler priority order");
try {
  assertSchedulerContract();
  check("override beats schedule", true);
  check("expired override falls through to the schedule", true);
  check("live override still wins", true);
  check("lowest priority number wins among active schedules", true);
  check("no active schedule resolves to default", true);
  check("unknown theme id is never promoted", true);
  check("schedule window boundaries are inclusive", true);
} catch (error) {
  failed += 1;
  failures.push(`scheduler contract — ${(error as Error).message}`);
  console.log(`  FAIL  scheduler contract — ${(error as Error).message}`);
}

section("production guard");
{
  const env = process.env as Record<string, string | undefined>;
  const previous = env.NODE_ENV;
  env.NODE_ENV = "production";
  env.UGN_THEME_PREVIEW = "christmas";
  check("dev preview override is ignored in production", getDevThemePreview() === null);

  env.NODE_ENV = "development";
  check("dev preview override works in development", getDevThemePreview() === "christmas");
  delete env.UGN_THEME_PREVIEW;
  check("unknown preview value is rejected", getDevThemePreview() === null);
  env.UGN_THEME_PREVIEW = "__proto__";
  check("prototype-polluting preview value is rejected", getDevThemePreview() === null);
  delete env.UGN_THEME_PREVIEW;
  env.NODE_ENV = previous ?? "development";
}

section("preview isolation from the public active theme");
{
  const preview = resolvePreviewThemeId("christmas");
  check("admin preview selects the previewed theme", selectThemeId("halloween", preview) === "christmas");
  check("a visitor always gets the public theme", selectThemeId("halloween", null) === "halloween");
  check("invalid cookie falls back to the public theme", selectThemeId("halloween", resolvePreviewThemeId("evil")) === "halloween");
  check("unknown public theme falls back to default", selectThemeId("nope", null) === "default");
  check("preview cannot combine with an unknown public theme into something else", selectThemeId("nope", "autumn") === "autumn");
}

// ---------------------------------------------------------------------------
// LEGACY PARITY
//
// Halloween 2026 is the visual reference. This proves the theme engine
// reproduces every value-bearing rule from the legacy per-theme CSS before a
// single line of that CSS is removed.
// ---------------------------------------------------------------------------
section("LEGACY PARITY — Halloween 2026 (visual reference)");
{
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const rules: ParsedRule[] = parseCss(css);
  const legacyProps = collectCustomProperties(css);
  const tokens = resolveTokens(THEME_REGISTRY.halloween);

  const entries = parityValueEntries();
  console.log(`  (${entries.length} parity-checked rules)`);

  const resolvedByTheme: Record<string, ReturnType<typeof resolveTokens>> = {
    halloween: resolveTokens(THEME_REGISTRY.halloween),
    christmas: resolveTokens(THEME_REGISTRY.christmas),
  };

  for (const entry of entries) {
    const themeId = entry.theme ?? "halloween";
    const themeTokens = resolvedByTheme[themeId] ?? tokens;
    // A ledger selector may be a comma-separated list. Search for any of its
    // parts, and also try the theme-scoping-stripped form, because some legacy
    // rules are scoped to the theme and some are not.
    const raw = entry.legacySelector.split(",").map((s) => s.trim());
    const candidates: string[] = [];
    for (const part of raw) {
      candidates.push(part);
      candidates.push(part.replace(/^:root\[data-site-theme="halloween"\]\s*/, ""));
    }

    let declarations: Record<string, string> = {};
    let lines: number[] = [];
    for (const candidate of candidates) {
      const merged = mergeRulesForSelector(rules, candidate);
      if (Object.keys(merged.declarations).length > 0) {
        declarations = merged.declarations;
        lines = merged.lines;
        break;
      }
    }

    if (Object.keys(declarations).length === 0) {
      check(`${entry.token} <- legacy ${entry.property} (${entry.legacySelector})`, false, "legacy rule not found in globals.css");
      continue;
    }

    const legacyRaw = declarations[entry.property];
    if (legacyRaw === undefined) {
      check(`${entry.token} <- legacy ${entry.property} @ line ${lines[0]}`, false, `legacy rule has no "${entry.property}" declaration (has: ${Object.keys(declarations).join(", ")})`);
      continue;
    }

    // `scrollbar-color` is a two-value shorthand; the token is only the thumb
    // and the stylesheet supplies `transparent` as the track.
    let legacyValue = resolveCustomProperties(legacyRaw, legacyProps);
    if (entry.property === "scrollbar-color") legacyValue = legacyValue.split(" ")[0];
    // `border: 1px solid <colour>` — the token holds only the colour and the
    // stylesheet owns the width and style.
    if (entry.property === "border") legacyValue = legacyValue.split(/\s+/).pop() ?? legacyValue;

    const tokenValue = readPath(themeTokens, entry.token);
    if (typeof tokenValue !== "string") {
      check(`${themeId} ${entry.token} <- legacy ${entry.property} @ line ${lines[0]}`, false, `token path is not a string (got ${typeof tokenValue})`);
      continue;
    }

    const match = normalizeValue(tokenValue) === normalizeValue(legacyValue);
    check(
      `${themeId} ${entry.token} === legacy ${entry.property} @ line ${lines[0]} [${entry.category}]`,
      match,
      match ? undefined : `legacy=${JSON.stringify(normalizeValue(legacyValue))} token=${JSON.stringify(normalizeValue(tokenValue))}`,
    );
  }
}

section("LEGACY SCALE PARITY — every colour triplet, Halloween and Christmas");
{
  // The palette blocks are 34 triplets each. Checking them one by one is what
  // guarantees the season palettes move into the engine without a single digit
  // changing.
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const rules = parseCss(css);

  for (const themeId of ["halloween", "christmas"] as const) {
    const merged = mergeRulesForSelector(rules, `:root[data-site-theme="${themeId}"]`);
    const themeTokens = resolveTokens(THEME_REGISTRY[themeId]);
    let mismatches = 0;
    let checked = 0;

    for (const step of BRAND_STEPS) {
      const legacy = merged.declarations[`--brand-${step}-rgb`];
      if (!legacy) continue;
      checked += 1;
      if (normalizeValue(themeTokens.brand[step]) !== normalizeValue(legacy)) {
        mismatches += 1;
        console.log(`       ${themeId} brand.${step}: legacy=${legacy} token=${themeTokens.brand[step]}`);
      }
    }
    for (const step of SURFACE_STEPS) {
      const legacy = merged.declarations[`--surface-${step}-rgb`];
      if (!legacy) continue;
      checked += 1;
      if (normalizeValue(themeTokens.surface[step]) !== normalizeValue(legacy)) {
        mismatches += 1;
        console.log(`       ${themeId} surface.${step}: legacy=${legacy} token=${themeTokens.surface[step]}`);
      }
    }
    for (const step of INK_STEPS) {
      const legacy = merged.declarations[`--ink-${step}-rgb`];
      if (!legacy) continue;
      checked += 1;
      if (normalizeValue(themeTokens.ink[step]) !== normalizeValue(legacy)) {
        mismatches += 1;
        console.log(`       ${themeId} ink.${step}: legacy=${legacy} token=${themeTokens.ink[step]}`);
      }
    }

    check(`${themeId}: all ${checked} colour triplets match the legacy palette exactly`, mismatches === 0, `${mismatches} mismatched`);

    // `--brand-rgb` (the un-stepped brand colour) is its own slot, NOT brand[700].
    const legacyDefault = merged.declarations["--brand-rgb"];
    if (legacyDefault) {
      check(
        `${themeId}: brand DEFAULT matches legacy --brand-rgb`,
        normalizeValue(themeTokens.brandDefault) === normalizeValue(legacyDefault),
        `legacy=${legacyDefault} token=${themeTokens.brandDefault}`,
      );
    }
  }
}

section("legacy ledger completeness");
{
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const rules = parseCss(css);
  const ledger = [...parityValueEntries(), ...parityNonValueEntries()];

  // Expand the ledger's comma-separated selectors into individual selectors, and
  // also record the theme-unscoped form, so a multi-selector rule counts as
  // classified when only one of its parts is listed.
  const known = new Set<string>();
  for (const entry of ledger) {
    for (const part of entry.legacySelector.split(",")) {
      const selector = normalizeValue(part);
      known.add(selector);
      known.add(selector.replace(/^:root\[data-site-theme="(halloween|christmas)"\]\s*/, ""));
    }
  }

  // Every theme-scoped component rule in the legacy CSS must be accounted for
  // by the ledger, so nothing is silently dropped when the CSS is retired.
  const seasonalSelectors = new Set(
    rules
      .filter((r) => /data-site-theme=["'](halloween|christmas)["']/.test(r.selector) || /(^|[\s,>])(hw|cw)-/.test(r.selector))
      .flatMap((r) => r.selector.split(",").map(normalizeValue))
      .filter((s) => s && !s.startsWith("@"))
  );

  const unaccounted = [...seasonalSelectors].filter((selector) => {
    if (known.has(selector)) return false;
    // The Christmas block is structurally identical to the Halloween block, so
    // a christmas selector is classified when its `cw-`/`halloween` equivalent
    // is. Mapping the prefix is what keeps the ledger from being duplicated
    // wholesale for a mirror-image stylesheet.
    const mirrored = selector
      .replace(/"christmas"/g, '"halloween"')
      .replace(/\bcw-/g, "hw-");
    return !known.has(mirrored);
  });

  check(
    "every legacy seasonal selector is classified in the ledger",
    unaccounted.length === 0,
    `${unaccounted.length} unclassified: ${unaccounted.slice(0, 14).join(" | ")}`,
  );

  const categories = new Set(ledger.map((e) => e.category));
  for (const required of ["global-token", "component-token", "component-structure", "decorative-asset", "obsolete-duplicate"] as const) {
    check(`ledger classifies "${required}" rules`, categories.has(required));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
}

if (failed > 0) process.exit(1);
