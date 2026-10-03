import { execSync } from "child_process";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { suggestCategory } from "./update-utils";

export interface CommitInfo {
  sha: string;
  subject: string;
  body: string;
  author: string;
  date: string;
}

export interface ClassifiedCommits {
  breaking: CommitInfo[];
  features: CommitInfo[];
  fixes: CommitInfo[];
  improvements: CommitInfo[];
  docs: CommitInfo[];
  chore: CommitInfo[];
  other: CommitInfo[];
}

export interface ReleaseInfo {
  version: string;
  type: "MAJOR" | "MINOR" | "PATCH";
  title: string;
  summary: string;
  whatsNew: string;
  improvements: string;
  bugFixes: string;
  securityNotes: string;
}

function execGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: "utf-8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

export function getCommitsBetween(fromSha: string, toSha: string): CommitInfo[] {
  const format = "%H|%s|%b|%an|%ai";
  const log = execGit(`log --format="${format}" ${fromSha}..${toSha}`);
  if (!log) return [];

  return log.split("\n").map((line) => {
    const [sha, subject, body, author, date] = line.split("|");
    return { sha, subject, body, author, date };
  });
}

/**
 * Conventional-commit prefixes stay authoritative. Most UGN commits are written
 * as plain English ("Fix review moderation actions..."), so a small set of
 * leading-word heuristics keeps the changelog and the version type meaningful
 * instead of classifying everything as an unlabelled change.
 */
const FEATURE_LEAD = /^(feat|feature|add|added|adds|adding|introduce|introduces|implement|implements|create|creates|launch|launches|enable|enables|build)\b/i;
const FIX_LEAD = /^(fix|fixes|fixed|resolve|resolves|resolved|repair|repairs|correct|corrects|address|addresses|hotfix|revert)\b/i;
const IMPROVEMENT_LEAD = /^(perf|performance|optimi[sz]e|optimi[sz]es|optimi[sz]ed|refactor|refactors|clean|cleanse|cleanup|simplify|simplifies|reduce|reduces|improve|improves|improvement|tweak|tweaks|polish|refresh|redesign|update|updates|migrate|migrates|rename|renames)\b/i;
const DOCS_LEAD = /^(docs?|documentation)\b/i;
const CHORE_LEAD = /^(chore|build|ci|test|tests|style|release|version|bump|lint|format)\b/i;

export function classifyCommits(commits: CommitInfo[]): ClassifiedCommits {
  const result: ClassifiedCommits = {
    breaking: [],
    features: [],
    fixes: [],
    improvements: [],
    docs: [],
    chore: [],
    other: [],
  };

  for (const commit of commits) {
    const subject = commit.subject;
    const lower = subject.toLowerCase();
    const fullMessage = `${subject}\n${commit.body}`.toLowerCase();

    const isBreaking = lower.includes("breaking change") || subject.startsWith("!") || fullMessage.includes("breaking change:");

    if (isBreaking) {
      result.breaking.push(commit);
      continue;
    }

    const conventional = /^(feat|fix|perf|refactor|docs|chore|build|ci|test|style|perf)!?:\s*/.exec(lower);
    const lead = conventional ? conventional[0] : "";

    if (lead.startsWith("feat")) {
      result.features.push(commit);
    } else if (lead.startsWith("fix")) {
      result.fixes.push(commit);
    } else if (lead.startsWith("perf") || lead.startsWith("refactor")) {
      result.improvements.push(commit);
    } else if (lead.startsWith("docs")) {
      result.docs.push(commit);
    } else if (
      lead.startsWith("chore") ||
      lead.startsWith("build") ||
      lead.startsWith("ci") ||
      lead.startsWith("test") ||
      lead.startsWith("style")
    ) {
      result.chore.push(commit);
    } else if (FEATURE_LEAD.test(subject)) {
      result.features.push(commit);
    } else if (FIX_LEAD.test(subject)) {
      result.fixes.push(commit);
    } else if (IMPROVEMENT_LEAD.test(subject)) {
      result.improvements.push(commit);
    } else if (DOCS_LEAD.test(subject)) {
      result.docs.push(commit);
    } else if (CHORE_LEAD.test(subject)) {
      result.chore.push(commit);
    } else {
      result.other.push(commit);
    }
  }

  return result;
}

export function determineVersionType(classified: ClassifiedCommits): "MAJOR" | "MINOR" | "PATCH" {
  if (classified.breaking.length > 0) return "MAJOR";
  if (classified.features.length > 0) return "MINOR";
  return "PATCH";
}

/** Parse a semantic version, tolerating a leading "v". Returns null if not MAJOR.MINOR.PATCH. */
export function parseVersion(version: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Numeric version comparison. The changelog column is a plain string, so any
 * lexicographic sort puts "1.9.0" above "1.10.0" and silently corrupts the
 * sequence. Unparseable versions always sort below parseable ones.
 */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left && !right) return a.localeCompare(b);
  if (!left) return -1;
  if (!right) return 1;
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

/**
 * The version the next automatic release increments from: the highest semantic
 * version among *published* updates. Publication order is deliberately ignored
 * because staff can back-date or re-publish an entry at any time, which would
 * otherwise hand back a stale base version and create duplicates.
 */
export async function getLatestPublishedVersion(): Promise<string> {
  const published = await prisma.update.findMany({
    where: { publishedAt: { not: null } },
    select: { version: true },
  });

  const parseable = published
    .map((u) => u.version)
    .filter((version): version is string => Boolean(version) && parseVersion(version) !== null);

  if (parseable.length === 0) return "0.0.0";

  return parseable.sort(compareVersions)[parseable.length - 1];
}

export function incrementVersion(version: string, type: "MAJOR" | "MINOR" | "PATCH"): string {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return "1.0.0";

  if (type === "MAJOR") return `${parts[0] + 1}.0.0`;
  if (type === "MINOR") return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function formatCommitList(commits: CommitInfo[]): string {
  if (commits.length === 0) return "";
  return commits.map((c) => `- ${c.subject}`).join("\n");
}

function sanitizeForRelease(text: string): string {
  return text
    .replace(/((?:password|secret|token|key|credential|api[_-]?key)\s*[:=]\s*)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}/g, "[REDACTED]")
    .replace(/sk-[A-Za-z0-9]{48}/g, "[REDACTED]")
    .replace(/xoxb-[A-Za-z0-9-]{50,}/g, "[REDACTED]")
    .replace(/[A-Za-z0-9+/]{40,}={0,2}/g, "[REDACTED]");
}

export function generateReleaseInfo(
  classified: ClassifiedCommits,
  version: string,
  type: "MAJOR" | "MINOR" | "PATCH"
): ReleaseInfo {
  const typeLabels: Record<"MAJOR" | "MINOR" | "PATCH", string> = {
    MAJOR: "Major Release",
    MINOR: "Feature Release",
    PATCH: "Patch Release",
  };

  const whatsNew = formatCommitList(classified.features);
  // `other` is the catch-all for commits that match no pattern. It is listed
  // rather than dropped, so a push can never produce an empty changelog.
  const improvements = formatCommitList([
    ...classified.improvements,
    ...classified.docs,
    ...classified.chore,
    ...classified.other,
  ]);
  const bugFixes = formatCommitList(classified.fixes);
  const securityNotes = formatCommitList(classified.breaking);

  const allChanges = [
    ...classified.features,
    ...classified.fixes,
    ...classified.improvements,
    ...classified.docs,
    ...classified.chore,
    ...classified.other,
    ...classified.breaking,
  ];

  const summary =
    allChanges.length === 0
      ? "No changes recorded"
      : allChanges.length === 1 && allChanges[0].subject
        ? allChanges[0].subject
        : `${allChanges.length} changes in this release`;

  const title = `v${version} — ${typeLabels[type]}`;

  return {
    version,
    type,
    title,
    summary: sanitizeForRelease(summary),
    whatsNew: sanitizeForRelease(whatsNew),
    improvements: sanitizeForRelease(improvements),
    bugFixes: sanitizeForRelease(bugFixes),
    securityNotes: sanitizeForRelease(securityNotes),
  };
}

export async function getPreviousReleaseCommit(): Promise<string | null> {
  const latest = await prisma.update.findFirst({
    where: {
      publishedAt: { not: null },
      sourceCommit: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    select: { sourceCommit: true },
  });

  return latest?.sourceCommit ?? null;
}

export interface CreateReleaseInput {
  /** Full 40-character git SHA of the deployed commit. Unique idempotency key. */
  headSha: string;
  /**
   * The commits that make up this deployment. Supplied by the caller (the
   * release workflow already has the repository checked out) because a deployed
   * serverless function has no `.git` directory and cannot run `git log`.
   */
  commits: CommitInfo[];
  branch?: string | null;
  deploymentId?: string | null;
  previousSha?: string | null;
}

export interface CreateReleaseResult {
  updateId: string;
  slug: string;
  version: string;
  releaseInfo: ReleaseInfo;
  /** False when an update for this commit already existed (replay / redeploy). */
  created: boolean;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

/** The release already recorded for a commit, if any. */
export async function findReleaseByCommit(
  headSha: string,
): Promise<Awaited<ReturnType<typeof prisma.update.findUnique>>> {
  return prisma.update.findUnique({ where: { sourceCommit: headSha } });
}

/**
 * Creates the published update for a successful production deployment.
 *
 * Idempotent on `headSha`, which carries a @unique constraint: replaying the
 * same webhook/workflow for the same deployment returns the existing record
 * instead of writing a second one. `created` reports which happened.
 *
 * Concurrent pushes can both read the same latest version, so a unique
 * violation on the version-derived slug is retried against a freshly read base
 * version rather than surfacing as an error.
 */
export async function createReleaseFromCommits(
  input: CreateReleaseInput,
): Promise<CreateReleaseResult | null> {
  const {
    headSha,
    commits,
    branch = "main",
    deploymentId = null,
    previousSha = null,
  } = input;

  if (commits.length === 0) return null;

  const classified = classifyCommits(commits);
  const versionType = determineVersionType(classified);

  const existing = await findReleaseByCommit(headSha);
  if (existing) {
    // Keep the newest deployment id so a rollback/redeploy does not look like a
    // new release, but never create a duplicate record.
    if (deploymentId && deploymentId !== existing.deploymentId) {
      await prisma.update.update({
        where: { id: existing.id },
        data: { deploymentId },
      });
    }
    return {
      updateId: existing.id,
      slug: existing.slug,
      version: existing.version,
      releaseInfo: {
        version: existing.version,
        type: existing.type,
        title: existing.title,
        summary: existing.summary,
        whatsNew: existing.whatsNew,
        improvements: existing.improvements,
        bugFixes: existing.bugFixes,
        securityNotes: existing.securityNotes,
      },
      created: false,
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const baseVersion = await getLatestPublishedVersion();
    const version = incrementVersion(baseVersion, versionType);
    const releaseInfo = generateReleaseInfo(classified, version, versionType);
    const slug = `${toSlug(releaseInfo.title)}-${version.replace(/\./g, "-")}`;

    try {
      const update = await prisma.update.create({
        data: {
          slug,
          version: releaseInfo.version,
          type: releaseInfo.type,
          category: suggestCategory(versionType),
          title: releaseInfo.title,
          summary: releaseInfo.summary,
          whatsNew: releaseInfo.whatsNew,
          improvements: releaseInfo.improvements,
          bugFixes: releaseInfo.bugFixes,
          securityNotes: releaseInfo.securityNotes,
          authorId: "system",
          featured: false,
          publishedAt: new Date(),
          sourceCommit: headSha,
          sourcePreviousCommit: previousSha,
          sourceBranch: branch,
          deploymentId,
          generatedAutomatically: true,
          releaseStatus: "PUBLISHED",
        },
      });

      return { updateId: update.id, slug, version: releaseInfo.version, releaseInfo, created: true };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      // Lost a race: either this exact commit was just released, or a
      // concurrent release took the version we computed.
      const raced = await findReleaseByCommit(headSha);
      if (raced) {
        return {
          updateId: raced.id,
          slug: raced.slug,
          version: raced.version,
          releaseInfo,
          created: false,
        };
      }
    }
  }

  throw new Error(
    `Could not allocate a version for commit ${headSha} after 3 attempts.`,
  );
}