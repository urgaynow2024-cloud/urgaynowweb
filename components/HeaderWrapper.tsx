import { getSetting } from "@/lib/settings";
import { Header } from "@/components/Header";

export async function HeaderWrapper() {
  const discord = await getSetting("discordInvite");
  return <Header joinUrl={discord} />;
}
