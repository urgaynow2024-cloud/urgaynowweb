import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { CommunitySubmissionForm } from "./CommunitySubmissionForm";

export const metadata = {
  title: "Submit community content",
  description: "Share artwork, avatars, screenshots, and more with the Ur Gay Now community.",
  robots: { index: false, follow: false },
};

export default function SubmitCommunityPage() {
  return (
    <>
      <PageHeader
        title="Submit community content"
        description="Share artwork, avatars, screenshots, VRChat worlds, and more. Submissions are reviewed by a moderator before they go live."
      />
      <Container className="max-w-2xl py-12 sm:py-16">
        <Link href="/community" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
          &larr; Back to community
        </Link>
        <CommunitySubmissionForm />
      </Container>
    </>
  );
}