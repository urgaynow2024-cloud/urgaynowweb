import { Container, PageHeader } from "@/components/Container";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Support & Contact",
  description: "Need help? Get in touch with the Ur Gay Now team.",
};

export default async function SupportPage() {
  const [message, email, discord, vrchat] = await Promise.all([
    getSetting("supportMessage"),
    getSetting("supportEmail"),
    getSetting("discordInvite"),
    getSetting("vrchatGroupUrl"),
  ]);

  return (
    <>
      <PageHeader title="Support & Contact" description="We're here to help." />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg text-zinc-700 dark:text-zinc-300">{message}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {email && (
              <a href={`mailto:${email}`} className="card flex items-center gap-3 transition hover:shadow-md">
                <span className="text-2xl" aria-hidden>✉️</span>
                <span>
                  <span className="block text-sm text-zinc-500">Email</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{email}</span>
                </span>
              </a>
            )}
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 transition hover:shadow-md">
                <span className="text-2xl" aria-hidden>💬</span>
                <span>
                  <span className="block text-sm text-zinc-500">Discord</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">Join the server</span>
                </span>
              </a>
            )}
            {vrchat && (
              <a href={vrchat} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 transition hover:shadow-md">
                <span className="text-2xl" aria-hidden>🌐</span>
                <span>
                  <span className="block text-sm text-zinc-500">VRChat</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">Group page</span>
                </span>
              </a>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-white">In an emergency?</strong> If you or someone
            else is in immediate danger, contact your local emergency services. For urgent community
            safety concerns, reach a staff member via Discord.
          </div>
        </div>
      </Container>
    </>
  );
}
