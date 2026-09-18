import type { MetadataRoute } from "next";

/** Keep this route authoritative; do not duplicate it in /public. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/vault/", "/dashboard", "/login", "/signup", "/embed"],
    },
    sitemap: "https://allaboutpdfediting.xyz/sitemap.xml",
    host: "https://allaboutpdfediting.xyz",
  };
}
