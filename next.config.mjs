/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Cache optimized images longer — covers/photos rarely change, so the
    // image optimizer result can be reused instead of regenerating per visit.
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // Tree-shake heavy barrel imports so only used exports ship in the bundle.
    optimizePackageImports: ["react-markdown", "remark-gfm"],
  },
  async headers() {
    return [
      {
        // Long-lived immutable cache for build-time hashed static assets.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
