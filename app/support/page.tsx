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
      <Container className="py-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">{message}</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {email && (
              <a href={`mailto:${email}`} className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:focus-visible:ring-offset-ink-950">
                <div className="flex items-center gap-4">
                  <span className="text-4xl" aria-hidden>✉️</span>
                  <span>
                    <span className="block text-sm text-zinc-500">Email</span>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">{email}</span>
                  </span>
                </div>
              </a>
            )}
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:focus-visible:ring-offset-ink-950">
                <div className="flex items-center gap-4">
                  <span className="text-4xl" aria-hidden>💬</span>
                  <span>
                    <span className="block text-sm text-zinc-500">Discord</span>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">Join the server</span>
                  </span>
                </div>
              </a>
            )}
            {vrchat && (
              <a href={vrchat} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:focus-visible:ring-offset-ink-950">
                <div className="flex items-center gap-4">
                  <span className="text-4xl" aria-hidden>🌐</span>
                  <span>
                    <span className="block text-sm text-zinc-500">VRChat</span>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">Group page</span>
                  </span>
                </div>
              </a>
            )}
          </div>

          <div className="mt-12 rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-6 text-base text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-white">In an emergency?</strong> If you or someone
            else is in immediate danger, contact your local emergency services. For urgent community
            safety concerns, reach a staff member via Discord.
          </div>
        </div>
      </Container>
    </>
  );
}
