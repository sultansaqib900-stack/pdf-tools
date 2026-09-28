import type { MetadataRoute } from "next";

/**
 * Single source of truth for robots.txt (there is deliberately no
 * public/robots.txt — keep it that way).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/app pages. Note /vault (no trailing slash) so it matches
        // /vault itself — the nav links there. Spanish variants included for
        // safety even though the routes do not exist yet.
        disallow: [
          "/api/",
          "/vault",
          "/dashboard",
          "/login",
          "/signup",
          "/embed",
          "/es/login",
          "/es/signup",
          "/es/vault",
          "/es/embed",
          "/es/dashboard",
        ],
      },
    ],
    // No `host:` directive — it is Yandex-only and ignored by Google.
    sitemap: "https://allaboutpdfediting.xyz/sitemap.xml",
  };
}
