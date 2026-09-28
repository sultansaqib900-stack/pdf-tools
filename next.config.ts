import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Brand icons must be crawlable and freshly revalidated by search
      // engines and scrapers; static /public assets get long caches, so pin
      // explicit revalidation on the icon surface.
      {
        source: "/:icon(icons/icon-512.png|icons/icon-192.png|icons/apple-touch-icon.png|logo-32.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Keep the only public origin aligned with canonical URLs and metadata.
      // This is a code-level fallback; www must still be attached to the
      // production Vercel project for requests to reach this redirect rule.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.allaboutpdfediting.xyz" }],
        destination: "https://allaboutpdfediting.xyz/:path*",
        permanent: true,
      },
      // The dynamic OG image route has no extension; older metadata pointed at
      // /opengraph-image.png which 404ed. Send that variant to the real route.
      { source: "/opengraph-image.png", destination: "/opengraph-image", permanent: true },
      // Duplicate comparison pages consolidated into the /vs/ hub (Phase 2).
      { source: "/adobe-acrobat-alternative", destination: "/vs/adobe-acrobat", permanent: true },
      { source: "/ilovepdf-alternative", destination: "/vs/ilovepdf", permanent: true },
      { source: "/smallpdf-alternative", destination: "/vs/smallpdf", permanent: true },
      // Overlapping blog posts consolidated (Phase 3B): keep the stronger how-to
      // guide and 301 the duplicate onto it; best sections were merged in.
      { source: "/blog/compress-pdf-without-losing-quality", destination: "/blog/how-to-compress-pdf", permanent: true },
      { source: "/blog/merge-multiple-pdfs-into-one", destination: "/blog/how-to-merge-pdf", permanent: true },
      { source: "/blog/convert-image-to-pdf", destination: "/blog/how-to-convert-image-to-pdf", permanent: true },
      { source: "/blog/search-and-redact-pdf", destination: "/blog/redact-pdf-online", permanent: true },
      { source: "/blog/edit-pdf-metadata", destination: "/blog/clean-pdf-metadata", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "all-about-pdf-editing",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
});
