# Before/After Verification Log

## Phase 1 — canonical/metadata verification (localhost, production build)

```
for p in "" compress merge blog/how-to-compress-pdf vs/ilovepdf es/compress; do ... curl ... done

== /
<title>PDFTools: Free Online PDF Tools</title>
<meta name="description" content="38 core PDF tools that are free and unlimited, plus 14 professional tools — led by the PDF Studio pipeline — for AI, automation, secure redaction, legal, and bulk workflows. Most file processing happens locally in your browser."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz"/>
<link rel="alternate" hrefLang="en" href="https://allaboutpdfediting.xyz"/>
<link rel="alternate" hrefLang="es" href="https://allaboutpdfediting.xyz/es"/>
<link rel="alternate" hrefLang="x-default" href="https://allaboutpdfediting.xyz"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz"/>
== /compress
<title>Compress PDF Online Free — Reduce PDF File Size | PDFTools</title>
<meta name="description" content="Compress PDF files online for free. Reduce PDF file size without losing quality. 100% free, no uploads, all processing happens in your browser."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz/compress"/>
<link rel="alternate" hrefLang="en" href="https://allaboutpdfediting.xyz/compress"/>
<link rel="alternate" hrefLang="es" href="https://allaboutpdfediting.xyz/es/compress"/>
<link rel="alternate" hrefLang="x-default" href="https://allaboutpdfediting.xyz/compress"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz/compress"/>
== /merge
<title>Merge PDF Online Free — Combine PDF Files | PDFTools</title>
<meta name="description" content="Merge multiple PDF files into one document online for free. Drag, reorder, and combine PDFs instantly in your browser. No uploads required."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz/merge"/>
<link rel="alternate" hrefLang="en" href="https://allaboutpdfediting.xyz/merge"/>
<link rel="alternate" hrefLang="es" href="https://allaboutpdfediting.xyz/es/merge"/>
<link rel="alternate" hrefLang="x-default" href="https://allaboutpdfediting.xyz/merge"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz/merge"/>
== /blog/how-to-compress-pdf
<title>How to Compress a PDF — Reduce PDF File Size Online Free | PDFTools</title>
<meta name="description" content="Learn how to compress PDF files online free. Reduce PDF size from 20MB to under 5MB with no quality loss. No signup, no uploads."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz/blog/how-to-compress-pdf"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz/blog/how-to-compress-pdf"/>
== /vs/ilovepdf
<title>iLovePDF vs PDFTools - Why Local Zero-Knowledge Processing Wins | PDFTools</title>
<meta name="description" content="Compare iLovePDF vs PDFTools. Eliminate cloud upload risks, avoid 4-step re-upload loops, and automate multi-step workflows in 1 click."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz/vs/ilovepdf"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz/vs/ilovepdf"/>
== /es/compress
<title>Comprimir PDF Online Gratis — Reducir Tamaño de PDF | PDFTools</title>
<meta name="description" content="Comprime archivos PDF online gratis. Reduce el tamaño de tu PDF sin perder calidad. 100% gratis, sin subir archivos — todo el procesamiento ocurre en tu navegador."/>
<link rel="canonical" href="https://allaboutpdfediting.xyz/es/compress"/>
<link rel="alternate" hrefLang="en" href="https://allaboutpdfediting.xyz/compress"/>
<link rel="alternate" hrefLang="es" href="https://allaboutpdfediting.xyz/es/compress"/>
<link rel="alternate" hrefLang="x-default" href="https://allaboutpdfediting.xyz/compress"/>
<meta property="og:url" content="https://allaboutpdfediting.xyz/es/compress"/>

Full sweep of all 147 routes:
ALL ROUTES: self-canonical + titled OK
```

## Phase 2 — sitemap/robots/redirects verification (localhost)

```
$ curl -s http://localhost:3000/robots.txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /vault
Disallow: /dashboard
Disallow: /login
Disallow: /signup
Disallow: /embed
Disallow: /es/login
Disallow: /es/signup
Disallow: /es/vault
Disallow: /es/embed
Disallow: /es/dashboard

Sitemap: https://allaboutpdfediting.xyz/sitemap.xml

$ node scripts/check-sitemap-robots.mjs http://localhost:3000
sitemap URL count: 181
distinct lastmod values: 5
OK: no sitemap URL matches a Disallow rule

Redirects: /adobe-acrobat-alternative -> /vs/adobe-acrobat (308),
           /ilovepdf-alternative -> /vs/ilovepdf (308), /smallpdf-alternative -> /vs/smallpdf (308)

Internal link crawl (454 URLs discovered from 17 seed pages): non-200: 0
```

## Phase 3 — consolidation verification (localhost)

```
Redirects (308, permanent):
  /blog/compress-pdf-without-losing-quality -> /blog/how-to-compress-pdf
  /blog/merge-multiple-pdfs-into-one        -> /blog/how-to-merge-pdf
  /blog/convert-image-to-pdf                -> /blog/how-to-convert-image-to-pdf
  /blog/search-and-redact-pdf               -> /blog/redact-pdf-online
  /blog/edit-pdf-metadata                   -> /blog/clean-pdf-metadata

/compress raw-HTML (SSR) content check: "How PDF Compression Works", "How We Handle Your Files",
"Frequently Asked Questions", FAQ text all present without JS.
Sitemap: 176 URLs (5 removed), 5 distinct lastmod values, no Disallow collisions.
Internal link crawl: 449 URLs, non-200: 0.
vitest: 162 passed.
```

## Phase 4 — structured data verification (localhost)

```
/compress JSON-LD: BreadcrumbList(3 items), FAQPage(4 Q/A = visible), SoftwareApplication,
WebApplication, WebSite, Organization; visible <nav aria-label="Breadcrumb">; HowTo: 0;
aggregateRating: 0 on every previously-faking page.
/blog/how-to-compress-pdf JSON-LD: Article (author Person), BreadcrumbList, WebSite, Organization.
```

## Phase 6 — link architecture verification (rendered-HTML crawl)

```
pages crawled: 480 | distinct internal hrefs: 480
SITEMAP URLs with ZERO internal inbound links: 0   (the 30 /error/* guides were orphans; now linked from the HTML sitemap's "PDF Error Guides" group)
/es/compress cross-links: /es, /es/tools, /es/compress, /es/merge, /es/split, /es/image-to-pdf, /es/edit-pdf
vitest: 162 passed
```
