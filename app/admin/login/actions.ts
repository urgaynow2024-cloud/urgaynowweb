"use server";

import { redirect } from "next/navigation";
import { createSession, setSessionCookie, clearSessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { recordMetric, updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export async function login(formData: FormData): Promise<void> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    const now = new Date();
    const bucketStart = getBucketStart(1, now);
    await Promise.all([
      updateMetricBucket({
        metricKey: "auth_failure_count",
        bucketStart,
        bucketSize: 1,
        value: 1,
        unit: "fail",
        source: "auth-login",
        environment: "production",
        isSuccess: false,
        isFailure: true,
      }).catch(() => {}),
    ]).catch(() => {});
    redirect("/admin/login?error=1&reason=notconfigured");
  }

  if (username !== expectedUser || password !== expectedPassword) {
    const now = new Date();
    const bucketStart = getBucketStart(1, now);
    await Promise.all([
      updateMetricBucket({
        metricKey: "auth_failure_count",
        bucketStart,
        bucketSize: 1,
        value: 1,
        unit: "fail",
        source: "auth-login",
        environment: "production",
        isSuccess: false,
        isFailure: true,
      }).catch(() => {}),
    ]).catch(() => {});
    redirect("/admin/login?error=1");
  }

  const token = await createSession(username);
  setSessionCookie(token);

  const now = new Date();
  const bucketStart = getBucketStart(1, now);
  await Promise.all([
    updateMetricBucket({
      metricKey: "auth_success_count",
      bucketStart,
      bucketSize: 1,
      value: 1,
      unit: "ok",
      source: "auth-login",
      environment: "production",
      isSuccess: true,
      isFailure: false,
    }).catch(() => {}),
  ]).catch(() => {});

  redirect("/admin");
}

export async function logout(): Promise<void> {
  clearSessionCookie();
  redirect("/admin/login");
}

export async function getCurrentAdmin(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return token ? usernameFromToken(token) : null;
}

function usernameFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
