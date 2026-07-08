export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ur Gay Now";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Official Community Hub`,
    template: `%s · ${siteName}`,
  },
  description:
    "The official community hub for Ur Gay Now. Announcements, events, rules, staff, guides, and more — welcoming, colourful, and LGBTQ+ friendly.",
  keywords: ["Ur Gay Now", "LGBTQ+", "VRChat", "community", "events", "announcements"],
  openGraph: {
    title: siteName,
    description: "The official community hub for Ur Gay Now.",
    url: siteUrl,
    siteName,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
