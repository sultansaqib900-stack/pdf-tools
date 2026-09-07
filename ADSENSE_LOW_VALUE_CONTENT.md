# AdSense "Low value content" — Diagnosis & Remediation

Status: **code fixes applied**, awaiting re-review submission.

---

## Why AdSense rejected the site

The rejection reason "Low value content" is almost always about the *ratio* of
thin, templated pages to genuinely useful ones — not about the quality of the
best pages. This site had a severe ratio problem.

### Root cause #1 — 300 auto-generated doorway pages (primary)

`src/lib/programmatic-seo.ts` generated **20 tools × 15 audiences = 300 pages**
at `/for/*`, every one of them rendered from a single template in
`src/app/for/[slug]/page.tsx`.

Comparing any two of those URLs, the only differences were:

* the tool name and audience name substituted into the title/H1,
* one sentence of "pain point" text,
* one sentence of "benefit" text.

Everything else — the five "Key Features" bullets, the two body paragraphs, the
FAQs, the related-tools grid — was **byte-identical**. Worse, only 3 of the 20
tools (`compress`, `merge`, `split`) had tool-specific FAQs; the other 17 fell
through to the same four `generalFaqs`. So roughly **255 of the 300 pages shared
the exact same FAQ block.**

All 300 were submitted in `sitemap.xml`. Against ~115 real pages, that meant
**~72% of the submitted index was boilerplate.** That is the textbook definition
of scaled content abuse under
[Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content-abuse),
and it is what an AdSense reviewer lands on when they sample the sitemap.

### Root cause #2 — non-deterministic page content

```ts
const painPoint = uc.painPoints[Math.floor(Math.random() * uc.painPoints.length)];
```

`Math.random()` ran at module load, i.e. **at build time**. The same URL served
different body copy after every deploy. To a crawler this looks like unstable,
machine-generated content.

### Root cause #3 — duplicate, conflicting canonical tags

`src/components/CanonicalTag.tsx` was mounted in the root layout and injected a
self-referential `<link rel="canonical">` on *every* page. Pages that also
declared their own canonical via `generateMetadata` therefore emitted **two
conflicting canonical tags**. Google discards both when they conflict, so none
of the 300 thin pages were being consolidated onto their real tool page.

### Root cause #4 — `public/robots.txt` shadowed `src/app/robots.ts`

A static `public/robots.txt` took precedence over the Route Handler, so the
rules in `robots.ts` were never actually served. The static file also had a
malformed ` Crawl-Delay: 5` line (leading space, and a directive Google ignores
entirely).

### Root cause #5 — FAQ structured data on boilerplate pages

`FaqPageJsonLd` was emitted on all 300 pages. Schema markup on near-duplicate
content is an independent manual-action risk on top of the AdSense problem.

---

## What was changed

| # | Change | File |
|---|---|---|
| 1 | Added an `indexable` flag; only 6 tools × 5 audiences = **30** curated pages qualify | `src/lib/programmatic-seo.ts` |
| 2 | Exported `indexableSeoPages`; sitemap now submits **30** `/for/` URLs instead of 300 | `src/lib/programmatic-seo.ts`, `src/app/sitemap.ts` |
| 3 | Thin pages now serve `robots: noindex, follow` and canonicalise to their real tool page | `src/app/for/[slug]/page.tsx` |
| 4 | `generateStaticParams` pre-renders only indexable pages; the rest still resolve (no 404s for existing backlinks) | `src/app/for/[slug]/page.tsx` |
| 5 | FAQ + breadcrumb JSON-LD emitted **only** on indexable pages | `src/app/for/[slug]/page.tsx` |
| 6 | Pages render all three pain points as a list, not one templated sentence | `src/app/for/[slug]/page.tsx` |
| 7 | Internal links to `/for/*` restricted to indexable pages and capped at 5 | `src/components/UseCaseLinks.tsx`, `src/app/for/[slug]/page.tsx`, `src/app/sitemap/page.tsx` |
| 8 | `Math.random()` replaced with a stable FNV-1a hash — builds are reproducible | `src/lib/programmatic-seo.ts` |
| 9 | Removed `CanonicalTag`; root layout uses `alternates: { canonical: "./" }` so every page gets exactly one correct canonical | `src/app/layout.tsx` |
| 10 | Deleted `public/robots.txt`; `robots.ts` is now authoritative and explicitly allows `Mediapartners-Google` / `AdsBot-Google` | `src/app/robots.ts` |

### Measured result

```
sitemap.xml URLs:      466  ->  196
/for/ URLs submitted:  300  ->   30
thin pages in sitemap: 270  ->    0
canonical tags/page:     2  ->    1
```

Verified against a production build (`next build` + `next start`):

* `/for/compress-pdf-teachers` (thin) → `noindex, follow` + canonical to `/compress`
* `/for/compress-pdf-lawyers` (curated) → `index, follow` + self-canonical + FAQ schema

---

## Before you request an AdSense re-review

The code changes remove the *penalty signal*. AdSense also wants to see
sufficient original content, so do these first:

1. **Deploy**, then in Google Search Console submit the updated `sitemap.xml`
   and use **Removals → Temporarily remove** for the `/for/` prefix, or simply
   let the `noindex` tags be recrawled (typically 2–6 weeks for 270 URLs).
   Wait until the Pages report shows the thin URLs dropping out before
   re-applying — re-applying while they are still indexed usually gets the same
   rejection.

2. **Strengthen the 30 surviving `/for/` pages.** They are currently ~250 words
   of largely shared copy. Each needs 600+ words of genuinely audience-specific
   material: a real workflow walkthrough, a screenshot, and 3 FAQs written for
   that audience. If you cannot write that for a given combination, remove it
   from `INDEXABLE_AUDIENCES` rather than shipping it thin.

3. **Give every tool its own FAQs.** Right now 17 of 20 tools fall back to
   `generalFaqs`. Populate `generalToolFaqs` for the remaining tools — this also
   automatically widens `TOOLS_WITH_UNIQUE_FAQS`, so more pages become eligible
   for indexing on merit rather than by fiat.

4. **Add the trust pages reviewers check.** There is an `/about`, `/privacy` and
   `/terms`, but no contact route. Add a real `/contact` page with a working
   email address and link it in the footer — a missing contact method is a
   common standalone rejection reason.

5. **Confirm ad density.** Do not place ads on `noindex` pages, and make sure no
   page has more ad units than body content — "low value content" is sometimes
   issued for ad-to-content ratio rather than the content itself.

### A note on the remaining generated pages

The 32 `/error/*` pages were reviewed and **left indexable**. Unlike `/for/*`,
each has hand-written, genuinely distinct `cause`, `fixSummary` and FAQ text
addressing a specific real-world error code. They are legitimate.
