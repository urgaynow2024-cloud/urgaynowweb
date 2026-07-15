"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  SERVICE_STATUSES,
  INCIDENT_STATUSES,
  MAINTENANCE_STATUSES,
  isActiveIncident,
} from "@/lib/status/types";
import { notifySubscribers, announceToStatusWebhook } from "@/lib/status/notifications";

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}
function arr(v: FormDataEntryValue | null): string[] {
  return str(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const VALID_SERVICE = new Set(SERVICE_STATUSES);
const VALID_INCIDENT = new Set(INCIDENT_STATUSES);
const VALID_MAINT = new Set(MAINTENANCE_STATUSES);

// ---- Services -------------------------------------------------------------

export async function ensureServices() {
  await requireAdmin();
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com"}/api/status/now`, {
    method: "POST",
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) throw new Error("health check failed");
  revalidatePath("/admin/status");
  revalidatePath("/status");
}

export async function updateServiceStatus(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  const manualOverride = formData.get("manualOverride") === "on";
  if (!id || !VALID_SERVICE.has(status as any)) redirect("/admin/status?error=1");
  await prisma.statusService.update({
    where: { id },
    data: { status, manualOverride },
  });
  revalidatePath("/admin/status");
  revalidatePath("/status");
  redirect("/admin/status");
}

// ---- Incidents ------------------------------------------------------------

export async function createIncident(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title"));
  const description = str(formData.get("description"));
  const status = str(formData.get("status")) || "investigating";
  const impact = str(formData.get("impact")) || "minor";
  const serviceIds = arr(formData.get("serviceIds"));
  if (!title) redirect("/admin/status/incidents/new?error=1");
  if (!VALID_INCIDENT.has(status as any)) redirect("/admin/status/incidents/new?error=1");

  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      status,
      impact,
      services: { create: serviceIds.map((sid) => ({ serviceId: sid })) },
      updates: { create: { message: description || title, status } },
    },
  });

  await notifySubscribers({
    title: `📢 Incident: ${title}`,
    body: `Status: ${status}. ${description}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com"}/status`,
  }).catch(() => {});
  await announceToStatusWebhook({
    title: `Incident: ${title}`,
    body: `${status} — ${description}`,
  }).catch(() => {});

  revalidatePath("/admin/status/incidents");
  revalidatePath("/status");
  redirect(`/admin/status/incidents/${incident.id}`);
}

export async function addIncidentUpdate(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const message = str(formData.get("message"));
  const status = str(formData.get("status"));
  if (!id || !message || !VALID_INCIDENT.has(status as any)) redirect(`/admin/status/incidents/${id}?error=1`);

  const data: any = { message, status };
  if (status === "resolved") data.resolvedAt = new Date();

  await prisma.incident.update({ where: { id }, data });
  await notifySubscribers({
    title: `Incident update: ${status}`,
    body: message,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com"}/status`,
  }).catch(() => {});

  revalidatePath("/admin/status/incidents");
  revalidatePath("/status");
  redirect(`/admin/status/incidents/${id}`);
}

// ---- Maintenance -----------------------------------------------------------

export async function createMaintenance(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title"));
  const description = str(formData.get("description"));
  const status = str(formData.get("status")) || "scheduled";
  const startAt = str(formData.get("startAt"));
  const endAt = str(formData.get("endAt"));
  const serviceIds = arr(formData.get("serviceIds"));
  if (!title || !startAt || !endAt) redirect("/admin/status/maintenance/new?error=1");
  if (!VALID_MAINT.has(status as any)) redirect("/admin/status/maintenance/new?error=1");

  const m = await prisma.maintenance.create({
    data: {
      title,
      description,
      status,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      services: { create: serviceIds.map((sid) => ({ serviceId: sid })) },
      updates: { create: { message: description || title } },
    },
  });
  revalidatePath("/admin/status/maintenance");
  revalidatePath("/status");
  redirect(`/admin/status/maintenance/${m.id}`);
}

export async function addMaintenanceUpdate(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const message = str(formData.get("message"));
  if (!id || !message) redirect(`/admin/status/maintenance/${id}?error=1`);

  await prisma.maintenanceUpdate.create({ data: { maintenanceId: id, message } });
  revalidatePath("/admin/status/maintenance");
  revalidatePath("/status");
  redirect(`/admin/status/maintenance/${id}`);
}

export { isActiveIncident };
