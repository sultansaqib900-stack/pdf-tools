import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/vault/"],
        crawlDelay: 10,
      },
    ],
    sitemap: "https://allaboutpdfediting.xyz/sitemap.xml",
  };
}
