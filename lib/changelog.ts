/**
 * Turns a real deployment — its changed files, line counts and commit subjects —
 * into a changelog a visitor can read without opening GitHub.
 *
 * Everything here is derived from data the deployment actually produced. There is
 * no free-text generation and no guessing: a bullet is only ever emitted for a file
 * that really changed, or for a commit subject that clearly reads as a description
 * of a change rather than an instruction to a developer or an agent. When neither
 * source yields anything the result is a neutral, factual sentence.
 */

export type ChangeKind =
  | "feature"
  | "improvement"
  | "fix"
  | "security"
  | "performance"
  | "technical";

export interface ChangedFile {
  /** A = added, M = modified, D = deleted, R = renamed. */
  status: string;
  path: string;
}

export interface DeploymentDiff {
  files: ChangedFile[];
  additions: number;
  deletions: number;
}

export interface CommitSummary {
  sha?: string;
  subject: string;
  body?: string;
}

export interface Changelog {
  title: string;
  summary: string;
  /** Features */
  whatsNew: string;
  /** Improvements, Performance, Technical */
  improvements: string;
  /** Fixes */
  bugFixes: string;
  /** Security & Moderation */
  securityNotes: string;
  /** Suggested `Update.category` */
  category:
    | "NEW"
    | "IMPROVEMENT"
    | "FIX"
    | "SECURITY"
    | "PERFORMANCE"
    | "MAINTENANCE";
  /** Dominant category, used to pick MAJOR/MINOR/PATCH. */
  kind: ChangeKind;
  /** True when a commit was marked as a breaking change. */
  breaking: boolean;
}

export interface BuildChangelogInput {
  commits?: CommitSummary[];
  diff?: DeploymentDiff | null;
}

const FALLBACK_SUMMARY = "Website update deployed successfully.";
const FALLBACK_TITLE = "Website Update";
const MAX_BULLETS_PER_SECTION = 10;
const MAX_TITLE_LENGTH = 70;
const MAX_COMMIT_SUBJECT = 140;
/** A second area is only named in the title if it is at least this weight of the first. */
const SECOND_AREA_RATIO = 0.5;

interface AreaRule {
  test: RegExp;
  /** Sentence form, used in bullets: "Added the seasonal theme." */
  label: string;
  /** Title form, used for the update title: "Seasonal Theme" */
  title: string;
  kind: ChangeKind;
}

/**
 * Ordered, most specific first: the first match wins. Areas are deliberately
 * coarse — a visitor cares that the changelog system changed, not which file in it
 * changed.
 */
const AREA_RULES: AreaRule[] = [
  // Access control first: a change here is always reported as security.
  { test: /^middleware\.ts$/, label: "authentication and access control", title: "Authentication and Access Control", kind: "security" },
  { test: /^lib\/(auth|request-security|report-auth|report-access|roles)\b/, label: "authentication and permissions", title: "Authentication and Permissions", kind: "security" },
  { test: /^app\/admin\/login/, label: "staff sign-in", title: "Staff Sign-in", kind: "security" },

  // Product areas
  { test: /reviews/i, label: "community reviews", title: "Community Reviews", kind: "feature" },
  { test: /(^|\/)(report|reports|my-reports|support)(\/|\.|$)/i, label: "the report and support system", title: "Report and Support System", kind: "feature" },
  { test: /(^|\/)(events?)(\/|\.|$)|reminder|\bics\b/i, label: "events", title: "Events", kind: "feature" },
  { test: /announcements?|(^|\/)news(\/|$)/i, label: "announcements", title: "Announcements", kind: "feature" },
  { test: /gallery|community\/submit/i, label: "community submissions", title: "Community Submissions", kind: "feature" },
  { test: /(^|\/)(groups?)(\/|\.|$)|group-photos/i, label: "groups", title: "Groups", kind: "feature" },
  { test: /partners/i, label: "the partners page", title: "Partners Page", kind: "feature" },
  { test: /(^|\/)shop(\/|$)/i, label: "the shop", title: "Shop", kind: "feature" },
  { test: /guides/i, label: "guides", title: "Guides", kind: "feature" },
  { test: /(^|\/)(legal|ownership)(\/|$)|terms|privacy|\btos\b/i, label: "legal and policy pages", title: "Legal and Policy Pages", kind: "feature" },
  { test: /(^|\/)search(\/|\.|$)/i, label: "search", title: "Search", kind: "feature" },
  { test: /staff/i, label: "the staff directory", title: "Staff Directory", kind: "feature" },
  { test: /discord|webhook/i, label: "Discord notifications", title: "Discord Notifications", kind: "feature" },
  { test: /upload|blob|(^|\/)images?(\/|\.|$)|opengraph|manifest/i, label: "image handling", title: "Image Handling", kind: "technical" },

  // Presentation
  { test: /halloween|christmas|seasonal|theme|tailwind\.config/i, label: "the seasonal theme", title: "Seasonal Theme", kind: "improvement" },
  { test: /globals\.css|\.css$/i, label: "the site's styling", title: "Site Styling", kind: "improvement" },
  { test: /^components\//i, label: "the interface", title: "Interface", kind: "improvement" },

  // This changelog system itself
  { test: /auto-release|release-generator|\/api\/releases/i, label: "the automatic release system", title: "Automatic Release System", kind: "technical" },
  { test: /(^|\/)updates(\/|$)|update-utils/i, label: "the website changelog", title: "Website Changelog", kind: "feature" },

  // Technical
  { test: /sitemap|robots/i, label: "search engine indexing", title: "Search Engine Indexing", kind: "technical" },
  { test: /^prisma\/|(^|\/)migrations?\/|^sql\//i, label: "the database schema", title: "Database Schema", kind: "technical" },
  { test: /^app\/api\//i, label: "the site's API", title: "Site API", kind: "technical" },
  { test: /^\.github\//i, label: "the deployment automation", title: "Deployment Automation", kind: "technical" },
  { test: /^(next\.config|vercel\.json|tailwind\.config|postcss|package(-lock)?\.json|tsconfig)/i, label: "build and deployment configuration", title: "Build and Deployment Configuration", kind: "technical" },
  { test: /^scripts\//i, label: "internal verification tooling", title: "Verification Tooling", kind: "technical" },
  { test: /^docs\/|\.md$/i, label: "documentation", title: "Documentation", kind: "technical" },

  // Catch-alls
  { test: /^app\//i, label: "website pages", title: "Website Pages", kind: "improvement" },
  { test: /^lib\//i, label: "shared application code", title: "Shared Application Code", kind: "technical" },
];

const DEFAULT_AREA: AreaRule = {
  test: /.^/,
  label: "the website",
  title: "Website",
  kind: "improvement",
};

export function areaForPath(path: string): AreaRule {
  const normalised = (path ?? "").replace(/\\/g, "/").replace(/^\.\//, "");
  for (const rule of AREA_RULES) {
    if (rule.test.test(normalised)) return rule;
  }
  return DEFAULT_AREA;
}

/**
 * Which public section a file-derived bullet belongs in. A newly added file in a
 * product area is a feature; other changes to it are improvements — except for
 * areas that are inherently technical, security-sensitive or about speed.
 */
function bucketForArea(areaKind: ChangeKind, status: string): ChangeKind {
  if (areaKind === "security") return "security";
  if (areaKind === "technical") return "technical";
  if (areaKind === "performance") return "performance";
  if (status === "A") return "feature";
  return "improvement";
}

/** Leading verb of a commit subject, mapped to past tense and a category. */
const COMMIT_VERBS: Record<string, { past: string; kind: ChangeKind }> = {
  add: { past: "Added", kind: "feature" },
  adds: { past: "Added", kind: "feature" },
  added: { past: "Added", kind: "feature" },
  create: { past: "Created", kind: "feature" },
  created: { past: "Created", kind: "feature" },
  implement: { past: "Implemented", kind: "feature" },
  implemented: { past: "Implemented", kind: "feature" },
  introduce: { past: "Introduced", kind: "feature" },
  introduced: { past: "Introduced", kind: "feature" },
  launch: { past: "Launched", kind: "feature" },
  launched: { past: "Launched", kind: "feature" },
  connect: { past: "Connected", kind: "feature" },
  connected: { past: "Connected", kind: "feature" },
  enable: { past: "Enabled", kind: "feature" },
  enabled: { past: "Enabled", kind: "feature" },

  fix: { past: "Fixed", kind: "fix" },
  fixed: { past: "Fixed", kind: "fix" },
  fixes: { past: "Fixed", kind: "fix" },
  resolve: { past: "Resolved", kind: "fix" },
  resolved: { past: "Resolved", kind: "fix" },
  repair: { past: "Repaired", kind: "fix" },
  repaired: { past: "Repaired", kind: "fix" },
  correct: { past: "Corrected", kind: "fix" },
  corrected: { past: "Corrected", kind: "fix" },

  improve: { past: "Improved", kind: "improvement" },
  improved: { past: "Improved", kind: "improvement" },
  improves: { past: "Improved", kind: "improvement" },
  refine: { past: "Refined", kind: "improvement" },
  refined: { past: "Refined", kind: "improvement" },
  polish: { past: "Polished", kind: "improvement" },
  polished: { past: "Polished", kind: "improvement" },
  simplify: { past: "Simplified", kind: "improvement" },
  simplified: { past: "Simplified", kind: "improvement" },
  clean: { past: "Cleaned up", kind: "improvement" },
  cleaned: { past: "Cleaned up", kind: "improvement" },
  cleanup: { past: "Cleaned up", kind: "improvement" },
  update: { past: "Updated", kind: "improvement" },
  updated: { past: "Updated", kind: "improvement" },
  updates: { past: "Updated", kind: "improvement" },
  remove: { past: "Removed", kind: "improvement" },
  removed: { past: "Removed", kind: "improvement" },
  delete: { past: "Removed", kind: "improvement" },
  deleted: { past: "Removed", kind: "improvement" },
  rename: { past: "Renamed", kind: "improvement" },
  renamed: { past: "Renamed", kind: "improvement" },
  refactor: { past: "Refactored", kind: "improvement" },
  refactored: { past: "Refactored", kind: "improvement" },
  migrate: { past: "Migrated", kind: "improvement" },
  migrated: { past: "Migrated", kind: "improvement" },
  restore: { past: "Restored", kind: "improvement" },
  restored: { past: "Restored", kind: "improvement" },
  apply: { past: "Applied", kind: "improvement" },
  applied: { past: "Applied", kind: "improvement" },
  deepen: { past: "Deepened", kind: "improvement" },
  deepened: { past: "Deepened", kind: "improvement" },
  rework: { past: "Reworked", kind: "improvement" },
  reworked: { past: "Reworked", kind: "improvement" },

  harden: { past: "Hardened", kind: "security" },
  hardened: { past: "Hardened", kind: "security" },
  secure: { past: "Secured", kind: "security" },
  secured: { past: "Secured", kind: "security" },
  guard: { past: "Guarded", kind: "security" },
  guarded: { past: "Guarded", kind: "security" },
  block: { past: "Blocked", kind: "security" },
  blocked: { past: "Blocked", kind: "security" },

  reduce: { past: "Reduced", kind: "performance" },
  reduced: { past: "Reduced", kind: "performance" },
  optimise: { past: "Optimised", kind: "performance" },
  optimised: { past: "Optimised", kind: "performance" },
  optimize: { past: "Optimised", kind: "performance" },
  optimized: { past: "Optimised", kind: "performance" },
  speed: { past: "Sped up", kind: "performance" },
  sped: { past: "Sped up", kind: "performance" },
  cache: { past: "Cached", kind: "performance" },
  cached: { past: "Cached", kind: "performance" },
  preload: { past: "Preloaded", kind: "performance" },
  preloaded: { past: "Preloaded", kind: "performance" },
};

const CONVENTIONAL_PREFIX: Record<string, ChangeKind> = {
  feat: "feature",
  feature: "feature",
  fix: "fix",
  perf: "performance",
  refactor: "improvement",
  chore: "improvement",
  docs: "improvement",
  build: "improvement",
  ci: "technical",
  test: "technical",
  style: "improvement",
};

/**
 * Text that is clearly about the repository, or about instructing something, and
 * must therefore never be shown publicly. Commit subjects are additionally only
 * used when they open with a recognised change verb, so an imperative sentence
 * such as "Wait for the deployment before calling the site" is dropped even
 * though it reads like ordinary English.
 */
const INTERNAL_TEXT: RegExp[] = [
  /\bco-authored-by\b/i,
  /\b(claude|chatgpt|copilot|codex|gemini|ollama|gpt-?4|gpt-?5)\b/i,
  /\b(npx|npm run|yarn|pnpm|curl|gh api|git (status|log|diff|push|commit|add))\b/i,
  /\b(workflow file|secret|env var|environment variable|branch protection)\b/i,
  // A subject that names a source file is describing the diff, not the change.
  /\b[\w./-]+\.(ts|tsx|js|mjs|cjs|json|ya?ml|prisma|sql|css|md)\b/i,
  /\.github\/workflows/i,
  /\b(prompt|instruction)\b/i,
  /\bvia (the )?(skill|mcp|tool|agent)\b/i,
];

export interface ClassifiedCommit {
  text: string;
  kind: ChangeKind;
  breaking: boolean;
}

const BREAKING = /\bbreaking change\b/i;

/**
 * Turns a commit subject into a public bullet, or returns null when the subject is
 * not safe or not meaningful for the changelog.
 */
export function classifyCommitSubject(
  subject: string,
  body = "",
): ClassifiedCommit | null {
  const trimmed = (subject ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > MAX_COMMIT_SUBJECT) return null;
  if (INTERNAL_TEXT.some((pattern) => pattern.test(trimmed) || pattern.test(body ?? ""))) {
    return null;
  }

  let rest = trimmed;
  let forcedKind: ChangeKind | null = null;

  const conventional = /^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/i.exec(trimmed);
  if (conventional && CONVENTIONAL_PREFIX[conventional[1].toLowerCase()]) {
    forcedKind = CONVENTIONAL_PREFIX[conventional[1].toLowerCase()];
    rest = conventional[2].trim();
  }

  const verb = /^[a-z]+/i.exec(rest)?.[0].toLowerCase() ?? "";
  const entry = COMMIT_VERBS[verb];
  if (!entry) return null;

  const remainder = rest.slice(verb.length).replace(/^[:\s]+/, "").trim();
  if (!remainder) return null;

  const text = `${entry.past} ${remainder}`.replace(/\s+/g, " ").trim();
  if (!/[a-z]{3}/.test(text)) return null;

  return {
    text,
    kind: forcedKind ?? entry.kind,
    breaking: BREAKING.test(trimmed) || BREAKING.test(body ?? ""),
  };
}

function bullet(text: string): string {
  const trimmed = text.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function joinAnd(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

const SECTION_HEADINGS: Record<ChangeKind, string> = {
  feature: "Features",
  improvement: "Improvements",
  fix: "Fixes",
  security: "Security",
  performance: "Performance",
  technical: "Technical",
};

/**
 * Renders one field's blocks. A single block whose heading the field already
 * implies gets no subheading; anything else is labelled so the categories are
 * visible on the page.
 */
function sectionMarkdown(
  blocks: Array<{ heading: string; bullets: string[]; primary?: boolean }>,
): string {
  const used = blocks.filter((block) => block.bullets.length > 0);
  if (used.length === 0) return "";
  const render = (block: (typeof used)[number]) =>
    block.bullets.map((line) => `- ${line}`).join("\n");
  if (used.length === 1 && used[0].primary) return render(used[0]);
  return used.map((block) => `### ${block.heading}\n${render(block)}`).join("\n\n");
}

const CATEGORY_FOR_KIND: Record<ChangeKind, Changelog["category"]> = {
  feature: "NEW",
  improvement: "IMPROVEMENT",
  fix: "FIX",
  security: "SECURITY",
  performance: "PERFORMANCE",
  technical: "MAINTENANCE",
};

interface AreaBucket {
  rule: AreaRule;
  added: number;
  modified: number;
  removed: number;
  renamed: number;
}

function areaWeight(bucket: AreaBucket): number {
  const raw =
    bucket.added * 4 + bucket.removed * 3 + bucket.modified * 2 + bucket.renamed;
  // A change to access control or the schema outranks a routine edit.
  if (bucket.rule.kind === "security") return raw * 2;
  return raw;
}

export function buildChangelog(input: BuildChangelogInput): Changelog {
  const diff = input.diff ?? null;
  const files = diff?.files ?? [];

  // ---- Group the real file changes by area, heaviest first. ----------------
  const buckets = new Map<string, AreaBucket>();
  for (const file of files) {
    if (!file?.path) continue;
    const rule = areaForPath(file.path);
    let bucket = buckets.get(rule.label);
    if (!bucket) {
      bucket = { rule, added: 0, modified: 0, removed: 0, renamed: 0 };
      buckets.set(rule.label, bucket);
    }
    const status = (file.status || "M").charAt(0).toUpperCase();
    if (status === "A") bucket.added += 1;
    else if (status === "D") bucket.removed += 1;
    else if (status === "R") bucket.renamed += 1;
    else bucket.modified += 1;
  }
  const ranked = [...buckets.values()].sort((a, b) => areaWeight(b) - areaWeight(a));

  const collected: Record<ChangeKind, string[]> = {
    feature: [],
    improvement: [],
    fix: [],
    security: [],
    performance: [],
    technical: [],
  };
  const seen = new Set<string>();
  const add = (kind: ChangeKind, text: string) => {
    const value = bullet(text);
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    collected[kind].push(value);
  };

  // 1. What the deployment actually touched.
  for (const bucket of ranked) {
    const kind = bucketForArea(bucket.rule.kind, bucket.added > 0 ? "A" : "M");
    if (bucket.added > 0) add(kind, `Added ${bucket.rule.label}`);
    if (bucket.modified > 0) {
      add(
        bucket.added > 0 && kind === "feature" ? "improvement" : kind,
        `Updated ${bucket.rule.label}`,
      );
    }
    if (bucket.removed > 0) {
      add(kind === "feature" ? "improvement" : kind, `Removed ${bucket.rule.label}`);
    }
    if (bucket.added === 0 && bucket.modified === 0 && bucket.removed === 0) {
      add(kind, `Updated ${bucket.rule.label}`);
    }
  }

  // 2. Commit subjects, but only those that read as a description of a change.
  const accepted: ClassifiedCommit[] = [];
  let breaking = false;
  for (const commit of input.commits ?? []) {
    const classified = classifyCommitSubject(commit?.subject ?? "", commit?.body ?? "");
    if (!classified) continue;
    accepted.push(classified);
    if (classified.breaking) breaking = true;
    add(classified.kind, classified.text);
  }

  for (const key of Object.keys(collected) as ChangeKind[]) {
    collected[key] = collected[key].slice(0, MAX_BULLETS_PER_SECTION);
  }

  const totalBullets = (Object.keys(collected) as ChangeKind[]).reduce(
    (sum, key) => sum + collected[key].length,
    0,
  );

  // ---- Title: the areas that actually changed. Never the version, because the
  // page already renders the version next to the title. ---------------------
  let title = FALLBACK_TITLE;
  const significant = ranked.filter((bucket) => areaWeight(bucket) > 0);
  if (significant.length === 1) {
    title = significant[0].rule.title;
  } else if (significant.length > 1) {
    // Only name a second area when it is genuinely comparable to the first,
    // otherwise the title overstates a one-line incidental edit.
    const top = areaWeight(significant[0]);
    const runnerUp = significant
      .slice(1)
      .find((bucket) => areaWeight(bucket) >= top * SECOND_AREA_RATIO);
    title = runnerUp
      ? `${significant[0].rule.title} & ${runnerUp.rule.title}`
      : significant[0].rule.title;
  } else if (accepted.length > 0) {
    title = accepted[0].text.replace(/\.$/, "");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${title.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
  }

  // ---- Summary: one factual sentence about this deployment. ----------------
  let summary = FALLBACK_SUMMARY;
  if (totalBullets > 0) {
    const phrases: string[] = [];
    for (const bucket of ranked.slice(0, 2)) {
      if (bucket.added > 0) phrases.push(`Added ${bucket.rule.label}`);
      else if (bucket.modified > 0) phrases.push(`Updated ${bucket.rule.label}`);
      else if (bucket.removed > 0) phrases.push(`Removed ${bucket.rule.label}`);
    }
    if (phrases.length === 0 && accepted.length > 0) {
      phrases.push(accepted[0].text);
    }

    const sentence =
      phrases.length > 0 ? `${joinAnd(phrases)}.` : FALLBACK_SUMMARY;

    const facts: string[] = [];
    if (files.length > 0) {
      facts.push(`${files.length} file${files.length === 1 ? "" : "s"} changed`);
    }
    if ((diff?.additions ?? 0) > 0 || (diff?.deletions ?? 0) > 0) {
      facts.push(`+${diff?.additions ?? 0}/−${diff?.deletions ?? 0}`);
    }

    summary = facts.length > 0 ? `${sentence} ${facts.join(", ")}.` : sentence;
  }

  // ---- Dominant category. --------------------------------------------------
  let kind: ChangeKind = "technical";
  if (totalBullets > 0) {
    kind = (Object.keys(collected) as ChangeKind[]).reduce((best, key) =>
      collected[key].length > collected[best].length ? key : best,
    );
  }

  return {
    title,
    summary,
    whatsNew: sectionMarkdown([
      { heading: SECTION_HEADINGS.feature, bullets: collected.feature, primary: true },
    ]),
    improvements: sectionMarkdown([
      { heading: SECTION_HEADINGS.improvement, bullets: collected.improvement, primary: true },
      { heading: SECTION_HEADINGS.performance, bullets: collected.performance },
      { heading: SECTION_HEADINGS.technical, bullets: collected.technical },
    ]),
    bugFixes: sectionMarkdown([
      { heading: SECTION_HEADINGS.fix, bullets: collected.fix, primary: true },
    ]),
    securityNotes: sectionMarkdown([
      { heading: SECTION_HEADINGS.security, bullets: collected.security, primary: true },
    ]),
    category: totalBullets > 0 ? CATEGORY_FOR_KIND[kind] : "MAINTENANCE",
    kind,
    breaking,
  };
}
