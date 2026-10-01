import type { Metadata } from "next";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: { default: "Legal", template: "%s · Ur Gay Now" },
  description: "Ur Gay Now legal documents: bot terms of service, bot privacy policy, and ownership.",
  robots: { index: true, follow: true },
};

/**
 * Legal routes use the Halloween colour system but keep the page plain: the
 * seasonal decoration layer is hidden here so nothing moves behind the text.
 */
const legalRouteStyles = `
  .hw-layer, .hw-banner { display: none !important; }
`;

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalRouteStyles }} />
      <div className="relative overflow-hidden border-b border-ink-200/80 bg-pride-gradient-soft dark:border-ink-800 dark:bg-gradient-to-r dark:from-brand-900/30 dark:via-transparent dark:to-brand-800/20">
        <div className="noise-overlay" aria-hidden />
        <Container className="relative py-12 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500 dark:text-ink-400">
            <a href="/" className="hover:text-brand-600 dark:hover:text-brand-300">
              Home
            </a>
            <span aria-hidden> / </span>
            <span>Legal</span>
          </nav>
        </Container>
      </div>
      <Container className="py-10 sm:py-14">{children}</Container>
    </>
  );
}