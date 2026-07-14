import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { GallerySubmissionForm } from "./GallerySubmissionForm";

export const metadata = {
  title: "Submit a photo",
  description: "Share a photo with the Ur Gay Now community.",
  robots: { index: false, follow: false },
};

export default function SubmitPhotoPage() {
  return (
    <>
      <PageHeader
        title="Submit a photo"
        description="Share a moment with the community. Submissions are reviewed by a moderator before they go live."
      />
      <Container className="max-w-2xl py-12">
        <Link href="/gallery" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
          ← Back to gallery
        </Link>
        <GallerySubmissionForm />
      </Container>
    </>
  );
}
