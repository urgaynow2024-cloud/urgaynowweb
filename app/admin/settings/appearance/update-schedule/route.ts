import { updateThemeSchedule } from "../actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  await updateThemeSchedule(formData);
  return new Response(null, { status: 303, headers: { Location: "/admin/settings/appearance?saved=1" } });
}