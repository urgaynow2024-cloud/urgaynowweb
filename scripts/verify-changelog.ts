/**
 * Unit checks for the changelog generator (no database, no server).
 *
 *   npm run test:changelog
 *
 * The point of these checks is that public changelog text is grounded in the
 * deployment: real file paths produce real bullets, instruction-style commit
 * subjects are rejected, and a deployment with nothing describable falls back to a
 * neutral sentence rather than inventing content.
 */
import {
  buildChangelog,
  classifyCommitSubject,
  areaForPath,
} from "../lib/changelog";

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
}

// ---------------------------------------------------------------------------
console.log("\nArea detection maps paths to visitor-facing language");
// ---------------------------------------------------------------------------
check(
  "community reviews files map to the reviews area",
  areaForPath("app/reviews/page.tsx").label === "community reviews",
  areaForPath("app/reviews/page.tsx").label,
);
check(
  "report files map to the report area",
  areaForPath("app/report/page.tsx").label === "the report and support system",
  areaForPath("app/report/page.tsx").label,
);
check(
  "middleware is security",
  areaForPath("middleware.ts").kind === "security",
  areaForPath("middleware.ts").kind,
);
check(
  "prisma migrations are technical",
  areaForPath("prisma/migrations/2026_x/migration.sql").kind === "technical",
);
check(
  "the workflow is technical",
  areaForPath(".github/workflows/auto-release.yml").kind === "technical",
);
check(
  "seasonal theme files map to the theme area",
  areaForPath("app/globals.css").label === "the site's styling",
  areaForPath("app/globals.css").label,
);
check(
  "an unknown path still resolves",
  areaForPath("totally/unknown.bin").label.length > 0,
);

// ---------------------------------------------------------------------------
console.log("\nCommit subjects are only used when they describe a change");
// ---------------------------------------------------------------------------
check(
  "'Add community reviews page' becomes a feature bullet",
  classifyCommitSubject("Add community reviews page with staff moderation")?.text ===
    "Added community reviews page with staff moderation",
  JSON.stringify(classifyCommitSubject("Add community reviews page with staff moderation")),
);
check(
  "'Fix ...' becomes a fix bullet",
  classifyCommitSubject("Fix review moderation actions failing with a foreign key error")?.kind === "fix",
);
check(
  "'Reduce ...' becomes a performance bullet",
  classifyCommitSubject("Reduce homepage database and main-thread work")?.kind === "performance",
);
check(
  "conventional prefixes are honoured",
  classifyCommitSubject("feat: add gallery filters")?.text === "Added gallery filters",
  JSON.stringify(classifyCommitSubject("feat: add gallery filters")),
);
check(
  "conventional 'perf:' forces the performance category",
  classifyCommitSubject("perf: cache the staff query")?.kind === "performance",
);

// The rejections that matter most: internal instruction text.
const REJECTED = [
  "Wait for the deployment before calling the site",
  "Record the live push to deployment to update run",
  "Publish a website update automatically for every successful deployment",
  "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
  "Update .github/workflows/auto-release.yml",
  "Use npx prisma generate",
  "Review the secret handling in the release route",
  "Check the branch protection rules",
  "Fix",
  "",
];
for (const subject of REJECTED) {
  check(
    `rejected: "${subject.slice(0, 52)}${subject.length > 52 ? "…" : ""}"`,
    classifyCommitSubject(subject) === null,
    JSON.stringify(classifyCommitSubject(subject)),
  );
}

// ---------------------------------------------------------------------------
console.log("\nA real deployment diff produces a readable changelog");
// ---------------------------------------------------------------------------
const reviewsRelease = buildChangelog({
  commits: [
    { subject: "Add community reviews page with staff moderation", body: "" },
  ],
  diff: {
    files: [
      { status: "A", path: "app/reviews/page.tsx" },
      { status: "A", path: "app/api/reviews/route.ts" },
      { status: "A", path: "app/admin/reviews/page.tsx" },
      { status: "M", path: "lib/reviews.ts" },
      { status: "M", path: "lib/nav-links.ts" },
    ],
    additions: 620,
    deletions: 40,
  },
});

check(
  "title names the area, not the version",
  reviewsRelease.title === "Community Reviews",
  reviewsRelease.title,
);
check(
  "title never contains a version",
  !/\d+\.\d+\.\d+/.test(reviewsRelease.title),
  reviewsRelease.title,
);
check(
  "summary describes what was added",
  /Added community reviews/.test(reviewsRelease.summary),
  reviewsRelease.summary,
);
check(
  "summary reports the factual change size",
  /5 files changed/.test(reviewsRelease.summary) &&
    /\+620\/−40/.test(reviewsRelease.summary),
  reviewsRelease.summary,
);
check(
  "features list what was added",
  section(reviewsRelease.whatsNew).some((line) => /Added community reviews/.test(line)),
  reviewsRelease.whatsNew,
);
check(
  "improvements list what was updated",
  section(reviewsRelease.improvements).some((line) => /Updated community reviews/.test(line)),
  reviewsRelease.improvements,
);
check(
  "a new feature area yields a MINOR release",
  reviewsRelease.kind === "feature" && reviewsRelease.category === "NEW",
  `${reviewsRelease.kind}/${reviewsRelease.category}`,
);
check(
  "no bullet is empty or a bare heading",
  [reviewsRelease.whatsNew, reviewsRelease.improvements]
    .join("\n")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("- ") && !line.startsWith("### ")).length === 0,
);

// ---------------------------------------------------------------------------
console.log("\nMixed deployments are split into labelled categories");
// ---------------------------------------------------------------------------
const mixed = buildChangelog({
  commits: [
    { subject: "Fix review moderation actions failing with a foreign key error", body: "" },
    { subject: "Reduce homepage database and main-thread work", body: "" },
  ],
  diff: {
    files: [
      { status: "M", path: "middleware.ts" },
      { status: "M", path: "prisma/schema.prisma" },
      { status: "M", path: "app/globals.css" },
      { status: "M", path: "app/api/theme/route.ts" },
      { status: "A", path: "app/guides/page.tsx" },
    ],
    additions: 210,
    deletions: 180,
  },
});

check(
  "security changes land in the security field",
  /Hardened|Added|Updated/.test(mixed.securityNotes) && mixed.securityNotes.length > 0,
  mixed.securityNotes,
);
check(
  "performance changes are labelled",
  /### Performance/.test(mixed.improvements) || /Reduced/.test(mixed.improvements),
  mixed.improvements,
);
check(
  "technical changes are labelled",
  /### Technical/.test(mixed.improvements),
  mixed.improvements,
);
check(
  "fixes are labelled",
  section(mixed.bugFixes).some((line) => /Fixed review moderation/.test(line)),
  mixed.bugFixes,
);
check(
  "features are labelled",
  /Added guides/.test(mixed.whatsNew),
  mixed.whatsNew,
);
check(
  "title combines the two most significant areas",
  mixed.title.includes("&"),
  mixed.title,
);

// ---------------------------------------------------------------------------
console.log("\nInstruction-only deployments do not leak internal text");
// ---------------------------------------------------------------------------
const internalOnly = buildChangelog({
  commits: [
    { subject: "Wait for the deployment before calling the site", body: "" },
    { subject: "Record the live push to deployment to update run", body: "" },
  ],
  diff: {
    files: [{ status: "M", path: ".github/workflows/auto-release.yml" }],
    additions: 12,
    deletions: 4,
  },
});

const internalText = [
  internalOnly.title,
  internalOnly.summary,
  internalOnly.whatsNew,
  internalOnly.improvements,
  internalOnly.bugFixes,
  internalOnly.securityNotes,
].join("\n");

check(
  "no commit subject leaks into public content",
  !internalText.includes("Wait for the deployment") &&
    !internalText.includes("Record the live push"),
  internalText,
);
check(
  "the real file change is still described",
  /automatic release system/.test(internalText),
  internalText,
);

// ---------------------------------------------------------------------------
console.log("\nAn undescribable deployment falls back safely");
// ---------------------------------------------------------------------------
const empty = buildChangelog({ commits: [], diff: null });
check(
  "fallback summary is neutral and factual",
  empty.summary === "Website update deployed successfully.",
  empty.summary,
);
check(
  "fallback title is neutral",
  empty.title === "Website Update",
  empty.title,
);
check(
  "no invented sections",
  [empty.whatsNew, empty.improvements, empty.bugFixes, empty.securityNotes].every(
    (section) => section === "",
  ),
  JSON.stringify(empty),
);
check("fallback is not breaking", empty.breaking === false);

const onlyInstructions = buildChangelog({
  commits: [{ subject: "Wait for the deployment before calling the site", body: "" }],
  diff: { files: [], additions: 0, deletions: 0 },
});
check(
  "an instruction-only commit with no diff also falls back",
  onlyInstructions.summary === "Website update deployed successfully.",
  onlyInstructions.summary,
);

// ---------------------------------------------------------------------------
console.log("\nBreaking changes are detected");
// ---------------------------------------------------------------------------
const breaking = buildChangelog({
  commits: [{ subject: "Add new theme API", body: "BREAKING CHANGE: the old helper is gone" }],
  diff: { files: [{ status: "M", path: "lib/themes.ts" }], additions: 10, deletions: 5 },
});
check("breaking change is flagged", breaking.breaking === true);

// ---------------------------------------------------------------------------
console.log("\nOutput stays bounded");
// ---------------------------------------------------------------------------
const huge = buildChangelog({
  commits: Array.from({ length: 60 }, (_, i) => ({
    subject: `Fix thing number ${i} in the community reviews system`,
    body: "",
  })),
  diff: {
    files: Array.from({ length: 400 }, (_, i) => ({
      status: i % 5 === 0 ? "A" : "M",
      path: `app/page-${i}/route.ts`,
    })),
    additions: 100000,
    deletions: 50000,
  },
});
check("bug fixes are capped at 10 bullets", section(huge.bugFixes).length <= 10, `${section(huge.bugFixes).length}`);
check("title is capped", huge.title.length <= 70, `${huge.title.length}`);
check("summary is a single sentence", (huge.summary.match(/\./g) || []).length <= 2, huge.summary);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);