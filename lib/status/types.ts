// Shared status vocabulary for the public System Status page and admin console.
// Kept as plain string unions (not Prisma enums) to match the rest of the
// schema (string columns) and to stay flexible as new services are added.

export type ServiceStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

export type OverallStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentImpact = "none" | "minor" | "major" | "critical";

export type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

export const SERVICE_STATUSES: ServiceStatus[] = [
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
  "maintenance",
];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  "investigating",
  "identified",
  "monitoring",
  "resolved",
];

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
];

export const SERVICE_CATEGORIES = ["Core", "Platform"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

type Meta = { label: string; emoji: string; tone: string; text: string };

export const SERVICE_STATUS_META: Record<ServiceStatus, Meta> = {
  operational: { label: "Operational", emoji: "🟢", tone: "emerald", text: "text-emerald-600 dark:text-emerald-400" },
  degraded: { label: "Degraded Performance", emoji: "🟡", tone: "amber", text: "text-amber-600 dark:text-amber-400" },
  partial_outage: { label: "Partial Outage", emoji: "🔴", tone: "orange", text: "text-orange-600 dark:text-orange-400" },
  major_outage: { label: "Major Outage", emoji: "🔴", tone: "red", text: "text-red-600 dark:text-red-400" },
  maintenance: { label: "Under Maintenance", emoji: "🔵", tone: "sky", text: "text-sky-600 dark:text-sky-400" },
};

export const OVERALL_STATUS_META: Record<OverallStatus, Meta> = {
  operational: { label: "All Systems Operational", emoji: "🟢", tone: "emerald", text: "text-emerald-600 dark:text-emerald-400" },
  degraded: { label: "Degraded Performance", emoji: "🟡", tone: "amber", text: "text-amber-600 dark:text-amber-400" },
  partial_outage: { label: "Partial Outage", emoji: "🔴", tone: "orange", text: "text-orange-600 dark:text-orange-400" },
  major_outage: { label: "Major Outage", emoji: "🔴", tone: "red", text: "text-red-600 dark:text-red-400" },
  maintenance: { label: "Scheduled Maintenance", emoji: "🔵", tone: "sky", text: "text-sky-600 dark:text-sky-400" },
};

export const INCIDENT_STATUS_META: Record<IncidentStatus, Meta> = {
  investigating: { label: "Investigating", emoji: "🔍", tone: "amber", text: "text-amber-600 dark:text-amber-400" },
  identified: { label: "Identified", emoji: "🛠️", tone: "orange", text: "text-orange-600 dark:text-orange-400" },
  monitoring: { label: "Monitoring", emoji: "👀", tone: "sky", text: "text-sky-600 dark:text-sky-400" },
  resolved: { label: "Resolved", emoji: "✅", tone: "emerald", text: "text-emerald-600 dark:text-emerald-400" },
};

export const MAINTENANCE_STATUS_META: Record<MaintenanceStatus, Meta> = {
  scheduled: { label: "Scheduled", emoji: "📅", tone: "sky", text: "text-sky-600 dark:text-sky-400" },
  in_progress: { label: "In Progress", emoji: "🔧", tone: "amber", text: "text-amber-600 dark:text-amber-400" },
  completed: { label: "Completed", emoji: "✅", tone: "emerald", text: "text-emerald-600 dark:text-emerald-400" },
};

export const INCIDENT_IMPACT_META: Record<IncidentImpact, Meta> = {
  none: { label: "None", emoji: "🟢", tone: "emerald", text: "text-emerald-600 dark:text-emerald-400" },
  minor: { label: "Minor", emoji: "🟡", tone: "amber", text: "text-amber-600 dark:text-amber-400" },
  major: { label: "Major", emoji: "🟠", tone: "orange", text: "text-orange-600 dark:text-orange-400" },
  critical: { label: "Critical", emoji: "🔴", tone: "red", text: "text-red-600 dark:text-red-400" },
};

/** Worst-of aggregation used to compute the overall platform status. */
export function deriveOverall(services: { status: ServiceStatus }[]): OverallStatus {
  const set = new Set(services.map((s) => s.status));
  if (set.has("major_outage")) return "major_outage";
  if (set.has("partial_outage")) return "partial_outage";
  if (set.has("degraded")) return "degraded";
  if (set.size === 1 && set.has("maintenance")) return "maintenance";
  if (set.has("maintenance")) return "degraded";
  return "operational";
}

export function isActiveIncident(status: IncidentStatus): boolean {
  return status !== "resolved";
}

export function isActiveMaintenance(status: MaintenanceStatus): boolean {
  return status === "scheduled" || status === "in_progress";
}

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  published: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Maintenance = {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  startAt: Date;
  endAt: Date;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};
