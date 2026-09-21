import { deleteThemeSchedule } from "../actions";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const scheduleId = url.pathname.split("/").pop() || "";
  if (scheduleId) {
    await deleteThemeSchedule(scheduleId);
  }
  return new Response(null, { status: 303, headers: { Location: "/admin/settings/appearance?saved=1" } });
}