# SEO Audit — allaboutpdfediting.xyz

Audit run on branch `arena/01a0e909-pdf-tools` (repo state: `96510e0d`).
Machine-readable route table: `docs/_route-audit.tsv` (URL, client/server, own metadata?, canonical, og:url, robots, description?, keywords?, in sitemap?, internal inbound links).

---

## Phase 0 — Audit findings (no changes made in this phase)

### 0.1 Route inventory

- **147 `page.tsx` routes** under `src/app` (excluding `api`), including:
  - 1 homepage, 1 tools hub (`/tools`), ~52 tool pages
  - 56 blog directories under `src/app/blog/*` (55 posts + index)
  - 7 Spanish routes (`/es`, `/es/tools`, `/es/compress`, `/es/merge`, `/es/split`, `/es/image-to-pdf`, `/es/edit-pdf`) — matches `spanishRoutes` in `src/lib/i18n.ts`
  - 3 legacy comparison pages (`/adobe-acrobat-alternative`, `/ilovepdf-alternative`, `/smallpdf-alternative`) + 3 `/vs/*` comparison pages
  - 5 persona pages (`/pdf-tools-for-*`), `/best-free-pdf-editor`, `/ultimate-guide-to-pdf-editing`, `/qa`, `/about`, `/contact`, `/privacy`, `/terms`, `/sitemap`
  - Private/app pages: `/login`, `/signup`, `/dashboard`, `/vault`, `/embed`, `/premium`, `/studio`, `/view`, `/offline`
  - Dynamic: `/for/[slug]` (20 tools x 15 audiences = 300 programmatic pages), `/error/[slug]`

All static routes are real pages (exist and render) — including `/redact`, `/vault`, `/resize` (nav links do **not** 404).

### 0.2 CONFIRMED root cause of "duplicate of homepage"

`src/app/layout.tsx` (root layout) sets:

- `alternates: { canonical: "/" }` → renders `<link rel="canonical" href="https://allaboutpdfediting.xyz">` on every route
- `openGraph.url: "https://allaboutpdfediting.xyz"` + homepage `og:title` / `og:description`
- homepage `description` and `title.default` ("PDFTools — Free Online PDF Tools")

Next.js merges root metadata into every child that does not override those fields. **Only 11 files in the entire app set their own canonical** (`src/app/blog/chat-with-pdf-ai|compress-pdf-without-losing-quality|fill-pdf-forms-online|flatten-pdf-online|pdf-vs-image|remove-password-from-pdf|reverse-pdf-pages|sign-pdf-without-printing/page.tsx`, `src/app/qa/page.tsx`, `src/app/studio/layout.tsx`, `src/app/for/[slug]/page.tsx` via `openGraph.url` only). The other **~136 routes inherit the homepage canonical** — exactly the live-site symptom (`/compress` and `/blog/how-to-compress-pdf` both output `<link rel="canonical" href="https://allaboutpdfediting.xyz">`).

Second symptom — **doubled brand in titles** (`... | PDFTools | PDFTools`): root template is `title.template: "%s | PDFTools"` while child metadata (e.g. `src/app/compress/layout.tsx`) embeds `| PDFTools` in the title string itself.

Third symptom — **blog pages with no metadata at all** (client-component posts without a `layout.tsx`, e.g. `src/app/blog/how-to-compress-pdf/page.tsx`) inherit the homepage title, description, and og tags verbatim.

### 0.3 Every place `robots` / `noindex` / `X-Robots-Tag` is set

| Location | What it sets | Routes affected |
|---|---|---|
| `src/app/layout.tsx:56` | `robots: { index: true, follow: true, googleBot: {...} }` | all (inherited default) |
| `src/app/for/[slug]/page.tsx:37` | `robots: { index: false, follow: true }` | all 300 `/for/*` pages (intentional — doorway-page prevention) |
| `next.config.ts` headers | none (only `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) | — |
| `middleware.ts` | **does not exist** | — |
| `public/robots.txt` | **does not exist** (good — `src/app/robots.ts` is the single source) | — |
| Raw `<meta name="robots">` / `X-Robots-Tag` anywhere in `src/` or `public/` | **none** | — |

**Conclusion:** no layout-level `robots: { index: false }` exists; no content page is silently noindexed by layout inheritance. In the current codebase the ONLY noindexed URLs are the `/for/*` matrix pages (intentional) — plus whatever the *deployed* build adds. The 15 "Excluded by 'noindex'" URLs in Search Console therefore are expected to be `/for/*` example URLs (Google only reports samples). **Manual action: export the 15 URLs from GSC and confirm they are all `/for/*` (or private pages).** If any real content page appears there, it is from an older deploy and will clear after Phase 1 re-crawl.

### 0.4 robots.txt vs noindex overlap

Current `src/app/robots.ts`:

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /vault/
Disallow: /dashboard
Disallow: /login
Disallow: /signup
Disallow: /embed
Host: https://allaboutpdfediting.xyz
Sitemap: https://allaboutpdfediting.xyz/sitemap.xml
```

- No content page (tool/blog/comparison/persona/es) is `Disallow`ed. ✔
- The 29 "Blocked by robots.txt" URLs in GSC are expected to be `/login`, `/signup`, `/vault(/…)`, `/embed(/…)`, `/dashboard`, `/api/*` and any `/es/*` variants — all linked from the header/footer on every page. Expected and fine.
- **No URL is both `Disallow`ed and `noindex`ed** in the current codebase (`/for/*` is noindexed but allowed to crawl; private pages are disallowed but not noindexed). ✔
- Issues found (fixed in Phase 2):
  1. `Disallow: /vault/` does **not** match `/vault` (the nav links to `/vault`, not `/vault/`).
  2. `Host:` directive is Yandex-only and ignored by Google (harmless but removed per spec).
  3. Spanish private URLs (`/es/login` etc.) are not Disallowed — those routes do not exist today (404), but rules are added defensively.

### 0.5 Sitemap audit (`src/app/sitemap.ts` as of `96510e0d`)

- Parses to **~62 URLs** vs **147 real routes**. Missing: ~53 of 55 blog posts (BLOG array lists only 2 slugs), `/about`, `/contact`, `/privacy`, `/terms`, `/redact`, `/blog/*` majority.
- `lastModified` is one identical fallback date (`2026-09-22`) for nearly everything — must be per-URL real dates (Phase 2).
- Includes `/premium` (checkout/account entry — thin, should be held back), and includes `/for/*`? **No** — good.
- Does **not** include the legacy `*-alternative` URLs (good — they get 301s in Phase 2).
- hreflang `alternates.languages` present for the 7 ES slugs. ✔

### 0.6 Internal inbound links (code-level `href="/..."` counts)

- Orphan risk (0 inbound links found in source): the 3 `*-alternative` pages (being 301'd), blog posts not listed in the blog index (all 55 are listed ✔), `/view`, `/offline`, `/vs` hub (the `/vs/*` children are linked from the footer but the `/vs` index is not).
- `/redact` (6), `/vault` (2), `/resize` (5), `/embed` (3) are linked from nav/footer — they exist (200), so no 404s. `/vault` is intentionally `Disallow`ed → will get `nofollow` on its nav links (Phase 2) and is excluded from the sitemap.
- Tool pages are well linked from Header tool menu, Footer columns, `/tools` hub and the HTML `/sitemap` page.

### 0.7 Other observations feeding later phases

- `src/components/CanonicalTag.tsx` is **dead code** (never rendered) — `HreflangTags` *is* rendered in the root layout and emits `en, en-US, en-CA, en-GB, en-AU, en-NZ, en-IE, [es, es-ES], x-default` hreflang on every page via a **client component** (works, but will be replaced by metadata `alternates.languages` per page in Phase 1).
- Root layout metadata contains `keywords` (ignored by Google — removed in Phase 1).
- Root layout sets page-specific `openGraph.title/description/images` and `twitter.title/description` — removed in Phase 1 (kept: `metadataBase`, title default/template, `openGraph.siteName`, `openGraph.type`, `twitter.card`, Google site verification).
- `/for/*` pages are 20 tools x 15 audiences = **300 templated pages**, generated from `src/lib/programmatic-seo.ts`. They are already `noindex, follow` and absent from the XML sitemap → matches the Phase 3 default action. They remain usable landing pages for internal traffic.
- Overlapping blog pairs listed in the brief all exist as separate posts (Phase 3 merges/redirects).
- `src/app/not-found.tsx` already exists with popular-tool links (Phase 5 requirement ✔ pre-existing).
- Footer says "100% Client-Side Privacy: No files ever uploaded to any server" while `src/app/api/chat-pdf/*` and `/api/extract-tables` are server-side endpoints — Phase 7 wording must scope the claim to the local tools (claim-accuracy rule).

---

## Phase 1 — Canonicals & metadata (critical) — DONE

### What changed

| File | Change |
|---|---|
| `src/lib/seo.ts` | **NEW** — `buildMetadata({ path, title, description, locale, hasEs, type, publishedTime, modifiedTime, image, noindex })` returns a Next `Metadata` object with self-referencing `alternates.canonical`, `alternates.languages` (only when a real `/es` version exists: en, es, x-default), per-page `openGraph`/`twitter` (own title/description/url/image), and optional `robots: { index: false, follow: true }`. Titles are passed WITHOUT the brand — the root template appends `| PDFTools` exactly once. |
| `src/app/layout.tsx` | Removed `alternates.canonical: "/"`, `openGraph.url/title/description`, `twitter.title/description`, `description`, `keywords`. Kept only `metadataBase`, `title: { default: "PDFTools: Free Online PDF Tools", template: "%s | PDFTools" }`, `openGraph.siteName/type/locale`, `twitter.card`, robots defaults, icons/manifest, and the Google site-verification tag. Removed the `<HreflangTags />` client component (its en-US/en-CA/en-GB spam is replaced by per-page `alternates.languages`). |
| `src/app/page.tsx` + `src/components/HomePage.tsx` | Homepage UI moved to `src/components/HomePage.tsx` (unchanged behavior); `src/app/page.tsx` is now a server component exporting homepage metadata (absolute title + own description + canonical `/`). |
| All ~120 existing `layout.tsx`/`page.tsx` metadata exports (tools, blog, vs, persona, studio, qa, sitemap, error pages…) | Rewritten as `buildMetadata(...)` calls. Titles had trailing `| PDFTools`/`| PDFTools Premium` stripped (fixes `... | PDFTools | PDFTools`). Blog posts get `type: "article"`. Full list = every file under `src/app/**` that exports `metadata` (see git diff). |
| 19 new blog `layout.tsx` files (client posts that had NO metadata at all) | `src/app/blog/{add-qr-code-to-pdf,ai-pdf-summarization,automate-pdf-workflow,bates-numbering-pdf,bulk-rename-pdf-files,clean-pdf-metadata,compare-pdfs-online,convert-pdf-to-audio,create-pdf-booklet,extract-pdf-form-data,generate-pdf-certificates,google-drive-pdf-editor,how-to-compress-pdf,how-to-convert-image-to-pdf,how-to-merge-pdf,invert-pdf-colors,search-and-redact-pdf,secure-pdf-vault,split-pdf-by-bookmarks}/layout.tsx` — title/description taken from each post's own `ArticleJsonLd`/H1. |
| 7 new tool `layout.tsx` files | `src/app/{edit-pdf,ocr-pdf,pdf-to-pdfa,pdf-to-word,repair-pdf,scan-to-pdf,word-to-pdf}/layout.tsx` — unique titles + 140–160 char descriptions. |
| 5 new ES `layout.tsx` files | `src/app/es/{compress,merge,split,image-to-pdf,edit-pdf}/layout.tsx` — Spanish titles/descriptions, canonical = the `/es/...` URL (never the English one), hreflang set, `og:locale es_ES`. |
| Private pages | `layout.tsx` with `robots: { index: false, follow: true }` for `/login`, `/signup`, `/dashboard`, `/embed`, `/view`, `/offline`, `/vault`. `/premium` kept **indexable** — it is a real pricing page (2 plans, feature lists), not just checkout UI; noted as a judgment call below. |
| `src/app/{about,privacy,terms,blog,contact}` | Own metadata added (`blog`/`about`/`privacy`/`terms` inline in server `page.tsx`; `contact` via new `layout.tsx`). |
| `src/app/for/[slug]/page.tsx`, `src/app/error/[slug]/page.tsx` | `generateMetadata` now calls `buildMetadata` (self-canonical). `/for/*` keeps `robots: { index: false, follow: true }`. |
| `src/lib/programmatic-seo.ts` | Titles no longer append `| PDFTools` (template does). |
| `src/hooks/usePageMeta.ts` | Client-side title/og mutation gutted (now a no-op) — it was flipping `document.title` after hydration and never affected canonicals. Server metadata is authoritative. |
| `src/app/es/layout.tsx` + `src/app/es/page.tsx` | `/es` home metadata moved to `page.tsx`; the ES layout exports no metadata (an `absolute` title there suppressed the root title template for all ES children). |

### Verification (localhost, `next build && next start`)

See `docs/verification-log.md` for the full curl output. Summary:

- `/`, `/compress`, `/merge`, `/blog/how-to-compress-pdf`, `/vs/ilovepdf`, `/es/compress` all show:
  - `<link rel="canonical">` = **their own URL** (the `/es` page canonicalizes to `/es/compress`, not `/compress`)
  - `<title>` with the brand exactly once (e.g. `Compress PDF Online Free — Reduce PDF File Size | PDFTools`)
  - a unique `<meta name="description">`
  - `og:url` = own URL
  - `hreflang` `en`/`es`/`x-default` **only** on the 7 pages with real Spanish versions (home, tools, compress, merge, split, image-to-pdf, edit-pdf); blog and `/vs` pages correctly emit none
- Programmatic sweep of **all 147 routes**: `ALL ROUTES: self-canonical + titled OK`
- `vitest`: 32 files / 162 tests passed
- `next build`: clean (502 static pages)

## Phase 2 — Sitemap, robots, redirects — DONE

### What changed

| File | Change |
|---|---|
| `src/app/sitemap.ts` | Rewritten. **181 URLs** (was ~62): homepage, 55 tool pages, `/tools`, `/studio`, `/pii-guardian`, `/recipes`, `/premium`, `/qa`, `/blog` + all 56 posts, `/vs/*`, persona pages, `/about`, `/contact`, `/privacy`, `/terms`, 30 `/error/*` pages (imported from `getErrorPages()`), and the 7 `/es` pages. `lastModified` uses **real dates** — blog posts carry their `ArticleJsonLd datePublished` (2026-06-24…27), other pages their git last-change date. No `new Date()`, no `priority`/`changefreq`. hreflang `alternates.languages` (en/es/x-default) emitted for the 7 pages with real Spanish versions. Excluded: `/sitemap` (HTML), `/login`, `/signup`, `/dashboard`, `/vault`, `/embed`, `/view`, `/offline` (private/noindex; the first five are also robots-Disallowed), `/for/*` (noindex), the three `*-alternative` URLs (now 308). `/redact` and `/resize` included (200 + real content). `/vault` deliberately excluded: it is Disallowed in robots.txt, so it must not appear in the sitemap. |
| `src/lib/seo-dates.ts` | **NEW** — `PAGE_DATES` map: the authoritative last-change date per route (feeds sitemap `lastModified`). Bump an entry when page content actually changes. |
| `src/app/robots.ts` | Rewritten rules: removed `Host:` (Yandex-only), `Disallow: /vault/` → `/vault` (matches the nav's `/vault` link), added `/es/login`, `/es/signup`, `/es/vault`, `/es/embed`, `/es/dashboard`. Kept `Allow: /`, `/api/`, `/dashboard`, `/login`, `/signup`, `/embed` and the `Sitemap:` line. Nothing blocks `/_next/static/` or other assets. |
| `next.config.ts` | +3 permanent redirects: `/adobe-acrobat-alternative`→`/vs/adobe-acrobat`, `/ilovepdf-alternative`→`/vs/ilovepdf`, `/smallpdf-alternative`→`/vs/smallpdf` (Next answers 308, the modern permanent equivalent of 301). |
| `src/app/{adobe-acrobat,ilovepdf,smallpdf}-alternative/` | Page directories deleted — the URLs are preserved by the redirects. |
| `src/app/sitemap/page.tsx` | The 3 links to `*-alternative` now point at `/vs/*`. |
| `src/components/Header.tsx`, `src/components/Footer.tsx` | `rel="nofollow"` added to private links (`/login`, `/signup`, `/dashboard`, `/vault`, `/embed`) per spec. |
| `scripts/check-sitemap-robots.mjs` | **NEW** — script that asserts no sitemap URL matches a robots Disallow rule and that lastModified values vary. |

### Verification (localhost)

```
$ node scripts/check-sitemap-robots.mjs http://localhost:3000
robots.txt Disallow prefixes: /api/, /vault, /dashboard, /login, /signup, /embed, /es/login, /es/signup, /es/vault, /es/embed, /es/dashboard
sitemap URL count: 181
distinct lastmod values: 5 (2026-06-24 .. 2026-06-27 blog, 2026-09-28 pages)
OK: no sitemap URL matches a Disallow rule

$ curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://localhost:3000/ilovepdf-alternative
308 -> /vs/ilovepdf   (same for adobe-acrobat/smallpdf)

$ node scripts/crawl-internal.mjs   # nav+footer+body links from 17 seed pages
crawled URLs: 454
non-200: 0
```

Internal link crawl verdict: **no 404/3xx/5xx targets** — `/redact`, `/vault`, `/embed`, `/resize` all resolve 200 (they are real pages; `/vault`/`/embed` are robots-blocked but linked with `nofollow`).

## Phase 3 — Content quality & duplication

## Phase 4 — Structured data

## Phase 5 — Performance & rendering

## Phase 6 — Internal linking

## Phase 7 — Ranking strategy artifacts

## Manual actions for the site owner

## Remaining / not done
