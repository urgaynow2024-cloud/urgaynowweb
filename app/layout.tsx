import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { ThemeProvider, SeasonalThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { HalloweenDecorations } from "@/components/halloween/HalloweenDecorations";
import { SeasonalBanner } from "@/components/halloween/SeasonalBanner";
import { HalloweenIconProvider } from "@/components/halloween/HalloweenIconProvider";
import { hasHalloweenIcon } from "@/lib/halloween-icon-server";
import { getActiveThemeId } from "@/lib/theme-resolver";
import { safeQuery } from "@/lib/safeQuery";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const halloweenIconAvailable = hasHalloweenIcon();
  // Resolved on the server so the seasonal theme is painted on the very first
  // frame instead of flashing the normal UGN palette until the client fetch
  // resolves. Cached for a minute by the theme resolver.
  const seasonalTheme = await safeQuery(() => getActiveThemeId(), "default");

  return (
    <html lang="en" data-site-theme={seasonalTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <SeasonalThemeProvider>
            <HalloweenIconProvider available={halloweenIconAvailable}>
            <ToastProvider>
            <HalloweenDecorations />
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <SeasonalBanner />
            <HeaderWrapper />
              <main id="main" className="min-h-[60vh]">
                {children}
              </main>
              <Footer />
            </ToastProvider>
            </HalloweenIconProvider>
          </SeasonalThemeProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
