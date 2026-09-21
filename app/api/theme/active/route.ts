import { NextResponse } from "next/server";
import { getActiveThemeId } from "@/lib/theme-resolver";

export const revalidate = 0;

export async function GET() {
  const themeId = await getActiveThemeId();
  return NextResponse.json({ themeId });
}