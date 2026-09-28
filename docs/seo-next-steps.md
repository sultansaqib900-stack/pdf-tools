# SEO Next Steps — Current Handoff

**Updated:** 2026-09-28
**Canonical site:** `https://allaboutpdfediting.xyz` (apex)
**Implementation branch:** `arena/01a0e97b-pdf-tools`

This file is the current continuation checklist. The historical audit and broader strategy remain in [`seo-audit.md`](./seo-audit.md) and [`ranking-strategy.md`](./ranking-strategy.md); keep those as the source of earlier findings and remaining content work.

## Work implemented in this change

### 1. IndexNow notifications after production deploy

- `.github/workflows/indexnow.yml` listens for a successful Vercel `Production` deployment status and also supports manual `workflow_dispatch` submissions.
- `scripts/submit-indexnow.mjs` fetches the live sitemap after deployment, validates that every URL is HTTPS and on the configured canonical host, checks the public key file, then submits the unique sitemap URLs to `https://api.indexnow.org/indexnow`.
- `src/app/indexnow-key.txt/route.ts` serves the configured key at `/indexnow-key.txt` at runtime. The value is public by design because IndexNow must verify domain ownership; do not commit it to source.
- The script skips with a warning when the GitHub secret is not configured. A key mismatch, invalid sitemap, or rejected API request fails the action. Dry-run mode validates the deployed key and sitemap without sending a submission.
- **Important:** IndexNow can notify participating search engines such as Bing; it does not submit pages to Google or replace Search Console URL Inspection.

**One-time setup:**

1. Generate a key, for example `openssl rand -hex 16` (32 hexadecimal characters).
2. Add that same value as `INDEXNOW_KEY` in the Vercel **Production** environment and as a GitHub Actions repository secret named `INDEXNOW_KEY`. Do not put the value in Git or chat.
3. Redeploy so Vercel serves the key file. Check it privately from a terminal:
   ```bash
   curl -fsS https://allaboutpdfediting.xyz/indexnow-key.txt
   ```
   The response must exactly equal the configured key. A missing or malformed key returns 404.
4. Confirm the Vercel GitHub integration emits deployment statuses and that this workflow runs after a successful **Production** deploy. If no status is emitted, use the workflow's **Run workflow** button after deployment.
5. Optional validation-only run (does not notify IndexNow):
   ```bash
   INDEXNOW_KEY='<configured-key>' \
   INDEXNOW_SITE_URL='https://allaboutpdfediting.xyz' \
   INDEXNOW_DRY_RUN=true npm run seo:indexnow
   ```

The workflow submits the site's current sitemap on each successful production deployment; the current sitemap is far below IndexNow's 10,000-URL request limit. `INDEXNOW_SITE_URL` is intentionally fixed to the apex in the workflow; update it only if the canonical host changes.

### 2. Code-level `www` → apex redirect

`next.config.ts` now returns a permanent 308 from `www.allaboutpdfediting.xyz/*` to `allaboutpdfediting.xyz/*`, preserving the path and query string. All canonicals and sitemap URLs already use the apex.

**Vercel still needs the domain attached:** add `www.allaboutpdfediting.xyz` to the same Vercel project and keep the apex as the primary domain. The redirect code cannot run if DNS/Vercel rejects the `www` hostname before the request reaches Next.js. After deployment, check:

```bash
curl -sSI 'https://www.allaboutpdfediting.xyz/blog/how-to-compress-pdf?from=check'
```

Expected: a permanent redirect (`308`) with a `Location` on `https://allaboutpdfediting.xyz/` that keeps the path and query. Also confirm Vercel continues to enforce HTTPS.

### 3. Search Console / Webmaster verification wiring

- Root metadata now uses `getSearchVerificationMetadata()` in `src/lib/search-verification.ts`.
- `GOOGLE_SITE_VERIFICATION` can override the Google HTML verification token. The existing deployed Google token remains as a fallback, so an unset env var does not remove the current tag.
- Optional `BING_SITE_VERIFICATION` adds Bing's `msvalidate.01` tag.
- Both variables are documented in `.env.example` and `DEPLOY_CHECKLIST.md`. They are public verification values, not authentication secrets.

If verifying a different URL-prefix property, set its token in Vercel and redeploy. A Google Search Console **Domain property** verified through DNS still requires its dashboard/DNS verification; an HTML token does not replace that step. After deployment, inspect the root HTML for `google-site-verification` and/or `msvalidate.01` and finish verification in the corresponding console.

### 4. First two long-tail articles

Both new articles have unique server-rendered metadata, Article JSON-LD, visible bylines, self-canonicals, entries in the blog index, XML sitemap, RSS feed, and keyword map. The related tool pages link to them.

| Article | Search intent / target | Tool connection |
|---|---|---|
| [`How to Compress a Scanned PDF Under 1MB`](../src/app/blog/compress-scanned-pdf-under-1mb/page.tsx) | Practical size-reduction workflow with legibility checks; explicitly avoids promising an exact target size | `/compress`, plus existing compression guide |
| [`How to Redact a PDF for a FOIA Request`](../src/app/blog/redact-pdf-for-foia-request/page.tsx) | Careful records-handling workflow and technical redaction checks, with a clear legal/agency-process disclaimer | `/redact`; notes that the tool rasterizes output and does not determine legal exemptions |

Both use `2026-09-28` as their publish/modified date. If either article is substantively updated later, update its Article JSON-LD dates, `src/app/sitemap.ts`, and `src/lib/seo-dates.ts` together.

## After this branch is deployed

- [ ] Configure the Vercel `www` domain and confirm its 308 redirect to the apex.
- [ ] Set `INDEXNOW_KEY` in Vercel Production and GitHub Actions; verify the key file, then confirm the post-deploy action succeeds.
- [ ] Set `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` only if a token override is needed; complete any remaining Search Console/Bing ownership steps.
- [ ] Submit/confirm `https://allaboutpdfediting.xyz/sitemap.xml` in Search Console and Bing Webmaster Tools.
- [ ] In Google Search Console URL Inspection, request indexing for the two new articles and the highest-priority pages. IndexNow does not replace this for Google. Re-crawls can take days to weeks; do not repeatedly request the same URL.
- [ ] Check Search Console Pages and Performance reports later. Record indexed status, query impressions, clicks, CTR, and position; use real queries to guide the next articles.
- [ ] Record deploy-time checks and Search Console observations in [`verification-log.md`](./verification-log.md).

## Validation commands

```bash
npm ci
npm test
npm run lint
npm run build
node scripts/check-sitemap-robots.mjs http://localhost:3000
```

The IndexNow script has unit coverage for sitemap URL validation, key-file matching, request construction, accepted responses, and dry runs. The route and search-verification metadata also have regression tests.

## Carry-forward SEO work

These earlier items remain open; details and findings are in [`seo-audit.md`](./seo-audit.md) and [`ranking-strategy.md`](./ranking-strategy.md):

- Expand below-tool content with genuinely distinct, useful material for the other core tools (start with merge, split, image-to-PDF, edit-PDF, PDF-to-Word, and OCR); avoid templated filler.
- Keep the 300 `/for/*` pages `noindex` until a small set has been rewritten with unique, audience-specific content. Do not publish size-preset landing pages until the actual presets work in the tools.
- Add visible bylines and updated dates to the existing strongest blog posts, then update their structured data and date records where content changes.
- Run real mobile Lighthouse/PageSpeed tests after deployment and record Core Web Vitals; the previous sandbox could not run Chrome.
- Mine Search Console query exports weekly, improve titles/descriptions for pages with impressions but low CTR, and publish 2–4 useful, non-templated guides per month.
- Recheck comparison-page facts quarterly and continue the no-paid-links/backlink outreach plan in `seo-tracker.md` and `BACKLINKS.md`.
