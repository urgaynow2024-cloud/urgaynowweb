import "server-only";

import { cookies } from "next/headers";
import { generateToken } from "@/lib/request-security";

/**
 * Evidence upload tokens.
 *
 * Uploads are stored as bytes with no public URL. A report can only claim the
 * uploads that belong to the visitor's own random token, which lives in an
 * httpOnly cookie. This is what stops one visitor attaching another visitor's
 * evidence by guessing an id.
 */

export const EVIDENCE_COOKIE = "ugn_evidence";
const MAX_TOKENS = 12;

function parseCookieValue(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((token) => token.trim())
    .filter((token) => /^[A-Za-z0-9_-]{16,64}$/.test(token))
    .slice(0, MAX_TOKENS);
}

export async function readEvidenceTokens(): Promise<string[]> {
  try {
    return parseCookieValue(cookies().get(EVIDENCE_COOKIE)?.value);
  } catch {
    return [];
  }
}

export async function ensureEvidenceToken(): Promise<string> {
  const existing = await readEvidenceTokens();
  if (existing.length > 0) return existing[0];
  const token = generateToken(24);
  writeEvidenceCookie(token);
  return token;
}

/** Store one or more tracking tokens in the httpOnly evidence cookie. */
export async function writeEvidenceCookie(...tokens: Array<string | null | undefined>) {
  const current = await readEvidenceTokens();
  const next = [...current];
  for (const token of tokens) {
    if (token && /^[A-Za-z0-9_-]{16,64}$/.test(token) && !next.includes(token)) {
      next.push(token);
    }
  }
  cookies().set(EVIDENCE_COOKIE, next.slice(0, MAX_TOKENS).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

/**
 * Tracking tokens for reports this browser submitted. Used by /report/me so a
 * visitor can follow their own reports without an account.
 */
export const TRACKING_COOKIE = "ugn_report_tracking";

export async function readTrackingTokens(): Promise<string[]> {
  try {
    const value = cookies().get(TRACKING_COOKIE)?.value;
    if (!value) return [];
    return value
      .split(",")
      .map((token) => token.trim())
      .filter((token) => token.length >= 16 && token.length <= 64)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export async function writeTrackingToken(token: string) {
  const current = await readTrackingTokens();
  if (!current.includes(token)) current.unshift(token);
  cookies().set(TRACKING_COOKIE, current.slice(0, 20).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}