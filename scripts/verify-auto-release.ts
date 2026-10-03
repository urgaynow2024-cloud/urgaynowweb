/**
 * End-to-end verification of the automatic release flow:
 *
 *   push -> production deployment -> update created -> version generated
 *        -> update published -> /updates shows it -> no duplicates
 *
 * Runs against a real server (default http://localhost:3210) and the real
 * database. Every row it creates uses a synthetic commit SHA and is deleted
 * again at the end, so no fake update is ever left public.
 *
 *   node scripts/verify-auto-release.ts [baseUrl]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = (process.argv[2] || process.env.SITE_URL || "http://localhost:3210").replace(/\/$/, "");
const REPOSITORY = "urgaynow2024-cloud/urgaynowweb";

function readDotEnv(): Record<string, string> {
  try {
    const raw = readFileSync(join(process.cwd(), ".env"), "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      out[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const dotEnv = readDotEnv();
const SECRET = process.env.RELEASE_CRON_SECRET || dotEnv.RELEASE_CRON_SECRET || "";

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

interface ReleaseResponse {
  status: number;
  body: any;
}

async function post(payload: unknown, secret = SECRET): Promise<ReleaseResponse> {
  const response = await fetch(`${BASE_URL}/api/releases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 300);
  }
  return { status: response.status, body };
}

async function get(secret = SECRET): Promise<ReleaseResponse> {
  const response = await fetch(`${BASE_URL}/api/releases`, {
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 300);
  }
  return { status: response.status, body };
}

/**
 * The Supabase pooler occasionally drops an idle connection mid-run. Retrying
 * keeps a transient network blip from turning into a false failure — and keeps
 * cleanup from leaving a probe row behind.
 */
async function retry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

function fakeSha(): string {
  return randomBytes(20).toString("hex");
}

function payloadFor(sha: string, deploymentId: string, state = "ready", commits?: unknown) {
  return {
    headSha: sha,
    branch: "main",
    repository: REPOSITORY,
    deploymentId,
    deployment: { target: "production", state },
    commits:
      commits ?? [
        {
          sha,
          subject: "fix: verification probe for the automatic release pipeline",
          body: "",
          author: "verification",
          date: new Date().toISOString(),
        },
      ],
  };
}

function parseVersion(version: string): number[] | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function higher(a: string, b: string): boolean {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return false;
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] > right[i];
  }
  return false;
}

async function main() {
  console.log(`\nAutomatic release verification against ${BASE_URL}\n`);

  if (!SECRET) {
    console.error(
      "RELEASE_CRON_SECRET is not set in the environment or .env — the endpoint fails closed without it.",
    );
    process.exit(1);
  }

  // Synthetic SHAs: never a real commit, so the probe can never collide with a
  // genuine release for the commit that is being deployed.
  const shaA = fakeSha();
  const shaB = fakeSha();
  const created: string[] = [];

  // A previous run that was interrupted before its cleanup step can leave probe
  // rows behind. Every probe deployment id starts with this prefix, so sweeping
  // them is precise and can never touch a real release.
  const stale = await prisma.update.findMany({
    where: { deploymentId: { startsWith: "dpl_probe_" } },
    select: { id: true, version: true, slug: true },
  });
  if (stale.length > 0) {
    await prisma.update.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
    console.log(
      `Swept ${stale.length} probe update(s) left by an interrupted run: ${stale.map((s) => `v${s.version}`).join(", ")}\n`,
    );
  }

  const baseline = await prisma.update.findMany({
    where: { publishedAt: { not: null } },
    select: { id: true, version: true, slug: true },
  });
  const baselineIds = baseline.map((u) => u.id);
  console.log(`Baseline: ${baseline.length} published update(s) — ${baseline.map((u) => `v${u.version}`).join(", ") || "none"}\n`);
  check("baseline contains at least one published update (nothing destroyed)", baseline.length >= 1);

  console.log("\nSecurity guards");
  const noAuth = await post(payloadFor(shaA, "dpl_probe_noauth"), "");
  check("unauthenticated request rejected with 401", noAuth.status === 401, `got ${noAuth.status}`);
  check("unauthenticated request created no update", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 0);

  const badSecret = await post(payloadFor(shaA, "dpl_probe_badsecret"), "not-the-secret");
  check("wrong secret rejected with 401", badSecret.status === 401, `got ${badSecret.status}`);

  const wrongRepo = await post({ ...payloadFor(shaA, "dpl_probe_repo"), repository: "attacker/evil" });
  check("foreign repository rejected with 403", wrongRepo.status === 403, `got ${wrongRepo.status}`);
  check("foreign repository created no update", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 0);

  const badSha = await post(payloadFor("not-a-sha", "dpl_probe_sha"));
  check("malformed commit SHA rejected with 400", badSha.status === 400, `got ${badSha.status}`);

  console.log("\nFailed deployments must not publish");
  const failedBuild = await post(payloadFor(shaA, "dpl_probe_failed", "error"));
  check("failed build rejected with 422", failedBuild.status === 422, `got ${failedBuild.status}`);
  check("failed build created no update", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 0);

  const preview = await post({ ...payloadFor(shaA, "dpl_probe_preview"), deployment: { target: "preview", state: "ready" } });
  check("preview deployment rejected with 422", preview.status === 422, `got ${preview.status}`);
  check("preview deployment created no update", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 0);

  const stillUnauth = await get("");
  check("GET /api/releases requires the secret", stillUnauth.status === 401, `got ${stillUnauth.status}`);
  const authed = await get();
  check("GET /api/releases responds for the release workflow", authed.status === 200, `got ${authed.status}`);

  console.log("\nSuccessful production deployment");
  const first = await post(payloadFor(shaA, "dpl_probe_A"));
  check("release created with 200", first.status === 200, `got ${first.status}: ${JSON.stringify(first.body)}`);
  check("response reports the update was created", first.body?.updateCreated === true);

  const rowsA = await prisma.update.findMany({ where: { sourceCommit: shaA } });
  check("exactly one update row for the commit", rowsA.length === 1, `got ${rowsA.length}`);
  if (rowsA.length === 1) {
    const row = rowsA[0];
    created.push(row.id);
    check("update is published (publishedAt set)", row.publishedAt !== null);
    check("update status is PUBLISHED", row.releaseStatus === "PUBLISHED", row.releaseStatus);
    check("update is marked auto-generated", row.generatedAutomatically === true);
    check("commit SHA stored as the idempotency key", row.sourceCommit === shaA);
    check("deployment id stored", row.deploymentId === "dpl_probe_A", row.deploymentId ?? "null");
    check("branch stored", row.sourceBranch === "main", row.sourceBranch ?? "null");
    check("commit subject recorded in the changelog", row.summary.includes("automatic release pipeline"), row.summary);
    check("generated version is higher than every existing version", baseline.every((u) => higher(row.version, u.version)), `v${row.version}`);
    check("version is a valid semantic version", parseVersion(row.version) !== null, row.version);
  }

  console.log("\n/updates reflects the new version immediately");
  let html = "";
  try {
    const page = await fetch(`${BASE_URL}/updates`, { headers: { "Cache-Control": "no-cache" } });
    html = await page.text();
    check("/updates responds 200", page.status === 200, `got ${page.status}`);
    check("/updates lists the new version", rowsA.length === 1 && html.includes(`v${rowsA[0].version}`));
    check("/updates links the new update page", rowsA.length === 1 && html.includes(`/updates/${rowsA[0].slug}`));
    check("/updates still lists pre-existing updates", baselineIds.every((id) => {
      const row = baseline.find((u) => u.id === id);
      return row ? html.includes(row.slug) : true;
    }));
    if (rowsA.length === 1) {
      const detail = await fetch(`${BASE_URL}/updates/${rowsA[0].slug}`);
      const detailHtml = await detail.text();
      check("new update detail page responds 200", detail.status === 200, `got ${detail.status}`);
      check("detail page shows the version", detailHtml.includes(`v${rowsA[0].version}`));
    }
  } catch (error) {
    check("/updates could be fetched", false, String(error));
  }

  console.log("\nIdempotency: the same push processed twice");
  const replay = await post(payloadFor(shaA, "dpl_probe_A"));
  check("replay responds 200", replay.status === 200, `got ${replay.status}`);
  check("replay reports already released", replay.body?.alreadyReleased === true);
  check("replay returns the original update id", replay.body?.updateId === rowsA[0]?.id);
  check("replay created no second row", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 1);

  console.log("\nRollback / redeploy of the same commit");
  const redeploy = await post(payloadFor(shaA, "dpl_probe_A_redeploy"));
  check("redeploy responds 200", redeploy.status === 200, `got ${redeploy.status}`);
  check("redeploy created no second row", (await prisma.update.count({ where: { sourceCommit: shaA } })) === 1);
  const afterRedeploy = await prisma.update.findFirst({ where: { sourceCommit: shaA } });
  check("redeploy updated the deployment id on the same record", afterRedeploy?.deploymentId === "dpl_probe_A_redeploy", afterRedeploy?.deploymentId ?? "null");
  check("redeploy did not change the version", afterRedeploy?.version === rowsA[0]?.version);

  console.log("\nEvery push gets its own update");
  const second = await post(payloadFor(shaB, "dpl_probe_B"));
  check("second push created an update", second.status === 200 && second.body?.updateCreated === true, `got ${second.status}`);
  const rowsB = await prisma.update.findMany({ where: { sourceCommit: shaB } });
  check("second push has exactly one row", rowsB.length === 1, `got ${rowsB.length}`);
  if (rowsA.length === 1 && rowsB.length === 1) {
    created.push(rowsB[0].id);
    check("second push got a different, higher version", rowsB[0].version !== rowsA[0].version && higher(rowsB[0].version, rowsA[0].version), `${rowsA[0].version} -> ${rowsB[0].version}`);
    check("second push has a different slug", rowsB[0].slug !== rowsA[0].slug);
  }

  console.log("\nChangelog content is populated from real commit messages");
  const shaC = fakeSha();
  const plainCommits = [
    { sha: shaC, subject: "Add community reviews page with staff moderation", body: "", author: "staff", date: "" },
    { sha: shaC, subject: "Fix review moderation actions failing with a foreign key error", body: "", author: "staff", date: "" },
    { sha: shaC, subject: "Reduce homepage database and main-thread work", body: "", author: "staff", date: "" },
  ];
  const plain = await post(payloadFor(shaC, "dpl_probe_plain", "ready", plainCommits));
  check("release from non-conventional commit subjects created", plain.status === 200, `got ${plain.status}`);
  const plainRow = plain.body?.updateId ? await prisma.update.findUnique({ where: { id: plain.body.updateId } }) : null;
  if (plainRow) {
    created.push(plainRow.id);
    const content = `${plainRow.whatsNew}\n${plainRow.improvements}\n${plainRow.bugFixes}`;
    check("'Add ...' commit landed in What's New", plainRow.whatsNew.includes("community reviews page"), JSON.stringify(plainRow.whatsNew));
    check("'Fix ...' commit landed in Bug Fixes", plainRow.bugFixes.includes("foreign key error"), JSON.stringify(plainRow.bugFixes));
    check("'Reduce ...' commit landed in Improvements", plainRow.improvements.includes("homepage database"), JSON.stringify(plainRow.improvements));
    check("no commit message was dropped", plainCommits.every((c) => content.includes(c.subject)));
    check("feature commits produce a MINOR version", plainRow.type === "MINOR", plainRow.type);
    check("summary is not the placeholder", plainRow.summary !== "No changes recorded", plainRow.summary);
  } else {
    check("release row was created", false, JSON.stringify(plain.body));
  }

  console.log("\nConcurrent pushes must not collide on a version");
  const raceShas = [fakeSha(), fakeSha(), fakeSha()];
  const raced = await Promise.all(
    raceShas.map((sha) => post(payloadFor(sha, `dpl_probe_race_${sha.slice(0, 6)}`))),
  );
  check("all concurrent releases succeeded", raced.every((r) => r.status === 200 && r.body?.updateCreated === true), raced.map((r) => r.status).join(","));
  const raceRows = await prisma.update.findMany({ where: { sourceCommit: { in: raceShas } }, select: { id: true, version: true, slug: true, sourceCommit: true } });
  created.push(...raceRows.map((r) => r.id));
  check("one row per concurrent push", raceRows.length === raceShas.length, `got ${raceRows.length}`);
  check("no duplicate version among concurrent pushes", new Set(raceRows.map((r) => r.version)).size === raceRows.length, raceRows.map((r) => r.version).join(","));

  console.log("\nCleanup");
  // Retry so a transient pooler drop cannot leave a probe row published.
  let deleted: { count: number } = { count: 0 };
  let cleanupError: unknown = null;
  try {
    deleted = await retry(() => prisma.update.deleteMany({ where: { id: { in: created } } }));
  } catch (error) {
    cleanupError = error;
  }
  check("probe updates removed", !cleanupError && deleted.count === created.length, cleanupError ? String(cleanupError) : `removed ${deleted.count} of ${created.length}`);
  const remaining = await retry(() =>
    prisma.update.findMany({ where: { publishedAt: { not: null } }, select: { id: true, version: true } }),
  );
  check("published updates restored to baseline", remaining.length === baseline.length, `${remaining.length} vs ${baseline.length}`);
  check("no probe rows left behind", remaining.every((u) => baselineIds.includes(u.id)));
  check("pre-existing update untouched", baseline.every((b) => remaining.some((r) => r.id === b.id && r.version === b.version)));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main()
  .catch((error) => {
    console.error("Verification crashed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });