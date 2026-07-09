"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function fail(path: string) {
  redirect(`${path}?error=1`);
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const vrchatWorldUrl = String(formData.get("vrchatWorldUrl") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const startRaw = String(formData.get("startDateTime") || "");
  const endRaw = String(formData.get("endDateTime") || "");
  const published = formData.get("published") === "on";

  if (!title || !startRaw) fail("/admin/events/new");
  const startDateTime = new Date(startRaw);
  const endDateTime = endRaw ? new Date(endRaw) : null;

  try {
    await prisma.event.create({
      data: { title, description, location, vrchatWorldUrl, coverImage, startDateTime, endDateTime, published },
    });
  } catch {
    fail("/admin/events/new");
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const vrchatWorldUrl = String(formData.get("vrchatWorldUrl") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const startRaw = String(formData.get("startDateTime") || "");
  const endRaw = String(formData.get("endDateTime") || "");
  const published = formData.get("published") === "on";

  if (!title || !startRaw) fail(`/admin/events/${id}`);
  const startDateTime = new Date(startRaw);
  const endDateTime = endRaw ? new Date(endRaw) : null;

  try {
    await prisma.event.update({
      where: { id },
      data: { title, description, location, vrchatWorldUrl, coverImage, startDateTime, endDateTime, published },
    });
  } catch {
    fail(`/admin/events/${id}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await prisma.event.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/events");
  redirect("/admin/events");
}
