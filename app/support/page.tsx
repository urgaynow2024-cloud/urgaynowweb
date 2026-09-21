import { Container, PageHeader } from "@/components/Container";
import { getSetting } from "@/lib/settings";
import { Alert, Card } from "@/components/ui";
import { SupportContactForm } from "@/components/support/SupportContactForm";

export const revalidate = 3600;

export const metadata = {
  title: "Support & Contact",
  description: "Need a hand? Get in touch with the Ur Gay Now team.",
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
            label: "Email Support",
            value: email,
            href: `mailto:${email}`,
            description: "For general questions, account issues, and support requests.",
          },
        ]
      : []),
    ...(discord
      ? [
          {
            icon: "💬",
            label: "Discord",
            value: "Join the server",
            href: discord,
            description: "Community assistance and urgent moderation/safety concerns.",
          },
        ]
      : []),
    ...(vrchat
      ? [
          {
            icon: "🌐",
            label: "VRChat Group",
            value: "Group page",
            href: vrchat,
            description: "Community events and updates.",
          },
        ]
      : []),
    {
      icon: "🎫",
      label: "Support Request",
      value: "Submit a ticket",
      href: "#support-form",
      description: "Fill out the form below for a unique ticket number.",
    },
  ];

  const description =
    message ||
    "Whether you've found a bug, need help with something, have a question, or need to contact the team, we're here to help.";

  return (
    <>
      <PageHeader
        title="Need a hand?"
        description={description}
      />

      <Container>
        <div className="mx-auto max-w-4xl py-10">
          {contacts.length > 0 && (
            <div className="mb-12">
              <h2 className="section-title-accent text-2xl sm:text-3xl mb-6">
                Contact options
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={c.href.startsWith("#") ? `${c.label} — ${c.description}` : undefined}
                    className="block"
                  >
                    <Card className="flex items-start gap-4 p-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-900/30" aria-hidden="true">
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-900 dark:text-white">
                          {c.label}
                        </span>
                        <span className="block text-sm text-ink-500 dark:text-ink-400 truncate">
                          {c.value}
                        </span>
                        <span className="block mt-1 text-xs text-ink-400 dark:text-ink-500">
                          {c.description}
                        </span>
                      </div>
                      {c.href.startsWith("http") && (
                        <span className="ml-auto shrink-0 text-xl text-brand-600 dark:text-brand-300" aria-hidden="true">
                          ↗
                        </span>
                      )}
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div id="support-form" className="mb-12">
            <h2 className="section-title-accent text-2xl sm:text-3xl mb-6">
              Submit a request
            </h2>
            <Card className="p-6 sm:p-8">
              <SupportContactForm />
            </Card>
          </div>

          <div className="mb-12">
            <h2 className="section-title-accent text-2xl sm:text-3xl mb-6">
              What happens next?
            </h2>
            <div className="space-y-4">
              {[
                "Your request receives a unique ticket number.",
                "Our staff team reviews it.",
                "We may contact you if more information is needed.",
                "Your ticket is resolved once the issue has been handled.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Alert tone="info" title="Urgent / safety matters">
            If you or someone else is in immediate danger, contact your local
            emergency services right away. For urgent community safety concerns,
            reach a staff member directly through Discord.
          </Alert>
        </div>
      </Container>
    </>
  );
}
