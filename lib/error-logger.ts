import "server-only";
import { prisma } from "@/lib/db";

/**
 * Persist a client-side error so staff can review it later.
 * Never logs the full stack trace — only the message and digest,
 * which is safe to expose to the public.
 */
export async function logClientError(
  message: string,
  digest?: string,
  path?: string,
): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        message: String(message).slice(0, 500),
        digest: digest ? String(digest).slice(0, 100) : null,
        path: path ? String(path).slice(0, 500) : null,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
      },
    });
  } catch {
    // Never let error logging crash the app — it's best-effort.
  }
}