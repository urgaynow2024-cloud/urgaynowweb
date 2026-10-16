/**
 * One-off audit helper: extracts every rule from the seasonal blocks of
 * `app/globals.css` so the migration ledger can be built from real data rather
 * than from memory.
 *
 * Run: npx tsx scripts/extract-legacy-seasonal-css.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

interface Rule {
  selector: string;
  body: string;
  line: number;
}

/** Strips comments while preserving line numbers. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "));
}

const clean = stripComments(css);
const lines = clean.split("\n");

const rules: Rule[] = [];
let buffer = "";
let bufferStart = 0;

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const trimmed = line.trim();

  if (!buffer) {
    if (!trimmed || trimmed === "}") continue;
    if (trimmed.startsWith("@")) continue; // at-rule block start, handled by brace walk
    bufferStart = i + 1;
    buffer = trimmed;
  } else {
    buffer += ` ${trimmed}`;
  }

  if (buffer.includes("{")) {
    // Collect the declaration block.
    let depth = 0;
    let j = i;
    let declStart = "";
    // Re-walk from bufferStart to find the full rule text.
    const text = lines.slice(bufferStart - 1, i + 1).join("\n");
    for (const ch of text) {
      if (ch === "{") depth += 1;
      if (ch === "}") depth -= 1;
    }
    if (depth === 0) {
      const braceStart = text.indexOf("{");
      const braceEnd = text.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) {
        declStart = text.slice(0, braceStart).trim().replace(/\s+/g, " ");
        const body = text.slice(braceStart + 1, braceEnd).trim().replace(/\s+/g, " ");
        rules.push({ selector: declStart, body, line: bufferStart });
      }
      buffer = "";
      j = i;
    }
  }
}

// Seasonal = any selector mentioning a season id, a seasonal prefix, or the
// legacy --theme-* variable block.
const SEASONAL_PREFIX = /(^|[\s,>])(hw|cw)-/;
const SEASON_ID = /data-site-theme=["'](halloween|christmas)["']/;

const seasonal = rules.filter(
  (r) => SEASONAL_PREFIX.test(r.selector) || SEASON_ID.test(r.selector),
);

const byPrefix: Record<string, number> = {};
for (const rule of seasonal) {
  const key = rule.selector.startsWith('@') ? '@at-rule' : 'selector';
  byPrefix[key] = (byPrefix[key] ?? 0) + 1;
}

console.log(`total rules parsed: ${rules.length}`);
console.log(`seasonal rules: ${seasonal.length}`);
console.log(JSON.stringify(byPrefix, null, 2));

console.log("\n=== SEASONAL RULES (selector -> property count) ===");
for (const rule of seasonal) {
  const props = rule.body ? rule.body.split(";").filter(Boolean).length : 0;
  console.log(`${String(rule.line).padStart(5)}  ${rule.selector}   [${props} decl]`);
}
