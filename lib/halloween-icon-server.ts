import "server-only";

import { existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { HALLOWEEN_ICON_PATH } from "@/lib/halloween";

/**
 * Build-time check for the official UGN Halloween icon.
 *
 * The icon is used exactly as supplied and never regenerated. Checking the file
 * here (server side, once per render pass) means the client never has to probe
 * for a missing asset, which avoids 404 noise and broken images.
 */
export function hasHalloweenIcon(path: string = HALLOWEEN_ICON_PATH): boolean {
  if (!path.startsWith("/")) return false;
  const relative = normalize(path).replace(/^([/\\])+/, "");
  if (!relative || relative.includes("..")) return false;
  return existsSync(join(process.cwd(), "public", relative));
}