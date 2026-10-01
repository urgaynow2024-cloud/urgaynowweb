import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/Container";
import { Alert } from "@/components/ui";
import { PublicReportForm } from "@/components/report/PublicReportForm";
import { HalloweenIcon } from "@/components/halloween/HalloweenIcon";
import { REPORT_LIMITS, REPORT_CATEGORIES } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Report a User or a Problem",
  description:
    "Report harassment, hate speech, misconduct, spam, scams, or any community rule violation to the Ur Gay Now moderation team.",
  robots: { index: true, follow: true },
};

const STEPS = [
  {
    title: "You tell us what happened",
    body: "Pick a category, describe the incident, and add the person's name or Discord ID if you know it.",
  },
  {
    title: "We save it safely",
    body: "Your report is stored privately with a UGN reference such as UGN-000123. Only the moderation team can read it.",
  },
  {
    title: "Staff review it",
    body: "A moderator picks it up, may ask for more information, and records every action they take.",
  },
  {
    title: "You follow the outcome",
    body: "Use your private tracking link to see whether the report is new, in review, resolved, or dismissed.",
  },
];

const SAFEGUARDING_NOTE =
  "If someone is in immediate danger, contact your local emergency services first. Safeguarding and threats are treated as urgent and are seen by the safeguarding team first.";

export default function ReportPage() {
  return (
    <>
      <PageHeader
        icon={<HalloweenIcon size={56} />}
        title="Report a user or a problem"
        description="Every report goes straight to the UGN moderation team. You do not need an account, and you can stay anonymous if you would rather."
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <Alert tone="warning" title="If someone is in danger" className="mb-8">
              {SAFEGUARDING_NOTE}
            </Alert>

            <PublicReportForm />

            <p className="mt-8 text-sm text-ink-500 dark:text-ink-400">
              Already sent a report?{" "}
              <Link href="/report/me" className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300">
                Check its status
              </Link>{" "}
              using the private link you were given.
            </p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-800 dark:text-ink-100">
                        {step.title}
                      </span>
                      <span className="block text-sm text-ink-500 dark:text-ink-400">{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Categories</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-600 dark:text-ink-300">
                {REPORT_CATEGORIES.map((category) => (
                  <li key={category.value}>• {category.label}</li>
                ))}
              </ul>
            </div>

            <div className="card p-5 text-sm text-ink-600 dark:text-ink-300">
              <h2 className="text-base font-bold text-ink-900 dark:text-white">Limits</h2>
              <ul className="mt-2 space-y-1">
                <li>
                  Description up to {REPORT_LIMITS.DESCRIPTION_MAX.toLocaleString()} characters
                </li>
                <li>
                  Up to {REPORT_LIMITS.EVIDENCE_MAX_FILES} files,{" "}
                  {(REPORT_LIMITS.EVIDENCE_MAX_BYTES / (1024 * 1024)).toFixed(0)}MB each
                </li>
                <li>Up to {REPORT_LIMITS.LINKS_MAX_COUNT} links</li>
                <li>Duplicate submissions are merged automatically</li>
              </ul>
              <p className="mt-3">
                Read our{" "}
                <Link
                  href="/legal/bot/privacy"
                  className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
                >
                  privacy policy
                </Link>{" "}
                to see exactly what we store.
              </p>
            </div>
          </aside>
        </div>
      </Container>

      <div className="border-t border-ink-200/80 dark:border-ink-800/80">
        <Container className="py-12 sm:py-16">
          <Section
            eyebrow="Other ways to get help"
            title="Not sure this is the right form?"
            subtitle="Rules, support, and legal information live a click away."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/rules" className="card card-hover p-5">
                <h3 className="font-bold text-ink-900 dark:text-white">Community rules</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  What is and is not allowed in UGN spaces.
                </p>
              </Link>
              <Link href="/support" className="card card-hover p-5">
                <h3 className="font-bold text-ink-900 dark:text-white">Support</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  Account questions, event help, and general enquiries.
                </p>
              </Link>
              <Link href="/legal" className="card card-hover p-5">
                <h3 className="font-bold text-ink-900 dark:text-white">Legal &amp; ownership</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  Bot terms, privacy, and who owns UGN work.
                </p>
              </Link>
            </div>
          </Section>
        </Container>
      </div>
    </>
  );
}