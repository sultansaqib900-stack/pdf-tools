# Ranking Strategy — allaboutpdfediting.xyz

A realistic plan to win long-tail and differentiated queries first, then climb toward head
terms. This domain is new and competes with iLovePDF, Smallpdf, Adobe, and Sejda for
"compress pdf"-class head terms — those are not winnable in months one through six. The
playbook below is what is winnable.

Keyword map (one primary keyword per URL, no collisions): **`docs/keyword-map.csv`**.

---

## 1. Own the differentiator: privacy & client-side processing

The real advantage is "no upload — files never leave your browser" for every core tool. It is
true (verified in code: tools run on pdf-lib/WebAssembly; only the labeled AI features send
extracted text — see `/privacy` §5) and it converts well for sensitive documents.

Target query space (in `keyword-map.csv` secondaries):

- "compress pdf without uploading" · "private pdf editor no upload" · "offline PDF tools in
  browser" · "redact pdf locally" · "pdf tools that don't store your files" · "merge confidential
  pdf online"

Actions already taken:
- `/compress` below-UI content has a "How We Handle Your Files" section (Phase 3C).
- `/privacy` §1 now scopes the claim honestly (claim-accuracy rule).
- Titles/descriptions across tool pages carry "No uploads" language where accurate.

Actions to continue:
- Add a "How we handle your files" section to the top 10 tool pages (same pattern as `/compress`).
- Publish a **"Privacy audit of online PDF tools"** linkable asset (who uploads what, tested
  methodology) — see §7.
- Outreach pitch: "the PDF tool for lawyers/accountants/healthcare that never uploads" (backed by
  the `/pdf-tools-for-*` pages once they are differentiated).

## 2. Long-tail, intent-specific keywords per page

Each page now has ONE primary + 3-7 secondaries in `docs/keyword-map.csv`. High-value patterns:

- Size targets: "compress pdf to 100kb", "compress pdf to under 1mb for email"
- Use cases: "reduce pdf size for visa application", "merge pdf for job application"
- Error-message queries: the 30 `/error/*` guides target exact error strings
  ("error 14 pdf corrupted", "pdf header not found") — a genuinely long-tail surface.

Continue: mine Search Console "queries" per page and fold new phrasings into the secondary
lists; rewrite title/description for pages with impressions and low CTR.

## 3. Preset landing pages (planned — NOT built yet; do not ship as doorway pages)

Design spec for each: a working preset wired into the real tool + unique explanatory content
(why the size target exists, what to do if the preset misses, real before/after numbers).

| URL (proposed) | Preset | Unique content |
|---|---|---|
| `/compress/to-200kb` | Balanced + downscale tuned to hit ~200KB | portals/forms with 200KB upload caps (e.g. government applications) |
| `/compress/to-1mb` | Balanced | email gateway limits; what to do if still over |
| `/reduce-pdf-size-for-email` | Balanced + 25MB→10MB target | Gmail/Outlook attachment limits table |
| `/merge/for-job-application` | Merge + optional page numbers | order-of-documents checklist for applications |

Build at most 2-3 to start, each with `robots: index`, unique H1s, and the preset applied via a
query param the tool reads (`?preset=200kb`). Until the preset actually works in the tool, do
not publish the page.

## 4. Comparison pages

`/vs/adobe-acrobat`, `/vs/ilovepdf`, `/vs/smallpdf` exist with factual tables and a dated
"Last verified: September 2026" line (Phase 7.4). Keep honest: pricing and limits change —
re-verify quarterly and update the date. Link them from the relevant tool pages (compress ↔
smallpdf/ilovepdf, edit-pdf ↔ adobe) — partial today via footer; add contextual links.

## 5. E-E-A-T & trust signals

- `/about`: real person (Saqib, independent developer), mission, contact route. ✅
- `/contact`: working form. ✅
- `/privacy`: matches the "no upload" claim, scoped honestly. ✅ (fixed Phase 7)
- Authors: blog JSON-LD names the author (Person). **Next: add a visible byline** ("by Saqib ·
  updated …") to each post — start with the top 10 posts.
- "Last updated" dates: `src/lib/seo-dates.ts` records real change dates and feeds the sitemap;
  surface them visibly on posts when editing.

## 6. Freshness & depth

- Update the ~10 best posts with original data: before/after file sizes (already in
  `/blog/how-to-compress-pdf`), browser test results, screenshots of the tools.
- 2-4 genuinely new guides per month, chosen from Search Console questions — not templated
  posts. Candidate first topics: "how to compress a scanned PDF under 1MB", "redact a PDF for a
  FOIA request (step-by-step)".
- The `/for/*` matrix stays `noindex` until each re-enabled page has real, unique content
  (Phase 3A) — never use it to inflate page count.

## 7. Backlinks (biggest lever for a new domain — never buy links or use PBNs)

Existing tracker: `seo-tracker.md` / `BACKLINKS.md` (directory checklists). Plan:

1. Launch submissions: Product Hunt, Show HN (Hacker News), Indie Hackers, AlternativeTo,
   relevant subreddits where self-promotion is allowed.
2. Embeddable widget (`/embed`): attribution link back should be **dofollow**; the embed page
   itself stays `noindex, follow`. ✅ (page noindexed; verify the widget's link has no `nofollow`
   when you ship the widget updates).
3. Linkable asset: publish the **"Online PDF tools privacy audit"** (or a PDF-compression
   benchmark with real numbers — the methodology from `/blog/how-to-compress-pdf` can seed it).
4. Outreach: university IT pages, teacher resource lists, small-business tool lists that already
   list PDF tools — pitch the privacy angle.
5. Helpful answers on Reddit/Quora/Stack Exchange where genuinely relevant (no spam).

## 8. Measurement loop

1. Verify the **Domain property** in Google Search Console + Bing Webmaster Tools; submit
   `https://allaboutpdfediting.xyz/sitemap.xml` to both.
2. After deploying Phases 1-2: URL Inspection → Request indexing for the top 10-20 pages.
3. Search Console follow-up (once, per row): Settings > robots.txt report (confirm the new fetch
   from the deployment date); Pages > Not indexed → export example URLs for each row and record
   them in `docs/seo-audit.md`; click "Validate Fix" only where the cause is actually fixed (for
   intentional `/for/*` noindex rows, validation will "fail" forever — that is expected; do not
   re-validate repeatedly).
4. Weekly: Pages report (indexed vs not, reasons), Performance report (queries, impressions, CTR,
   position). Optimize titles/descriptions for pages with impressions but low CTR.
5. Track in a simple sheet: indexed pages, impressions, clicks, average position, CWV (CrUX).

Re-crawls take days to weeks after the canonical fix — expect the "Duplicate, Google chose
different canonical" and "Alternate page with proper canonical tag" counts to move before the
index counts do.
