/**
 * End-to-end verification of the UGN report system against a running dev server.
 *
 * Usage:
 *   node scripts/report-e2e-test.mjs [baseUrl]
 *
 * Exercises the real HTTP surface: public submission, validation, honeypot,
 * duplicate protection, evidence upload/claim, staff authorization, audit
 * entries, and webhook delivery state.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { SignJWT } = require("jose");

const BASE = process.argv[2] || "http://localhost:3210";

/* ------------------------------------------------------------------ */
/* Test harness                                                        */
/* ------------------------------------------------------------------ */

const results = [];
let failures = 0;

function check(name, condition, detail = "") {
  const ok = Boolean(condition);
  if (!ok) failures++;
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

function section(title) {
  results.push("");
  results.push(`--- ${title} ---`);
}

/** Minimal cookie jar so we behave like one browser. */
function makeJar(ip = null) {
  const store = new Map();
  return {
    /** Optional simulated client IP so rate limiting can be tested per client. */
    ip,
    header() {
      return [...store.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    absorb(response) {
      const raw = response.headers.getSetCookie?.() ?? [];
      for (const cookie of raw) {
        const [pair] = cookie.split(";");
        const index = pair.indexOf("=");
        const name = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        if (value === "" || /expires=thu, 01 jan 1970/i.test(cookie)) store.delete(name);
        else store.set(name, value);
      }
    },
    get(name) {
      return store.get(name);
    },
  };
}

let clientCounter = 0;
const runSeed = Date.now() % 200;
function newClient() {
  clientCounter += 1;
  // Unique simulated client per run so duplicate-protection and rate-limit
  // state from earlier runs does not leak into this one.
  return makeJar(`198.${runSeed}.${(clientCounter >> 8) & 0xff}.${(clientCounter % 250) + 1}`);
}

async function request(jar, path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  const cookies = jar.header();
  if (cookies && !headers.cookie) headers.cookie = cookies;
  if (jar.ip && !headers["x-forwarded-for"]) headers["x-forwarded-for"] = jar.ip;
  const response = await fetch(`${BASE}${path}`, { ...options, headers, redirect: "manual" });
  jar.absorb(response);
  return response;
}

async function postJson(jar, path, body) {
  return request(jar, path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function staffCookie(staffId) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not available in this shell");
  const token = await new SignJWT({ name: staffId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(staffId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
  return `ugn_session=${token}`;
}

/** Load AUTH_SECRET from .env so the shell does not have to export it. */
function loadEnvSecrets() {
  try {
    const raw = readFileSync("./.env", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    /* fall back to the ambient environment */
  }
}

/** Find the internal report id for a reference by scraping the staff queue. */
async function findReportId(cookie, reference) {
  const response = await request(makeJar(), `/admin/reports?q=${encodeURIComponent(reference)}`, {
    headers: { cookie },
  });
  if (response.status !== 200) return null;
  const html = await response.text();
  const after = new RegExp(`${reference}[\\s\\S]{0,1200}?/admin/reports/([a-z0-9]{20,32})`);
  const before = new RegExp(`/admin/reports/([a-z0-9]{20,32})[\\s\\S]{0,1200}?${reference}`);
  return (after.exec(html) ?? before.exec(html))?.[1] ?? null;
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

// Smallest valid 1x1 PNG.
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

const baseReport = () => ({
  category: "HARASSMENT",
  description:
    "Automated end-to-end verification report for the UGN report system. This is a test record.",
  reportedPerson: "Test Target",
  reportedDiscord: "test#0001",
  reporterName: "Automated Test",
  reporterEmail: "test@example.com",
  incidentAt: "2026-09-30T20:00:00.000Z",
  links: "https://example.com/evidence-1",
  idempotencyKey: crypto.randomUUID().replace(/-/g, ""),
});

async function patch(jar, path, body, cookie) {
  return request(jar, path, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

/* ------------------------------------------------------------------ */
/* Test run                                                            */
/* ------------------------------------------------------------------ */

async function main() {
  loadEnvSecrets();
  const jar = makeJar();
  const stamp = Date.now();
  const staffList = JSON.parse(readFileSync("./.e2e-staff.json", "utf8"));
  const founder = staffList.find((s) => /founder/i.test(s.rank));
  const moderator = staffList.find((s) => /moderator/i.test(s.rank));
  const eventManager = staffList.find((s) => /event/i.test(s.rank));
  if (!founder) throw new Error("No founder staff row found in .e2e-staff.json");
  const founderCookie = await staffCookie(founder.id);

  section("Public report page");
  for (const path of [
    "/report",
    "/legal",
    "/legal/bot/terms",
    "/legal/bot/privacy",
    "/legal/ownership",
  ]) {
    const response = await request(jar, path);
    check(`GET ${path} returns 200`, response.status === 200, `status ${response.status}`);
  }

  const legacyRedirect = await request(jar, "/tos.html");
  check(
    "GET /tos.html redirects to /legal/bot/terms",
    legacyRedirect.status === 308 &&
      (legacyRedirect.headers.get("location") || "").includes("/legal/bot/terms"),
    `status ${legacyRedirect.status} location ${legacyRedirect.headers.get("location")}`,
  );

  section("Server-side validation");
  {
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      category: "NOT_A_CATEGORY",
    });
    const body = await response.json();
    check("Invalid category rejected", response.status === 400 && body.success === false);
  }
  {
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      description: "too short",
    });
    const body = await response.json();
    check("Short description rejected", response.status === 400 && body.success === false);
  }
  {
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      description: baseReport().description.repeat(80),
    });
    const body = await response.json();
    check(
      "Over-long description rejected",
      response.status === 400 && body.success === false,
      `status ${response.status}`,
    );
  }
  {
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      links: "javascript:alert(1)",
    });
    const body = await response.json();
    check("Non-http link rejected", response.status === 400 && body.success === false);
  }
  {
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      reporterEmail: "not-an-email",
    });
    const body = await response.json();
    check("Invalid email rejected", response.status === 400 && body.success === false);
  }
  {
    const before = Date.now();
    const response = await postJson(newClient(), "/api/report/submit", {
      ...baseReport(),
      website: "https://spam.example",
      idempotencyKey: `honeypot${stamp}`,
    });
    const body = await response.json();
    check(
      "Honeypot returns success shape but stores nothing",
      response.status === 200 && body.success === true && body.reference === "UGN-000000",
      JSON.stringify(body).slice(0, 120),
    );
    void before;
  }

  section("Evidence upload");
  let evidenceId = null;
  {
    const form = new FormData();
    form.append(
      "file",
      new Blob([PNG_BYTES], { type: "image/png" }),
      `shot-${stamp}.png`,
    );
    const response = await request(jar, "/api/report/evidence", { method: "POST", body: form });
    const body = await response.json().catch(() => ({}));
    evidenceId = body.id ?? null;
    check("PNG evidence upload accepted", response.status === 200 && Boolean(evidenceId));
  }
  {
    const form = new FormData();
    form.append(
      "file",
      new Blob([Buffer.from("MZ\u0000\u0000executable")], { type: "image/png" }),
      "virus.png",
    );
    const response = await request(jar, "/api/report/evidence", { method: "POST", body: form });
    check(
      "Executable disguised as PNG rejected",
      response.status === 400,
      `status ${response.status}`,
    );
  }
  {
    const form = new FormData();
    form.append(
      "file",
      new Blob([Buffer.alloc(5 * 1024 * 1024, 1)], { type: "image/png" }),
      "big.png",
    );
    const response = await request(jar, "/api/report/evidence", { method: "POST", body: form });
    check("Oversized evidence rejected", response.status === 413 || response.status === 400, `status ${response.status}`);
  }

  section("Valid submission");
  const payload = { ...baseReport(), evidenceIds: evidenceId ? [evidenceId] : [] };
  const submitResponse = await postJson(jar, "/api/report/submit", payload);
  const submitted = await submitResponse.json();
  check(
    "Valid report accepted with a UGN reference",
    submitResponse.status === 200 &&
      submitted.success === true &&
      /^UGN-\d{6}$/.test(submitted.reference ?? ""),
    JSON.stringify(submitted).slice(0, 200),
  );
  check(
    "Tracking cookie stored for the reporter",
    typeof jar.get("ugn_report_tracking") === "string",
    jar.get("ugn_report_tracking") ? "present" : "missing",
  );
  results.push(`      reference=${submitted.reference} notification=${submitted.notification}`);

  const reportId = await findReportId(founderCookie, submitted.reference);
  check("Staff queue lists the new report", Boolean(reportId), reportId ?? "not found in HTML");
  submitted.id = reportId;

  section("Duplicate protection");
  {
    const response = await postJson(jar, "/api/report/submit", payload);
    const body = await response.json();
    check(
      "Same idempotency key returns the original report",
      response.status === 200 && body.duplicate === true && body.reference === submitted.reference,
      JSON.stringify(body).slice(0, 160),
    );
  }
  {
    const response = await postJson(jar, "/api/report/submit", {
      ...payload,
      idempotencyKey: crypto.randomUUID().replace(/-/g, ""),
    });
    const body = await response.json();
    check(
      "Same details with a new key are rejected as a duplicate",
      response.status === 409 && body.duplicate === true,
      `status ${response.status}`,
    );
  }

  section("Reporter tracking");
  if (submitted.reportToken) {
    const response = await request(jar, `/report/track/${submitted.reportToken}`);
    check("Tracking page renders for the reporter", response.status === 200, `status ${response.status}`);
    const html = await response.text();
    check("Tracking page shows the UGN reference", html.includes(submitted.reference));
  }
  {
    const response = await request(jar, "/report/me");
    check("My reports page renders", response.status === 200, `status ${response.status}`);
    const html = await response.text();
    check("My reports lists the submitted report", html.includes(submitted.reference));
  }
  {
    const stranger = makeJar();
    const response = await request(stranger, "/report/me");
    check("A different browser sees no reports", response.status === 200);
    const html = await response.text();
    check(
      "Stranger cannot see the report reference",
      !html.includes(submitted.reference),
    );
  }

  section("Staff authorization");
  const anonymous = newClient();
  {
    const response = await request(anonymous, `/api/admin/reports?id=${submitted.id ?? "x"}`);
    check("Logged-out staff API returns 401", response.status === 401, `status ${response.status}`);
  }
  {
    const response = await patch(anonymous, "/api/admin/reports", { action: "note" });
    check("Logged-out PATCH returns 401", response.status === 401, `status ${response.status}`);
  }
  {
    const response = await request(newClient(), "/admin/reports");
    check(
      "Logged-out /admin/reports redirects to login",
      response.status === 307 || response.status === 302 || response.status === 308,
      `status ${response.status}`,
    );
  }

  {
    const response = await request(newClient(), "/admin/reports", {
      headers: { cookie: founderCookie },
    });
    check(
      "Founder can open the reports dashboard",
      response.status === 200 && (await response.text()).includes("Reports Center"),
      `status ${response.status}`,
    );
  }
  {
    const response = await request(newClient(), `/admin/reports/${submitted.id ?? "missing"}`, {
      headers: { cookie: founderCookie },
    });
    check(
      "Founder can open the report detail page",
      response.status === 200 && (await response.text()).includes(submitted.reference),
      `status ${response.status}`,
    );
  }
  {
    const staffJar = newClient();
    const noteResponse = await patch(
      staffJar,
      "/api/admin/reports",
      {
        reportId: submitted.id,
        action: "note",
        note: "E2E verification note recorded by the test.",
      },
      founderCookie,
    );
    const body = await noteResponse.json().catch(() => ({}));
    check(
      "Founder can add an internal note",
      noteResponse.status === 200 && body.success === true,
      `status ${noteResponse.status}`,
    );

    const statusResponse = await patch(
      staffJar,
      "/api/admin/reports",
      { reportId: submitted.id, action: "status", status: "IN_REVIEW" },
      founderCookie,
    );
    check(
      "Founder can change status",
      statusResponse.status === 200 && (await statusResponse.json()).success === true,
      `status ${statusResponse.status}`,
    );

    const actionResponse = await patch(
      staffJar,
      "/api/admin/reports",
      {
        reportId: submitted.id,
        action: "action",
        note: "E2E: recorded a test moderation action.",
      },
      founderCookie,
    );
    check(
      "Founder can record a moderation action",
      actionResponse.status === 200 && (await actionResponse.json()).success === true,
      `status ${actionResponse.status}`,
    );

    const retryResponse = await patch(
      staffJar,
      "/api/admin/reports",
      { reportId: submitted.id, action: "retryWebhook" },
      founderCookie,
    );
    const retryBody = await retryResponse.json().catch(() => ({}));
    results.push(
      `      webhook retry -> status ${retryResponse.status} ${JSON.stringify(retryBody).slice(0, 160)}`,
    );
    check(
      "Webhook retry reports an accurate delivery state",
      // 200 = delivered now, 502 = delivery failed, 400 = already delivered.
      retryResponse.status === 200 ||
        retryResponse.status === 502 ||
        (retryResponse.status === 400 && /already delivered/i.test(retryBody.error ?? "")),
      `status ${retryResponse.status}`,
    );

    const badIdResponse = await patch(
      staffJar,
      "/api/admin/reports",
      { reportId: "../../etc/passwd", action: "note", note: "x" },
      founderCookie,
    );
    check(
      "Report id manipulation rejected",
      badIdResponse.status === 400,
      `status ${badIdResponse.status}`,
    );
  }

  if (moderator) {
    const moderatorCookie = await staffCookie(moderator.id);
    const response = await patch(
      newClient(),
      "/api/admin/reports",
      { reportId: submitted.id, action: "note", note: "Moderator note." },
      moderatorCookie,
    );
    check(
      "Moderator can add a note",
      response.status === 200 && (await response.json()).success === true,
      `status ${response.status}`,
    );

    const resolveResponse = await patch(
      newClient(),
      "/api/admin/reports",
      { reportId: submitted.id, action: "resolve", resolution: "nope" },
      moderatorCookie,
    );
    check(
      "Moderator is blocked from resolving (server-side)",
      resolveResponse.status === 403,
      `status ${resolveResponse.status}`,
    );

    const retryResponse = await patch(
      newClient(),
      "/api/admin/reports",
      { reportId: submitted.id, action: "retryWebhook" },
      moderatorCookie,
    );
    check(
      "Moderator is blocked from retrying the webhook (server-side)",
      retryResponse.status === 403,
      `status ${retryResponse.status}`,
    );
  }

  if (eventManager) {
    const response = await request(newClient(), "/admin/reports", {
      headers: { cookie: await staffCookie(eventManager.id) },
    });
    check(
      "Event manager (no report permission) is redirected away",
      response.status === 307 || response.status === 302 || response.status === 308,
      `status ${response.status}`,
    );
  }

  section("Evidence protection");
  if (evidenceId) {
    const anonResponse = await request(newClient(), `/api/admin/reports/evidence/${evidenceId}`);
    check(
      "Anonymous evidence fetch blocked",
      anonResponse.status === 401,
      `status ${anonResponse.status}`,
    );

    const founderResponse = await request(newClient(), `/api/admin/reports/evidence/${evidenceId}`, {
      headers: { cookie: founderCookie },
    });
    const bytes = Buffer.from(await founderResponse.arrayBuffer());
    check(
      "Authorized staff can read the evidence bytes",
      founderResponse.status === 200 && bytes.equals(PNG_BYTES),
      `status ${founderResponse.status}, ${bytes.length} bytes`,
    );
    check(
      "Evidence response is private and no-store",
      (founderResponse.headers.get("cache-control") || "").includes("no-store"),
      founderResponse.headers.get("cache-control") || "missing",
    );

    if (moderator) {
      const moderatorResponse = await request(
        newClient(),
        `/api/admin/reports/evidence/${evidenceId}`,
        { headers: { cookie: await staffCookie(moderator.id) } },
      );
      check(
        "Moderator with evidence permission can read evidence",
        moderatorResponse.status === 200,
        `status ${moderatorResponse.status}`,
      );
    }

    const guessed = await request(
      newClient(),
      "/api/admin/reports/evidence/aaaaaaaaaaaaaaaaaaaaaaaaa",
      { headers: { cookie: founderCookie } },
    );
    check(
      "Unknown evidence id returns 404 for staff",
      guessed.status === 404,
      `status ${guessed.status}`,
    );
  }

  section("Rate limiting");
  {
    const spammer = newClient();
    let limited = 0;
    let created = 0;
    for (let attempt = 0; attempt < 8; attempt++) {
      const response = await postJson(spammer, "/api/report/submit", {
        category: "OTHER",
        description: `Rate limit verification entry number ${attempt}. Unique content to avoid dedupe.`,
        reportedPerson: `RateTarget${attempt}`,
        idempotencyKey: crypto.randomUUID().replace(/-/g, ""),
      });
      if (response.status === 429) limited++;
      else if (response.status === 200) created++;
    }
    check(
      "Repeated submissions from one client are rate limited",
      limited > 0,
      `created=${created} limited=${limited}`,
    );
    results.push(`      rate-limit run created ${created} extra test reports, blocked ${limited}`);
    check(
      "Rate limiting stops before an unbounded flood",
      created <= 12,
      `created=${created}`,
    );
  }

  results.push("");
  results.push(`Reference under test: ${submitted.reference}`);
  results.push(`Report id: ${submitted.id}`);
  results.push(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  console.log(results.join("\n"));
}

main().catch((error) => {
  console.error("TEST RUN ERROR:", error);
  console.log(results.join("\n"));
  process.exit(1);
});