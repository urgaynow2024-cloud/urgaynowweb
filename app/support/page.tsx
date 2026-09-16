import { Container, PageHeader } from "@/components/Container";
import { getSetting } from "@/lib/settings";
import { Alert, Card, EmptyState } from "@/components/ui";
import Link from "next/link";

export const revalidate = 3600;

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

  const contacts = [
    ...(email
      ? [
          {
            icon: "✉️",
            label: "Email",
            value: email,
            href: `mailto:${email}`,
          }
        ]
      : []),
    ...(discord
      ? [
          {
            icon: "💬",
            label: "Discord",
            value: "Join the server",
            href: discord,
          }
        ]
      : []),
    ...(vrchat
      ? [
          {
            icon: "🌐",
            label: "VRChat",
            value: "Group page",
            href: vrchat,
          }
        ]
      : []),
  ];

  return (
    <>
      <PageHeader title="Support & Contact" description="We're here to help." />
      <Container className="py-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-xl text-ink-600 dark:text-ink-300 leading-relaxed">
            {message ||
              "Have a question or need help? Reach out through any of the channels below — we're always happy to help you out! 🐾"}
          </p>

          {contacts.length > 0 ? (
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {contacts.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  <Card hover className="group flex items-center gap-4 p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl" aria-hidden>
                      {c.icon}
                    </span>
                    <span>
                      <span className="block text-sm text-ink-500 dark:text-ink-400">{c.label}</span>
                      <span className="text-lg font-semibold text-ink-900 dark:text-white">
                        {c.value}
                      </span>
                    </span>
                    <span className="ml-auto text-2xl text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-300" aria-hidden>
                      ↗
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🐾"
              title="No contact methods set up yet"
              description="Staff is working on adding support channels."
            />
          )}

          <Alert tone="danger" title="In an emergency?">
            If you or someone else is in immediate danger, contact your local emergency services. For urgent community safety concerns, reach a staff member via Discord.
          </Alert>
        </div>
      </Container>
    </>
  );
}
