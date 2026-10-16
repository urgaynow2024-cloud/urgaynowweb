/**
 * CSS parser used by the parity check.
 *
 * Deliberately small: it only needs to find one rule by selector and read one
 * declaration by property out of `app/globals.css`. Values are whitespace-
 * normalised so a multi-line gradient in the source compares equal to the
 * single-line gradient in the token.
 */

export interface ParsedRule {
  selector: string;
  declarations: Record<string, string>;
  line: number;
}

/** Collapses runs of whitespace so multi-line values compare cleanly. */
export function normalizeValue(value: string): string {
  return value
    .replace(/\s+/g, " ")
    // `rgba(245, 241, 247, .7)` and `rgba(245,241,247,0.7)` are the same colour.
    .replace(/\(\s*([^()]*?)\s*\)/g, (_m, inner: string) => `(${inner.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").trim()})`)
    .replace(/!\s*important/gi, "")
    // `#38BDF8` and `#38bdf8` are the same colour.
    .replace(/#([0-9a-f]{3,8})/gi, (_m, hex: string) => `#${hex.toLowerCase()}`)
    // `0.30` and `0.3` are the same number.
    .replace(/(?<=^|[\s,(])(\d*)\.(\d*?[1-9])0+(?=[\s,)%])/g, "$1.$2")
    .trim();
}

/**
 * Extracts every custom property declared in a stylesheet.
 *
 * Used to resolve `var(--hw-card)` in legacy values into the literal triplet it
 * stood for, so a token can be compared against it.
 */
export function collectCustomProperties(source: string): Record<string, string> {
  const props: Record<string, string> = {};
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    props[match[1]] = normalizeValue(match[2]);
  }
  return props;
}

/**
 * Substitutes `var(--x)` with the literal value it resolved to in the legacy
 * stylesheet. Unknown names are left alone so the comparison reports a real
 * mismatch rather than silently passing.
 */
export function resolveCustomProperties(value: string, props: Record<string, string>): string {
  return value.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/gi, (whole, name: string) => props[name] ?? whole);
}

export function parseCss(source: string): ParsedRule[] {
  // Remove comments but keep newlines so line numbers stay accurate.
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const rules: ParsedRule[] = [];

  let i = 0;
  let line = 1;
  const lineAt = (index: number) => {
    for (let k = 0; k < index && k < text.length; k += 1) if (text[k] === "\n") line += 1;
    return line;
  };

  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open === -1) break;

    // Guard against at-rules and keyframe blocks.
    const prelude = normalizeValue(text.slice(i, open));
    if (prelude.startsWith("@")) {
      // Skip the whole block (handles @keyframes correctly because we brace-match).
      let depth = 0;
      let j = open;
      for (; j < text.length; j += 1) {
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      i = j + 1;
      continue;
    }

    const close = text.indexOf("}", open);
    if (close === -1) break;

    const body = text.slice(open + 1, close);
    const declarations: Record<string, string> = {};

    for (const decl of body.split(";")) {
      const colon = decl.indexOf(":");
      if (colon === -1) continue;
      const property = decl.slice(0, colon).trim();
      const value = decl.slice(colon + 1).trim();
      if (!property || !value) continue;
      // Later declarations win, matching the cascade within a single block.
      declarations[property] = normalizeValue(value);
    }

    rules.push({ selector: prelude, declarations, line: lineAt(i) });
    i = close + 1;
  }

  return rules;
}

/**
 * Merges every rule whose selector list contains `selector`, in source order.
 *
 * Merging matters: `[role="dialog"]` appears in two legacy rules — one for the
 * surface and one for the corner glow — so a lookup that returned only the last
 * match would report the first rule's declarations as missing. Later
 * declarations win, which matches the cascade.
 */
export function mergeRulesForSelector(rules: ParsedRule[], selector: string): { declarations: Record<string, string>; lines: number[] } {
  const wanted = normalizeValue(selector);
  const declarations: Record<string, string> = {};
  const lines: number[] = [];
  let matched = false;

  for (const rule of rules) {
    const list = rule.selector.split(",").map(normalizeValue);
    if (!list.includes(wanted)) continue;
    matched = true;
    lines.push(rule.line);
    Object.assign(declarations, rule.declarations);
  }

  return matched ? { declarations, lines } : { declarations: {}, lines: [] };
}

/**
 * Finds the last rule whose selector list contains `selector`.
 *
 * Prefer `mergeRulesForSelector` for value lookups; this exists for callers
 * that specifically want a single rule.
 */
export function findRule(rules: ParsedRule[], selector: string): ParsedRule | null {
  const wanted = normalizeValue(selector);
  let found: ParsedRule | null = null;
  for (const rule of rules) {
    const list = rule.selector.split(",").map(normalizeValue);
    if (list.includes(wanted)) found = rule;
  }
  return found;
}
