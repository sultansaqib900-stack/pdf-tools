import type { MetadataRoute } from "next";

/**
 * Note: a static `public/robots.txt` used to exist and silently shadowed this
 * Route Handler, so none of the rules below were actually served. It has been
 * removed — this file is now the single source of truth.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/vault/",
          // Auth + transactional surfaces: no crawl value, and keeping them
          // out of the index avoids thin/duplicate pages in Search Console.
          "/login",
          "/signup",
          "/monitoring",
        ],
      },
      {
        // Mediapartners-Google must be able to crawl every page it serves ads
        // on, including pages that are noindex — otherwise AdSense reports
        // crawler errors and falls back to poorly-targeted ads.
        userAgent: "Mediapartners-Google",
        allow: "/",
        disallow: ["/api/", "/vault/"],
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
        disallow: ["/api/", "/vault/"],
      },
    ],
    sitemap: "https://allaboutpdfediting.xyz/sitemap.xml",
    host: "https://allaboutpdfediting.xyz",
  };
}
