import { updateThemeSettings } from "../actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  await updateThemeSettings(formData);
  return new Response(null, { status: 303, headers: { Location: "/admin/settings/appearance?saved=1" } });
}