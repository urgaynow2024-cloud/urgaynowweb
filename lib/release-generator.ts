import { execSync } from "child_process";
import { prisma } from "./db";

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
    const subject = commit.subject.toLowerCase();
    const fullMessage = `${commit.subject}\n${commit.body}`.toLowerCase();

    const isBreaking = subject.includes("breaking change") || subject.startsWith("!") || fullMessage.includes("breaking change:");

    if (isBreaking) {
      result.breaking.push(commit);
      continue;
    }

    if (subject.startsWith("feat:")) {
      result.features.push(commit);
    } else if (subject.startsWith("fix:")) {
      result.fixes.push(commit);
    } else if (subject.startsWith("perf:") || subject.startsWith("refactor:")) {
      result.improvements.push(commit);
    } else if (subject.startsWith("docs:")) {
      result.docs.push(commit);
    } else if (subject.startsWith("chore:") || subject.startsWith("build:") || subject.startsWith("ci:") || subject.startsWith("test:") || subject.startsWith("style:")) {
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

export async function getLatestPublishedVersion(): Promise<string> {
  const latest = await prisma.update.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { version: true },
  });

  return latest?.version ?? "0.0.0";
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
  const improvements = formatCommitList([...classified.improvements, ...classified.docs, ...classified.chore]);
  const bugFixes = formatCommitList(classified.fixes);
  const securityNotes = formatCommitList(classified.breaking);

  const allChanges = [
    ...classified.features,
    ...classified.fixes,
    ...classified.improvements,
    ...classified.docs,
    ...classified.chore,
    ...classified.breaking,
  ];

  const summary = allChanges.length > 0
    ? `${allChanges.length} change${allChanges.length !== 1 ? "s" : ""} in this release`
    : "No changes recorded";

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

export async function createReleaseFromCommits(
  headSha: string,
  previousSha: string | null,
  branch: string,
  deploymentId?: string
): Promise<{ updateId: string; releaseInfo: ReleaseInfo } | null> {
  const fromSha = previousSha ?? execGit("rev-list --max-parents=0 HEAD");
  const commits = getCommitsBetween(fromSha, headSha);

  if (commits.length === 0) return null;

  const classified = classifyCommits(commits);
  const versionType = determineVersionType(classified);
  const latestVersion = await getLatestPublishedVersion();
  const newVersion = incrementVersion(latestVersion, versionType);

  const releaseInfo = generateReleaseInfo(classified, newVersion, versionType);

  const slugBase = releaseInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const slug = `${slugBase}-${newVersion.replace(/\./g, "-")}`;

  const update = await prisma.update.create({
    data: {
      slug,
      version: releaseInfo.version,
      type: releaseInfo.type,
      category: releaseInfo.type === "MAJOR" ? "NEW" : releaseInfo.type === "MINOR" ? "IMPROVEMENT" : "FIX",
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

  return { updateId: update.id, releaseInfo };
}