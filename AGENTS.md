## Goal
Build premium-only PDF features, redesign UI to make them visible, apply comprehensive SEO, and expand content + tools to fulfill the "allaboutpdfediting" domain name.

## Constraints & Preferences
- 100% client-side processing (no file uploads to server)
- Premium tier via LemonSqueezy payments
- Ads: Monetag vignette banners for free users only (see below). Premium members never see ads.
- Deployed on Vercel at allaboutpdfediting.xyz (custom domain live — verified 200 on all premium pages)

## Progress
### Monetag vignette ads (2026-09-22)
- `src/lib/monetag.ts` holds the vignette script URL and zone copied from `src/tag.txt` (`NEXT_PUBLIC_MONETAG_VIGNETTE_SRC` / `NEXT_PUBLIC_MONETAG_VIGNETTE_ZONE` can override them). `src/lib/ads.ts` implements the schedule; `src/components/AdManager.tsx` wires it into the root layout (inside `EmbedModeDetector`, so `?embed=1` stays ad-free).
- Schedule: first vignette 5s after page open, then one immediately per every 3 completed tool tasks (finished exports/results, Studio steps, and answered chat questions).
- Ads wait for the server-verified Premium snapshot. A member who upgrades mid-session has the injected tag removed immediately and all pending ads cancelled.
- CSP in `src/app/layout.tsx` allows the Monetag serving domains in `script-src`.
- Tests: `src/__tests__/ads.test.ts` (timing, task cadence, premium suppression).

### PDF Studio is a permanent Premium feature (2026-09-22)
- The three-day Studio trial was REMOVED (owner request). `StudioGate` now mounts the workspace only for server-verified Premium members; everyone else sees a plain upgrade page.
- Deleted: `src/lib/studioTrial.ts`, `src/lib/studioTrialStore.ts`, `src/hooks/useStudioTrial.ts`, `/api/studio/trial`. `src/lib/studio.ts` keeps only the 100MB file-size guard.
- All "three-day trial" copy replaced site-wide (home, tools, premium, header, ToolGrid, ToolSearch, catalog, studio layout).
- Regression tests: `studioGate.test.tsx` rewritten for the Premium-only gate.

### Owner Premium grant hardening (2026-09-22)
- `isAdminPremiumEmail` accepts alias env names (`ADMIN_EMAILS`, `ADMIN_EMAIL`, `PREMIUM_ADMIN_URL`, `ADMIN_URL`), extracts emails from pasted URLs/quotes, and always includes the built-in owner email so a missing/misnamed Vercel variable can't lock the owner out. KV persistence of the grant is best-effort (a KV outage never revokes it).
- `PremiumVerifier` re-verifies on login/logout (previously only on token change — which never fires for cookie sessions).
- Note for deploys: Vercel env changes require a redeploy to take effect.

### Watermark tool fix (2026-09-22)
- Root cause: pdf-lib refuses "permission-protected" PDFs (encrypted with an empty user password — common Word/Acrobat/scanner exports), surfacing as "Failed to watermark PDF."
- Fix: shared `loadPdfForEditing()` in `src/lib/pdfBytes.ts` transparently decrypts empty-password files via `@pdfsmaller/pdf-decrypt`, then loads normally; password-protected files get a friendly error pointing at Unlock PDF.
- Regression tests: `src/__tests__/watermarkPage.test.tsx` (plain + encrypted fixtures).

### UI direction change (2026-09-22)
- Moved from the dark glassmorphism look to a flat, light, iLovePDF/Adobe-style design: light paper background, white cards, solid buttons, no blur/glow/gradient text.
- `globals.css` redefines the three themes as light palettes and adds global overrides (no backdrop-filter, solid gradient buttons, calmer radii/shadows) so all 300+ pages update without per-file edits. `ThemeScript` no longer forces the `dark` class.

### Done
- **Built 13 premium-only PDF tools** (all premium-gated, not just limit-removal):
  - `/pdf-diff` — Compare two PDFs side by side with highlighted differences
  - `/certificate-generator` — Bulk-generate personalized PDF certificates from template + CSV
  - `/pdf-to-audio` — Text-to-speech with voice selection, speed control, play/pause/stop
  - `/form-data-extract` — Extract AcroForm field data from PDFs to CSV
  - `/bulk-rename` — Rename PDFs by embedded metadata (title, author, page count) with naming patterns
  - `/booklet` — Convert PDF to side-by-side booklet, 2×2 grid, or 4×4 grid
  - `/search-redact` — Auto-find and redact specific words/phrases across entire document
  - `/pdf-inverter` — Dark mode, grayscale, or high-contrast color transformation
  - `/vault` — Password-protected encrypted browser document storage via localStorage
  - `/qr-stamp` — Add QR codes (canvas-generated) to every PDF page with position/size selection
  - `/metadata-sanitizer` — Strip author, title, creator, producer, annotations, embedded files
  - `/split-by-bookmarks` — Extract chapters/sections from PDF outline/bookmarks
  - `/bates-numbering` — Sequential page numbering with prefix/suffix/padding/position
- **UI Redesign for visibility:**
  - `PremiumFeatureShowcase` component on homepage
  - Updated `ToolGrid.tsx` + `ToolCard.tsx` — Premium category, amber gradient cards/badges
  - Redesigned `/tools` page — premium tools section with ⭐
  - Redesigned `/premium` page — 13-tool grid, pricing cards, feature comparison table, claim section + CTA
  - Updated `Header.tsx` — premium dropdown nav with all 13 tools
- **SEO & Structured Data:**
  - Sitemap updated (90 entries), robots.txt with crawlDelay:10, `/vault/` disallowed
  - All premium tools have unique `usePageMeta`, `BreadcrumbJsonLd`, `SoftwareAppJsonLd`
  - Layout metadata expanded for 40+ tools with premium keywords, FAQPage JSON-LD on homepage
- **13 Blog Posts** written for premium tools (each in `src/app/blog/{slug}/page.tsx`):
  - `compare-pdfs-online` — PDF comparison guide
  - `generate-pdf-certificates` — bulk certificate generation
  - `convert-pdf-to-audio` — PDF to audio/TTS
  - `extract-pdf-form-data` — form data to CSV extraction
  - `bulk-rename-pdf-files` — metadata-based bulk rename
  - `create-pdf-booklet` — booklet printing guide
  - `search-and-redact-pdf` — search and redact words
  - `invert-pdf-colors` — dark mode & high contrast
  - `secure-pdf-vault` — encrypted document vault
  - `add-qr-code-to-pdf` — QR code stamping
  - `clean-pdf-metadata` — metadata sanitization
  - `split-pdf-by-bookmarks` — bookmark-based PDF splitting
  - `bates-numbering-pdf` — sequential page numbering
- **Blog listing page** (`/blog`) updated with all 13 new posts at top
- **Feedback Widget** — `src/components/FeedbackWidget.tsx` — floating bottom-right button, form submits to `/api/feedback` with name, message, 1-5 star rating; added to root layout
- **Directory submission URLs researched:**
  - Product Hunt, G2, Capterra, AlternativeTo, BetaList
- **Font warning** — "Failed to load dynamic font for ✓" is a Next.js 16 Turbopack internal issue; persists even after removing `next/font/google/Geist` and switching to `<link>` for Inter. Cosmetic — does not affect runtime.
- **Fixed TypeScript build errors:** `drawPage` uses `embedPage()` first; `Blob(Uint8Array)` cast; `getFieldByName` cast to `any`; removed `export const metadata` from "use client" blog posts; `showToast` → `success`/`error` named exports; `walk` made async; `BreadcrumbJsonLd` uses `item` not `url`
- **Build:** TypeScript compiles clean; full build completes (115 pages)

### Locale routing fix + full-site verification (2026-09-18)
- **Verified the running site end-to-end** (production build, `next start`): TypeScript clean, 143/143 tests pass, 0 lint errors, build succeeds, all 137 sitemap URLs and all 147 static routes return 200, no broken assets, APIs degrade gracefully without KV/Upstash credentials (local env only).
- **Found and fixed 350 broken internal links.** The Header language switcher blindly built `/es{currentPath}`, so every page without a Spanish translation (blog posts, `/for/*`, `/vs/*`, `/studio`, `/premium`, …) linked to a 404. Now `localizePath`/`localeSwitchHref` only emit `/es/...` for routes that exist and fall back to `/es` otherwise.
- **Fixed 4 broken links on the Spanish home page** (`/es/protect`, `/es/sign`, `/es/ocr-pdf`, `/es/pdf-to-word` → English tool pages) plus a duplicated "Comprimir PNG" card that pointed at `/es/compress` (also a duplicate React key).
- **Centralized the translated-route list** in `src/lib/i18n.ts` (`spanishRoutes`) — Header and `HreflangTags` now share it; `HreflangTags` previously omitted `/es/tools`, so `/tools` emitted no `es` alternate.
- **New regression test** `src/__tests__/i18nRoutes.test.ts` (12 tests): asserts `spanishRoutes` matches the real directories under `src/app/es`, that no generated locale URL lacks a page, and that no hard-coded `href`/`href:` literal in `src/**` points at a missing `/es/...` URL. Verified the guard fails when the bug is reintroduced.
- **Post-fix crawl:** 445 unique internal paths across the sitemap graph → 0 broken links.

### Blocked
- Domain `allaboutpdfediting.xyz` resolution works (200 OK), but Vercel CLI shows "already assigned to another project" when linking — managed via dashboard

## Key Decisions
- Premium gating: client-side `isPremium()` check with full-page upsell redirecting to `/premium`
- Amber/orange gradient as premium brand color to distinguish from free (indigo) tools
- Canvas for QR code generation — zero npm bloat
- Blog posts for premium tools use `"use client"` pattern with `ArticleJsonLd`, link back to tool pages + `/premium` CTA
- Feedback widget uses existing `/api/feedback` endpoint (KV-backed, rate-limited to 5/hr per IP)
- Font: switched from `next/font/google/Geist` to direct `<link>` to Google Fonts Inter — avoids the Next.js variable font download 400 error

## Next Steps
1. Build, test, and deploy to Vercel
2. Submit to directories (Product Hunt, G2, Capterra, AlternativeTo, BetaList) — user needs to create accounts / finalize submissions
3. Monitor Google Search Console for indexing of new premium pages and blog posts
4. Consider video demos/GIFs for premium tools on `/premium` page

## Critical Context
- Site live at `https://allaboutpdfediting.xyz` — verified 200 on all 13 premium tool pages
- Build: TypeScript clean, all 115+ pages compile successfully  
- Premium tools use `pdf-lib`, `pdfjs-dist`, canvas (QR codes), browser `SpeechSynthesis` API — all client-side
- KV dependency for premium verification, feedback, rate limits (via `/api/premium/*`, `/api/feedback`)
- 13 premium tool blog posts added to `/blog` listing (45 total blog posts now)
- Font warning is cosmetic — no impact on page rendering or user experience
- `allaboutpdfediting.xyz` verified in Google Search Console / DNS (Vercel nameservers)

## Relevant Files
- `src/app/split-by-bookmarks/page.tsx` — (new) Split PDF by bookmarks premium tool
- `src/app/bates-numbering/page.tsx` — (new) Bates numbering premium tool
- `src/app/blog/split-pdf-by-bookmarks/page.tsx` — (new) blog post
- `src/app/blog/bates-numbering-pdf/page.tsx` — (new) blog post
- `src/app/blog/page.tsx` — blog listing with all 45 posts
- `src/components/FeedbackWidget.tsx` — floating feedback form component
- `src/app/layout.tsx` — FeedbackWidget + Inter font link added
- `src/app/globals.css` — updated font-family to Inter
- `src/app/premium/page.tsx` — 13-tool grid, monthly "13 exclusive premium tools"
- `src/components/PremiumFeatureShowcase.tsx` — 13 premium tools displayed
- `src/components/Header.tsx` — premium dropdown with 13 tools + Bates/Split entries
- `src/components/ToolGrid.tsx` — 2 new premium tools in Premium category
- `src/app/sitemap.ts` — 90 entries incl. both new tools + both blog posts
- `src/app/tools/page.tsx` — premium section with 13 tools
