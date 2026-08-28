import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ur Gay Now";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — VRChat LGBTQ+ Community`,
    template: `%s · ${siteName}`,
  },
  description:
    "A vibrant VRChat LGBTQ+ community — daily games, events, friends, and good vibes. Come hang out with us!",
  keywords: ["Ur Gay Now", "LGBTQ+", "VRChat", "community", "events", "gaming", "discord"],
  openGraph: {
    title: `${siteName} — VRChat LGBTQ+ Community`,
    description:
      "A vibrant VRChat LGBTQ+ community — daily games, events, friends, and good vibes. Come hang out with us!",
    url: siteUrl,
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — VRChat LGBTQ+ Community`,
    description:
      "A vibrant VRChat LGBTQ+ community — daily games, events, friends, and good vibes. Come hang out with us!",
  },
  robots: { index: true, follow: true },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <HeaderWrapper />
            <main id="main" className="min-h-[60vh]">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
