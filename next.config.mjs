/** @type {import('next').NextConfig} */

// Legacy legal URLs from the previous GitHub-hosted bot site. These are handled
// with redirects so existing links keep working and point at the canonical
// pages on this site.
const legalRedirects = [
  { source: "/tos", destination: "/legal/bot/terms", permanent: true },
  { source: "/tos.html", destination: "/legal/bot/terms", permanent: true },
  { source: "/terms", destination: "/legal/bot/terms", permanent: true },
  { source: "/legal/tos", destination: "/legal/bot/terms", permanent: true },
  { source: "/legal/terms", destination: "/legal/bot/terms", permanent: true },
  { source: "/bot/terms", destination: "/legal/bot/terms", permanent: true },
  { source: "/bot-tos", destination: "/legal/bot/terms", permanent: true },
  { source: "/privacy", destination: "/legal/bot/privacy", permanent: true },
  { source: "/privacy.html", destination: "/legal/bot/privacy", permanent: true },
  { source: "/legal/privacy", destination: "/legal/bot/privacy", permanent: true },
  { source: "/bot/privacy", destination: "/legal/bot/privacy", permanent: true },
  { source: "/urgaynow-bot-site/tos", destination: "/legal/bot/terms", permanent: true },
  { source: "/urgaynow-bot-site/tos.html", destination: "/legal/bot/terms", permanent: true },
  { source: "/urgaynow-bot-site/privacy", destination: "/legal/bot/privacy", permanent: true },
  { source: "/urgaynow-bot-site/privacy.html", destination: "/legal/bot/privacy", permanent: true },
  { source: "/ownership", destination: "/legal/ownership", permanent: true },
  { source: "/legal/ip", destination: "/legal/ownership", permanent: true },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["react-markdown", "remark-gfm"],
  },
  async redirects() {
    return legalRedirects;
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public pages: short shared cache (existing behaviour, kept).
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
          },
          ...securityHeaders,
        ],
      },
      // Private, staff-only, or token-bearing routes must never be cached by a
      // CDN or the browser. These rules come after the catch-all above so they
      // win for matching paths.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          ...securityHeaders,
        ],
      },
      {
        source: "/report/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          ...securityHeaders,
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          ...securityHeaders,
        ],
      },
      // Evidence is streamed from an authenticated staff route only.
      {
        source: "/api/admin/reports/evidence/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'none'; sandbox" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;