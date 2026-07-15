"use server";

import { redirect } from "next/navigation";
import { createSession, setSessionCookie, clearSessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function login(formData: FormData): Promise<void> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    redirect("/admin/login?error=1&reason=notconfigured");
  }

  if (username !== expectedUser || password !== expectedPassword) {
    redirect("/admin/login?error=1");
  }

  const token = await createSession(username);
  setSessionCookie(token);
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
