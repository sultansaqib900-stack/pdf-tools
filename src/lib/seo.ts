import type { Metadata } from "next";

/** Single source of truth for the canonical host. */
export const SITE_URL = "https://allaboutpdfediting.xyz";

/** Brand suffix appended by the root layout title template (`%s | PDFTools`). */
export const BRAND = "PDFTools";

/**
 * Slugs that have a real hand-written Spanish page under `src/app/es`.
 * Keep in sync with `spanishRoutes` in `src/lib/i18n.ts` (asserted by
 * `src/__tests__/i18nRoutes.test.ts`).
 */
export const ES_SLUGS = new Set([
  "",
  "tools",
  "compress",
  "merge",
  "split",
  "image-to-pdf",
  "edit-pdf",
]);

export interface BuildMetadataInput {
  /** Route path of THIS page, e.g. "/compress", "/blog/how-to-compress-pdf", "/es/merge", or "" for home. */
  path: string;
  /** Page title WITHOUT the brand name — the root template adds `| PDFTools`. */
  title: string;
  /** Unique meta description, ideally 140-160 chars. */
  description: string;
  /** "en" (default) or "es". Decides og:locale. */
  locale?: "en" | "es";
  /** Override: does this page have a Spanish version? Defaults to ES_SLUGS lookup. */
  hasEs?: boolean;
  /** og:type — "website" (default) or "article". */
  type?: "website" | "article";
  /** Article publish date (ISO) — used for og:type="article". */
  publishedTime?: string;
  /** Article modified date (ISO). */
  modifiedTime?: string;
  /** Per-page OG/Twitter image URL. Defaults to the site-wide generated image. */
  image?: string;
  /** Set for pages that must not be indexed (login, embed, /for/* …). */
  noindex?: boolean;
}

/**
 * Builds a self-referencing Next.js `Metadata` object for a page.
 *
 * - `title` must NOT include the brand — `title.template` in the root layout
 *   appends `| PDFTools` exactly once.
 * - `alternates.canonical` is always the page's OWN URL (self-referencing).
 *   `/es/...` pages canonicalize to their `/es/...` URL, never the English one.
 * - `alternates.languages` (hreflang) is emitted ONLY when a real Spanish
 *   version of the page exists (see ES_SLUGS).
 */
export function buildMetadata({
  path,
  title,
  description,
  locale = "en",
  hasEs,
  type = "website",
  publishedTime,
  modifiedTime,
  image,
  noindex,
}: BuildMetadataInput): Metadata {
  // Normalize: "" or "/" -> ""; otherwise "/seg/seg" without trailing slash.
  const cleanPath = !path || path === "/" ? "" : path.replace(/\/+$/, "");
  const url = `${SITE_URL}${cleanPath}`;
  const isEs = locale === "es";
  // Slug without locale prefix and without leading slash: "/es/compress" -> "compress"
  const esSlug = cleanPath.replace(/^\/es$/, "").replace(/^\/es\//, "").replace(/^\//, "");
  const withEs = hasEs ?? ES_SLUGS.has(esSlug);
  const enUrl = `${SITE_URL}/${esSlug}`.replace(/\/$/, "") || SITE_URL;
  const esUrl = `${SITE_URL}/es${esSlug ? `/${esSlug}` : ""}`;
  const ogImage = image ?? `${SITE_URL}/opengraph-image`;
  const ogLocale = isEs ? "es_ES" : "en_US";

  const languages: Record<string, string> | undefined = withEs
    ? { en: enUrl, es: esUrl, "x-default": enUrl }
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    ...(noindex
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND,
      type,
      locale: ogLocale,
      ...(type === "article" && (publishedTime || modifiedTime)
        ? {
            publishedTime,
            modifiedTime: modifiedTime ?? publishedTime,
          }
        : {}),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
