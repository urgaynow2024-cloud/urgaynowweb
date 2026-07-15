import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

// Independent, DB-free cache for the public status snapshot.
//
// The status page must keep rendering during a database or application outage,
// so we persist the last known-good snapshot to a local file (written by the
// health-check job / cron). The public API reads this FIRST, then falls back to
// a live DB read, then to a live probe. This way the page never depends solely
// on the very database it is reporting on.

export type SnapshotService = {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  detail: string;
};

export type StatusSnapshot = {
  overall: string;
  label: string;
  emoji: string;
  text: string;
  generatedAt: string; // ISO; when this snapshot was produced
  source: "snapshot" | "db" | "live" | "fallback";
  dbAvailable: boolean;
  services: SnapshotService[];
  activeIncidents: number;
  activeMaintenance: number;
  subscriberCount: number;
};

const CACHE_DIR = path.join(process.cwd(), ".cache");
const SNAPSHOT_FILE = path.join(CACHE_DIR, "status-snapshot.json");

// Fast in-memory copy (shared across requests on the same server instance).
let memory: { data: StatusSnapshot; at: number } | null = null;

export function writeSnapshot(snapshot: StatusSnapshot): void {
  memory = { data: snapshot, at: Date.now() };
  try {
    // Fire-and-forget; never block the request on disk I/O.
    void fs.mkdir(CACHE_DIR, { recursive: true }).then(() =>
      fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshot), "utf8").catch(() => {}),
    );
  } catch {
    /* ignore — memory cache still works */
  }
}

export function readSnapshot(): StatusSnapshot | null {
  if (memory) return memory.data;
  return null;
}

/** Best-effort synchronous read from the file (used only when memory is cold). */
export function readSnapshotFromFile(): StatusSnapshot | null {
  try {
    const text = require("node:fs").readFileSync(SNAPSHOT_FILE, "utf8");
    return JSON.parse(text) as StatusSnapshot;
  } catch {
    return null;
  }
}

export function snapshotAgeMs(snapshot: StatusSnapshot): number {
  return Date.now() - new Date(snapshot.generatedAt).getTime();
}
