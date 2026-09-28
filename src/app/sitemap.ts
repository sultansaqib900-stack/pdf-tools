// src/app/sitemap.ts — generated from real content dates (see docs/seo-audit.md Phase 2).
// - lastModified is NEVER new Date(): blog posts use their ArticleJsonLd
//   datePublished (the real content date); other pages use their git last-change
//   date recorded in src/lib/seo-dates.ts. Update that map when page content
//   actually changes (that IS the page's lastModified).
// - Only indexable, 200-status, self-canonical URLs are listed. Excluded:
//   /sitemap (HTML), /login, /signup, /dashboard, /vault, /embed, /view,
//   /offline (private/noindex; vault+login+signup+dashboard+embed are also
//   Disallowed in robots.txt), /for/* (noindex matrix), and the three
//   /{brand}-alternative URLs (301 -> /vs/*).
// - priority/changefreq omitted (ignored by Google).
import type { MetadataRoute } from "next";
import { getErrorPages } from "@/lib/error-pages";

const BASE = "https://allaboutpdfediting.xyz";

/** Slugs that have a real Spanish page at /es/<slug> (keep in sync with src/lib/i18n.ts). */
const ES_SLUGS = new Set(["", "tools", "compress", "merge", "split", "image-to-pdf", "edit-pdf"]);

type Entry = { path: string; lastModified: string };

/** Non-blog indexable pages with their real last-change date. */
const PAGES: Entry[] = [

  { path: "/", lastModified: "2026-09-28" },
  { path: "/tools", lastModified: "2026-09-28" },
  { path: "/studio", lastModified: "2026-09-28" },
  { path: "/pii-guardian", lastModified: "2026-09-28" },
  { path: "/recipes", lastModified: "2026-09-28" },
  { path: "/compress", lastModified: "2026-09-28" },
  { path: "/merge", lastModified: "2026-09-28" },
  { path: "/split", lastModified: "2026-09-28" },
  { path: "/image-to-pdf", lastModified: "2026-09-28" },
  { path: "/scan-to-pdf", lastModified: "2026-09-28" },
  { path: "/ocr-pdf", lastModified: "2026-09-28" },
  { path: "/edit-pdf", lastModified: "2026-09-28" },
  { path: "/repair-pdf", lastModified: "2026-09-28" },
  { path: "/pdf-to-pdfa", lastModified: "2026-09-28" },
  { path: "/pdf-to-images", lastModified: "2026-09-28" },
  { path: "/extract-text", lastModified: "2026-09-28" },
  { path: "/add-page-numbers", lastModified: "2026-09-28" },
  { path: "/pdf-to-word", lastModified: "2026-09-28" },
  { path: "/word-to-pdf", lastModified: "2026-09-28" },
  { path: "/insert-blank", lastModified: "2026-09-28" },
  { path: "/word-counter", lastModified: "2026-09-28" },
  { path: "/annotate", lastModified: "2026-09-28" },
  { path: "/pdf-to-excel", lastModified: "2026-09-28" },
  { path: "/rotate", lastModified: "2026-09-28" },
  { path: "/unlock", lastModified: "2026-09-28" },
  { path: "/watermark", lastModified: "2026-09-28" },
  { path: "/protect", lastModified: "2026-09-28" },
  { path: "/html-to-pdf", lastModified: "2026-09-28" },
  { path: "/sign", lastModified: "2026-09-28" },
  { path: "/chat-pdf", lastModified: "2026-09-28" },
  { path: "/batch", lastModified: "2026-09-28" },
  { path: "/delete-pages", lastModified: "2026-09-28" },
  { path: "/text-to-pdf", lastModified: "2026-09-28" },
  { path: "/organize", lastModified: "2026-09-28" },
  { path: "/metadata", lastModified: "2026-09-28" },
  { path: "/resize", lastModified: "2026-09-28" },
  { path: "/crop", lastModified: "2026-09-28" },
  { path: "/fill-form", lastModified: "2026-09-28" },
  { path: "/flatten-pdf", lastModified: "2026-09-28" },
  { path: "/reverse-pdf", lastModified: "2026-09-28" },
  { path: "/pdf-diff", lastModified: "2026-09-28" },
  { path: "/certificate-generator", lastModified: "2026-09-28" },
  { path: "/pdf-to-audio", lastModified: "2026-09-28" },
  { path: "/form-data-extract", lastModified: "2026-09-28" },
  { path: "/bulk-rename", lastModified: "2026-09-28" },
  { path: "/booklet", lastModified: "2026-09-28" },
  { path: "/search-redact", lastModified: "2026-09-28" },
  { path: "/pdf-inverter", lastModified: "2026-09-28" },
  { path: "/qr-stamp", lastModified: "2026-09-28" },
  { path: "/metadata-sanitizer", lastModified: "2026-09-28" },
  { path: "/split-by-bookmarks", lastModified: "2026-09-28" },
  { path: "/bates-numbering", lastModified: "2026-09-28" },
  { path: "/redact", lastModified: "2026-09-28" },
  { path: "/premium", lastModified: "2026-09-28" },
  { path: "/qa", lastModified: "2026-09-28" },
  { path: "/vs", lastModified: "2026-09-28" },
  { path: "/vs/adobe-acrobat", lastModified: "2026-09-28" },
  { path: "/vs/ilovepdf", lastModified: "2026-09-28" },
  { path: "/vs/smallpdf", lastModified: "2026-09-28" },
  { path: "/best-free-pdf-editor", lastModified: "2026-09-28" },
  { path: "/ultimate-guide-to-pdf-editing", lastModified: "2026-09-28" },
  { path: "/pdf-tools-for-students", lastModified: "2026-09-28" },
  { path: "/pdf-tools-for-teachers", lastModified: "2026-09-28" },
  { path: "/pdf-tools-for-lawyers", lastModified: "2026-09-28" },
  { path: "/pdf-tools-for-small-business", lastModified: "2026-09-28" },
  { path: "/pdf-tools-for-business", lastModified: "2026-09-28" },
  { path: "/about", lastModified: "2026-09-28" },
  { path: "/contact", lastModified: "2026-09-28" },
  { path: "/privacy", lastModified: "2026-09-28" },
  { path: "/terms", lastModified: "2026-09-28" },
  { path: "/es", lastModified: "2026-09-28" },
  { path: "/es/tools", lastModified: "2026-09-28" },
  { path: "/es/compress", lastModified: "2026-09-28" },
  { path: "/es/merge", lastModified: "2026-09-28" },
  { path: "/es/split", lastModified: "2026-09-28" },
  { path: "/es/image-to-pdf", lastModified: "2026-09-28" },
  { path: "/es/edit-pdf", lastModified: "2026-09-28" },
];

/** Blog posts with their real publish date (from ArticleJsonLd datePublished). */
const BLOG: Entry[] = [

  { path: "/blog/add-page-numbers-to-pdf", lastModified: "2026-06-25" },
  { path: "/blog/add-qr-code-to-pdf", lastModified: "2026-06-26" },
  { path: "/blog/add-watermark-to-pdf", lastModified: "2026-06-25" },
  { path: "/blog/ai-pdf-summarization", lastModified: "2026-06-27" },
  { path: "/blog/annotate-pdf-online", lastModified: "2026-06-25" },
  { path: "/blog/automate-pdf-workflow", lastModified: "2026-06-27" },
  { path: "/blog/batch-process-pdf-online", lastModified: "2026-06-25" },
  { path: "/blog/bates-numbering-pdf", lastModified: "2026-06-26" },
  { path: "/blog/bulk-rename-pdf-files", lastModified: "2026-06-26" },
  { path: "/blog/chat-with-pdf-ai", lastModified: "2026-06-26" },
  { path: "/blog/clean-pdf-metadata", lastModified: "2026-09-28" },
  { path: "/blog/compare-pdfs-online", lastModified: "2026-06-26" },
  { path: "/blog/convert-html-to-pdf", lastModified: "2026-06-25" },
  { path: "/blog/convert-pdf-to-audio", lastModified: "2026-06-26" },
  { path: "/blog/convert-pdf-to-excel", lastModified: "2026-06-25" },
  { path: "/blog/convert-pdf-to-images", lastModified: "2026-06-25" },
  { path: "/blog/convert-pdf-to-pdfa", lastModified: "2026-06-27" },
  { path: "/blog/convert-pdf-to-word", lastModified: "2026-06-27" },
  { path: "/blog/convert-word-to-pdf", lastModified: "2026-06-27" },
  { path: "/blog/create-pdf-booklet", lastModified: "2026-06-26" },
  { path: "/blog/crop-pdf-margins", lastModified: "2026-06-24" },
  { path: "/blog/delete-pages-from-pdf", lastModified: "2026-06-24" },
  { path: "/blog/edit-pdf-online", lastModified: "2026-09-28" },
  { path: "/blog/extract-pdf-form-data", lastModified: "2026-06-26" },
  { path: "/blog/extract-text-from-pdf", lastModified: "2026-06-25" },
  { path: "/blog/fill-pdf-forms-online", lastModified: "2026-06-25" },
  { path: "/blog/flatten-pdf-online", lastModified: "2026-06-25" },
  { path: "/blog/generate-pdf-certificates", lastModified: "2026-06-26" },
  { path: "/blog/google-drive-pdf-editor", lastModified: "2026-06-27" },
  { path: "/blog/how-to-compress-pdf", lastModified: "2026-09-28" },
  { path: "/blog/how-to-convert-image-to-pdf", lastModified: "2026-09-28" },
  { path: "/blog/how-to-merge-pdf", lastModified: "2026-09-28" },
  { path: "/blog/insert-blank-pages-pdf", lastModified: "2026-06-25" },
  { path: "/blog/invert-pdf-colors", lastModified: "2026-06-26" },
  { path: "/blog/ocr-pdf-online", lastModified: "2026-09-28" },
  { path: "/blog/organize-pdf-pages", lastModified: "2026-06-24" },
  { path: "/blog/pdf-vs-image", lastModified: "2026-06-24" },
  { path: "/blog/protect-pdf-with-password", lastModified: "2026-06-25" },
  { path: "/blog/redact-pdf-online", lastModified: "2026-09-28" },
  { path: "/blog/remove-password-from-pdf", lastModified: "2026-06-24" },
  { path: "/blog/repair-pdf-online", lastModified: "2026-06-27" },
  { path: "/blog/resize-pdf-pages", lastModified: "2026-06-24" },
  { path: "/blog/reverse-pdf-pages", lastModified: "2026-06-25" },
  { path: "/blog/rotate-pdf-pages-online", lastModified: "2026-06-25" },
  { path: "/blog/scan-to-pdf", lastModified: "2026-06-27" },
  { path: "/blog/secure-pdf-vault", lastModified: "2026-06-26" },
  { path: "/blog/sign-pdf-without-printing", lastModified: "2026-06-24" },
  { path: "/blog/split-pdf-by-bookmarks", lastModified: "2026-06-26" },
  { path: "/blog/split-pdf-pages-online", lastModified: "2026-06-26" },
  { path: "/blog/text-to-pdf-converter", lastModified: "2026-06-24" },
  { path: "/blog/word-counter-online", lastModified: "2026-06-25" },
];

function entry({ path, lastModified }: Entry): MetadataRoute.Sitemap {
  const date = new Date(lastModified);
  const en = `${BASE}${path}`;
  const slug = path.replace(/^\/es\/?/, "").replace(/^\//, "");
  const out: MetadataRoute.Sitemap = [];
  const withEs = ES_SLUGS.has(slug);
  const languages = withEs
    ? { en: `${BASE}/${slug}`.replace(/\/$/, "") || BASE, es: `${BASE}/es${slug ? `/${slug}` : ""}`, "x-default": `${BASE}/${slug}`.replace(/\/$/, "") || BASE }
    : undefined;
  out.push({ url: en, lastModified: date, ...(languages ? { alternates: { languages } } : {}) });
  if (withEs) {
    out.push({
      url: `${BASE}/es${slug ? `/${slug}` : ""}`,
      lastModified: date,
      alternates: { languages },
    });
  }
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Error-help pages are regular indexable content (self-canonical, unique text).
  const errorPages: Entry[] = getErrorPages().map((p) => ({
    path: `/error/${p.slug}`,
    lastModified: "2026-09-28",
  }));
  return [...PAGES, ...BLOG, ...errorPages].flatMap(entry);
}
