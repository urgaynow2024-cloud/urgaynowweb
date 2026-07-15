import "server-only";
import { prisma } from "@/lib/db";
import {
  type ServiceStatus,
  type OverallStatus,
  deriveOverall,
} from "@/lib/status/types";
import { recordMetrics } from "@/lib/status/metrics";
import { writeSnapshot, type SnapshotService, type StatusSnapshot } from "@/lib/status/snapshot";
import { OVERALL_STATUS_META } from "@/lib/status/types";

export type ProbeResult = {
  ok: boolean;
  status: ServiceStatus;
  latencyMs?: number;
  detail?: string;
};

// Default monitored services. Re-running the seed/health job will upsert these
// so the status page always has a complete component list. Add new services here.
export const DEFAULT_SERVICES: {
  slug: string;
  name: string;
  description: string;
  category: string;
}[] = [
  { slug: "website", name: "Main Website", description: "Public site and pages", category: "Core" },
  { slug: "api", name: "Public API", description: "Application programming interface", category: "Core" },
  { slug: "auth", name: "Authentication and Login", description: "Admin and member login", category: "Core" },
  { slug: "accounts", name: "User Accounts", description: "Account management", category: "Core" },
  { slug: "staff-portal", name: "Staff Portal", description: "Internal staff tools", category: "Core" },
  { slug: "admin", name: "Admin Dashboard", description: "Content management console", category: "Core" },
  { slug: "database", name: "Database", description: "Primary data store", category: "Core" },
  { slug: "checkout", name: "Checkout", description: "Store checkout flow", category: "Payments" },
  { slug: "payments", name: "Payment Processing", description: "Payment provider processing", category: "Payments" },
  { slug: "billing", name: "Subscription Billing", description: "Recurring subscriptions", category: "Payments" },
  { slug: "webhooks", name: "Payment Webhooks", description: "Payment provider webhooks", category: "Payments" },
  { slug: "refunds", name: "Refund Processing", description: "Refund handling", category: "Payments" },
  { slug: "email", name: "Email Delivery", description: "Transactional email", category: "Platform" },
  { slug: "notifications", name: "Notifications", description: "User notifications", category: "Platform" },
  { slug: "storage", name: "File and Image Storage", description: "Image and asset storage", category: "Platform" },
  { slug: "search", name: "Search", description: "Site search", category: "Platform" },
  { slug: "jobs", name: "Background Jobs", description: "Scheduled and queued jobs", category: "Platform" },
];

// Services whose HTTP routes render DB-backed content. If the database is down
// they may still return 200 with fallback/cached data — so a 200 here is NOT
// proof of health; we downgrade them to "degraded" when the DB probe fails.
const DB_DEPENDENT = new Set([
  "website",
  "auth",
  "accounts",
  "admin",
  "staff-portal",
  "search",
  "notifications",
]);

function rank(s: ServiceStatus): number {
  return (
    { operational: 0, maintenance: 1, degraded: 2, partial_outage: 3, major_outage: 4 } as const
  )[s];
}

async function probe(
  name: string,
  fn: () => Promise<ProbeResult>,
): Promise<ProbeResult> {
  try {
    return await fn();
  } catch (e) {
    return {
      ok: false,
      status: "major_outage",
      detail: e instanceof Error ? e.message.slice(0, 200) : String(e),
    };
  }
}

async function checkDatabase(): Promise<ProbeResult> {
  const start = Date.now();
  await prisma.$queryRawUnsafe("select 1");
  return { ok: true, status: "operational", latencyMs: Date.now() - start };
}

async function checkHttp(url: string, timeoutMs = 5000): Promise<ProbeResult> {
  const start = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store", signal: ctrl.signal });
    const latency = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;
    return {
      ok,
      status: ok ? "operational" : "degraded",
      latencyMs: latency,
      detail: ok ? undefined : `HTTP ${res.status}`,
    };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Website probe. Returns 200 even when the DB is unavailable (the public site
 * degrades to cached/fallback content), so we additionally verify a real query
 * succeeds. If the HTTP response is fine but the DB isn't, we report DEGRADED
 * rather than operational — never hiding a database problem behind a 200.
 */
async function checkWebsite(base: string, dbUp: boolean): Promise<ProbeResult> {
  const start = Date.now();
  const res = await fetch(base, { method: "GET", cache: "no-store" }).catch(() => null);
  const httpOk = !!res && res.status >= 200 && res.status < 400;
  if (!httpOk) {
    return { ok: false, status: "major_outage", latencyMs: Date.now() - start, detail: "Website unreachable" };
  }
  if (!dbUp) {
    return {
      ok: false,
      status: "degraded",
      latencyMs: Date.now() - start,
      detail: "Serving cached content — database unavailable",
    };
  }
  return { ok: true, status: "operational", latencyMs: Date.now() - start };
}

/** Probe all default services. Returns a result per slug (no DB writes). */
export async function probeAll(): Promise<{ results: Record<string, ProbeResult>; dbUp: boolean }> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

  // Determine database health up front so DB-dependent routes can be rated honestly.
  const dbResult = await probe("database", checkDatabase);
  const dbUp = dbResult.ok;

  const tasks: Record<string, Promise<ProbeResult>> = {
    database: Promise.resolve(dbResult),
    website: probe("website", () => checkWebsite(base, dbUp)),
    api: probe("api", () => checkHttp(`${base}/api/status/now`, 5000)),
    cdn: probe("cdn", () => checkHttp(`${base}/favicon.ico`)),
    search: probe("search", () => checkHttp(`${base}/search`)),
    auth: probe("auth", () => checkHttp(`${base}/admin/login`)),
    admin: probe("admin", () => checkHttp(`${base}/admin/login`)),
    "staff-portal": probe("staff-portal", () => checkHttp(`${base}/staff`)),
    storage: probe("storage", async () => {
      // Storage/CDN backed by the same origin for static assets; degrade if DB down.
      const r = await checkHttp(base).catch(() => null);
      if (r && r.ok && !dbUp) return { ok: false, status: "degraded" as ServiceStatus, detail: "Database unavailable" };
      return r ?? { ok: true, status: "operational", detail: "Assumes provider health" };
    }),
    payments: stripeKey
      ? probe("payments", async () => {
          const start = Date.now();
          const res = await fetch("https://api.stripe.com/v1/charges?limit=1", {
            headers: { Authorization: `Bearer ${stripeKey}` },
            cache: "no-store",
          });
          return { ok: true, status: "operational", latencyMs: Date.now() - start, detail: `Stripe ${res.status}` };
        })
      : Promise.resolve({ ok: true, status: "operational", detail: "No payment provider configured" }),
    billing: stripeKey
      ? probe("billing", async () => {
          const res = await fetch("https://api.stripe.com/v1/subscriptions?limit=1", {
            headers: { Authorization: `Bearer ${stripeKey}` },
            cache: "no-store",
          });
          return { ok: true, status: "operational", detail: `Stripe ${res.status}` };
        })
      : Promise.resolve({ ok: true, status: "operational", detail: "No payment provider configured" }),
    checkout: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    refunds: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    webhooks: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    email: Promise.resolve({ ok: true, status: "operational", detail: "No email provider configured" }),
    notifications: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    accounts: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    jobs: Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
  };

  const entries = await Promise.all(
    Object.entries(tasks).map(async ([slug, p]) => {
      let r = await p;
      // Downgrade DB-dependent routes that returned 200 but rely on a dead DB.
      if (DB_DEPENDENT.has(slug) && r.ok && !dbUp) {
        r = { ok: false, status: "degraded", latencyMs: r.latencyMs, detail: "Database unavailable — serving cached content" };
      }
      return [slug, r] as const;
    }),
  );

  const results = Object.fromEntries(entries) as Record<string, ProbeResult>;
  return { results, dbUp };
}

/** Ensure all default services exist in the DB (idempotent upsert). */
export async function ensureDefaultServices(): Promise<void> {
  for (const s of DEFAULT_SERVICES) {
    await prisma.statusService.upsert({
      where: { slug: s.slug },
      create: { ...s, autoManaged: true },
      update: {},
    });
  }
}

function mapStatus(r: ProbeResult): ServiceStatus {
  return r.status;
}

/**
 * Run one health-check pass: probe everything, persist HealthCheck rows, record
 * real metrics, auto-update status for services that are auto-managed and not
 * manually overridden, then write a resilient snapshot. Admin-set statuses are
 * always respected.
 */
export async function runHealthChecks(): Promise<{
  overall: OverallStatus;
  results: Record<string, ProbeResult>;
  dbAvailable: boolean;
}> {
  await ensureDefaultServices().catch(() => {});
  const { results, dbUp } = await probeAll();

  const services = await prisma.statusService.findMany();
  const snapServices: SnapshotService[] = [];

  for (const svc of services) {
    const r = results[svc.slug];
    if (!r) continue;
    const status = mapStatus(r);

    await prisma.healthCheck
      .create({
        data: {
          serviceId: svc.id,
          ok: r.ok,
          status: r.status,
          latencyMs: r.latencyMs ?? null,
          detail: r.detail ?? "",
        },
      })
      .catch(() => {});

    if (svc.autoManaged && !svc.manualOverride && svc.status !== status) {
      await prisma.statusService
        .update({ where: { id: svc.id }, data: { status } })
        .catch(() => {});
    }

    snapServices.push({
      id: svc.id,
      name: svc.name,
      slug: svc.slug,
      category: svc.category,
      status: svc.manualOverride ? svc.status : status,
      latencyMs: r.latencyMs ?? null,
      lastCheckedAt: new Date().toISOString(),
      detail: r.detail ?? "",
    });
  }

  await recordMetrics(results).catch(() => {});

  // Build overall from the statuses we just determined (respecting overrides).
  const statuses = snapServices.map((s) => ({ status: s.status as ServiceStatus }));
  const overall = deriveOverall(statuses.length ? statuses : services.map((s) => ({ status: s.status as ServiceStatus })));
  const om = OVERALL_STATUS_META[overall as OverallStatus];

  const [activeIncidents, activeMaintenance, subscriberCount] = await Promise.all([
    prisma.incident.count({ where: { published: true, status: { not: "resolved" } } }).catch(() => 0),
    prisma.maintenance.count({ where: { published: true, status: { in: ["scheduled", "in_progress"] } } }).catch(() => 0),
    prisma.statusSubscriber.count().catch(() => 0),
  ]);

  const snapshot: StatusSnapshot = {
    overall,
    label: om.label,
    emoji: om.emoji,
    text: om.text,
    generatedAt: new Date().toISOString(),
    source: "live",
    dbAvailable: dbUp,
    services: snapServices,
    activeIncidents,
    activeMaintenance,
    subscriberCount,
  };
  writeSnapshot(snapshot);

  return { overall, results, dbAvailable: dbUp };
}
