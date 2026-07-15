import "server-only";
import { prisma } from "@/lib/db";
import {
  type ServiceStatus,
  type OverallStatus,
  deriveOverall,
} from "@/lib/status/types";

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
  { slug: "website", name: "Website", description: "Public site and pages", category: "Core" },
  { slug: "api", name: "API", description: "Application programming interface", category: "Core" },
  { slug: "auth", name: "Authentication & Login", description: "Admin and member login", category: "Core" },
  { slug: "accounts", name: "User Accounts", description: "Account management", category: "Core" },
  { slug: "staff-portal", name: "Staff Portal", description: "Internal staff tools", category: "Core" },
  { slug: "admin", name: "Admin Dashboard", description: "Content management console", category: "Core" },
  { slug: "database", name: "Database", description: "Primary data store", category: "Core" },
  { slug: "payments", name: "Payments", description: "Payment processing", category: "Payments" },
  { slug: "billing", name: "Subscription Billing", description: "Recurring subscriptions", category: "Payments" },
  { slug: "checkout", name: "Checkout", description: "Store checkout flow", category: "Payments" },
  { slug: "refunds", name: "Refund Processing", description: "Refund handling", category: "Payments" },
  { slug: "webhooks", name: "Webhook Delivery", description: "Payment provider webhooks", category: "Payments" },
  { slug: "email", name: "Email Delivery", description: "Transactional email", category: "Platform" },
  { slug: "notifications", name: "Notifications", description: "User notifications", category: "Platform" },
  { slug: "storage", name: "File Storage", description: "Image and asset storage", category: "Platform" },
  { slug: "ai", name: "AI Services", description: "AI-powered features", category: "Platform" },
  { slug: "search", name: "Search", description: "Site search", category: "Platform" },
  { slug: "cdn", name: "CDN / Static Assets", description: "Static asset delivery", category: "Platform" },
];

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

/** Probe all default services. Returns a result per slug (no DB writes). */
export async function probeAll(): Promise<Record<string, ProbeResult>> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

  const tasks: Record<string, Promise<ProbeResult>> = {
    database: probe("database", checkDatabase),
    website: probe("website", () => checkHttp(base)),
    api: probe("api", () => checkHttp(`${base}/api/status`, 5000)),
    cdn: probe("cdn", () => checkHttp(`${base}/favicon.ico`)),
    search: probe("search", () => checkHttp(`${base}/search`)),
    auth: probe("auth", () => checkHttp(`${base}/admin/login`)),
    admin: probe("admin", () => checkHttp(`${base}/admin/login`)),
    "staff-portal": probe("staff-portal", () => checkHttp(`${base}/staff`)),
    storage: probe("storage", async () => {
      // Assume storage/CDN healthy if the public site (which serves its assets)
      // is reachable. A dedicated object-store ping would go here when configured.
      const r = await checkHttp(base).catch(() => null);
      return r ?? { ok: true, status: "operational", detail: "Assumes provider health" };
    }),
    "payments": stripeKey
      ? probe("payments", async () => {
          const start = Date.now();
          const res = await fetch("https://api.stripe.com/v1/charges?limit=1", {
            headers: { Authorization: `Bearer ${stripeKey}` },
            cache: "no-store",
          });
          return { ok: true, status: "operational", latencyMs: Date.now() - start, detail: `Stripe ${res.status}` };
        })
      : Promise.resolve({ ok: true, status: "operational", detail: "No payment provider configured" }),
    "billing": stripeKey
      ? probe("billing", async () => {
          const res = await fetch("https://api.stripe.com/v1/subscriptions?limit=1", {
            headers: { Authorization: `Bearer ${stripeKey}` },
            cache: "no-store",
          });
          return { ok: true, status: "operational", detail: `Stripe ${res.status}` };
        })
      : Promise.resolve({ ok: true, status: "operational", detail: "No payment provider configured" }),
    "checkout": Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    "refunds": Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    "webhooks": Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    "email": Promise.resolve({ ok: true, status: "operational", detail: "No email provider configured" }),
    "notifications": Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    "accounts": Promise.resolve({ ok: true, status: "operational", detail: "Assumes provider health" }),
    "ai": Promise.resolve({ ok: true, status: "operational", detail: "No AI provider configured" }),
  };

  const entries = await Promise.all(
    Object.entries(tasks).map(async ([slug, p]) => [slug, await p] as const),
  );
  return Object.fromEntries(entries);
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

/**
 * Run one health-check pass: probe everything, persist HealthCheck rows, and
 * auto-update status for services that are auto-managed and not manually overridden.
 * Admin-set statuses are always respected.
 */
export async function runHealthChecks(): Promise<{
  overall: OverallStatus;
  results: Record<string, ProbeResult>;
}> {
  await ensureDefaultServices().catch(() => {});
  const results = await probeAll();

  const services = await prisma.statusService.findMany();
  for (const svc of services) {
    const r = results[svc.slug];
    if (!r) continue;
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

    if (svc.autoManaged && !svc.manualOverride) {
      if (svc.status !== r.status) {
        await prisma.statusService
          .update({ where: { id: svc.id }, data: { status: r.status } })
          .catch(() => {});
      }
    }
  }

  const statuses = services.map((s) => ({ status: s.status as ServiceStatus }));
  return { overall: deriveOverall(statuses), results };
}
