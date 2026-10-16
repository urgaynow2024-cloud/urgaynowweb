import { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Card } from "@/components/ui";
import PartnershipApplyForm from "./form";

export const metadata: Metadata = {
  title: "Partnership Application",
  description: "Apply to become a partner, affiliate, or friend community of Ur Gay Now.",
  robots: { index: true, follow: true },
};

export default function PartnershipApplyPage() {
  return (
    <>
      <PageHeader
        title="Partnership Application"
        description="Apply to partner with Ur Gay Now. We welcome communities, creators, and groups who share our values."
      />

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white mb-6">
              Apply for a Partnership
            </h2>
            <p className="text-sm text-ink-600 dark:text-ink-400 mb-6">
              Fill out the form below to apply. Our staff team reviews every application and will
              get back to you via the contact details you provide.
            </p>

            <PartnershipApplyForm />
          </Card>

          <Alert
            tone="info"
            title="What happens next?"
            className="mt-8"
          >
            <ul className="mt-2 space-y-2 text-sm text-ink-600 dark:text-ink-400 list-disc list-inside">
              <li>Your application is received with a reference ID.</li>
              <li>Our staff team reviews it and may reach out for more information.</li>
              <li>You will be notified of the outcome (approved or rejected).</li>
              <li>Approved partnerships are listed on our public partners page.</li>
            </ul>
          </Alert>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/partners" className="btn-secondary">
              View existing partners
            </Link>
            <Link href="/" className="btn-ghost">
              Back to the site
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
