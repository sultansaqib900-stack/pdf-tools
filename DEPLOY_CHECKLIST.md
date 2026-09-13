# Production Deployment Checklist

This application builds without secrets, but authentication, quotas, paid access, AI, and newsletter delivery require runtime configuration. A successful Vercel build alone does not prove those integrations are configured.

## 1. Required Vercel Environment Variables

Set these for **Production** and, when testing the protected deployment, **Preview**. Do not paste values into Git or build logs.

| Variable | Required | Purpose |
|---|---:|---|
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL for auth, sessions, quotas, checkout proof, and entitlements |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `GEMINI_API_KEY` | Yes for advertised AI | Chat PDF, OCR preview, and scanned-table extraction |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Yes for checkout | HMAC verification and fail-closed checkout initialization |
| `LEMONSQUEEZY_ALLOW_TEST_MODE` | Yes | Set to `false` in Production; only use `true` on an isolated, webhook-reachable staging deployment |
| `BUTTONDOWN_API_KEY` | Yes while newsletter is shown | Newsletter delivery; the API fails visibly instead of discarding addresses |
| `SENTRY_DSN` | Optional | Server/edge error monitoring |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Browser error monitoring; a Sentry DSN is public by design |

The code also accepts the legacy Vercel integration names `pdf_tools_KV_REST_API_URL` and `pdf_tools_KV_REST_API_TOKEN`, but the standard names above are preferred. See `.env.example` for a secret-free template.

## 2. Lemon Squeezy Configuration

- Production webhook URL: `https://allaboutpdfediting.xyz/api/webhook`
- The webhook secret must exactly match `LEMONSQUEEZY_WEBHOOK_SECRET`.
- Confirm the configured Premium variant IDs are still:
  - Monthly: `1824885`
  - Yearly: `1824911`
- Subscribe the webhook to at least:
  - `order_created`, `order_refunded`
  - `subscription_created`, `subscription_updated`, `subscription_cancelled`
  - `subscription_resumed`, `subscription_expired`, `subscription_unpaused`
  - `subscription_payment_success`, `subscription_payment_recovered`, `subscription_payment_refunded`
- Keep `LEMONSQUEEZY_ALLOW_TEST_MODE=false` in Production.
- **Migration requirement:** resend a current signed subscription event for every active customer before or immediately when promoting this release. Old boolean entitlements are intentionally rejected because the previous confirmation and arbitrary-email flows could forge them without payment.

## 3. Verified Pre-Deploy Checks

Run from a clean checkout:

```bash
npm ci
npm audit
npm audit --omit=dev --audit-level=high
npx tsc --noEmit
npm test
npm run lint
npm run build
git diff --check
cmp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

Expected for this release:

- Full and production audits: **0 vulnerabilities**
- TypeScript: pass
- Tests: **108 pass across 23 files**
- ESLint: **0 errors** (126 existing warnings)
- Production build: pass; 500 static pages generated
- Catalog: exactly **52 unique tools — 39 free and 13 Premium**
- PDF.js browser worker: exact match with installed `pdfjs-dist`
- GitHub/Vercel checks: pass

## 4. Safe Runtime Configuration Probes

Run these against the candidate deployment before directing traffic, or immediately after promotion. They do **not** make a paid Gemini request or create an account. Replace `$BASE` only if the production domain differs.

```bash
BASE=https://allaboutpdfediting.xyz

# Public site and assets
curl -fsS "$BASE/" >/dev/null
curl -fsS "$BASE/sitemap.xml" >/dev/null
curl -fsS "$BASE/pdf.worker.min.mjs" | grep -q '6.3.289'

# Redis-backed read should return JSON with a numeric total
curl -fsS "$BASE/api/usage/stats"

# Expected HTTP 200: creates only an inert pending record and proves Redis + payment config
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  "$BASE/api/premium/init-checkout" \
  -H 'content-type: application/json' \
  --data '{"clientId":"deploy-readiness-probe","plan":"monthly"}'

# Expected HTTP 400: valid text but invalid client ID; proves Redis + Gemini config without calling Gemini
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  "$BASE/api/chat-pdf" \
  -H 'content-type: application/json' \
  --data '{"clientId":"","text":"readiness probe","question":"probe","mode":"qna"}'

# Expected HTTP 413: proves Redis + Gemini config before any provider call
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  "$BASE/api/extract-tables" \
  -H 'content-type: application/json' \
  --data '{}'

# Expected HTTP 400: proves Redis + Buttondown config without subscribing an address
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  "$BASE/api/subscribe" \
  -H 'content-type: application/json' \
  --data '{"email":"not-an-email"}'

# Expected HTTP 401: unsigned webhook payloads must be rejected
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  "$BASE/api/webhook" \
  -H 'content-type: application/json' \
  --data '{}'
```

Unexpected `429`, `500`, or `503` responses in these probes indicate missing/unreachable Redis or a missing integration variable and should block production promotion.

## 5. Functional Smoke Tests

- Open `/tools`; confirm 39 Free and 13 Premium tools are shown.
- Process one small PDF in a free local tool; confirm no artificial timer appears.
- Confirm a free account is limited to 10MB and Premium to 100MB.
- Confirm the sixth free processing reservation is rejected.
- Confirm Chat allows three free questions, OCR one free preview, and scanned-table extraction one free preview.
- Confirm PII Guardian masks page-1 findings for free users and does not export redactions.
- Confirm only the two starter Recipes run for free users.
- Complete one real low-value production checkout, or use a separate webhook-reachable staging deployment:
  - pending nonce alone does not activate Premium;
  - the signed configured-variant webhook activates it;
  - account/device recovery works;
  - a full refund or expiry revokes only the matching purchase;
  - a partial refund retains it;
  - if an email owns two active subscriptions, ending one does not revoke the other.
- Confirm no ad slot, ad request, ad-block prompt, or `ads.txt` route is present.
- Confirm Sentry receives a controlled test error if monitoring is enabled.

## 6. Release and Rollback

- Promote the commit containing this checklist only after sections 1–5 pass.
- Keep the previous Vercel deployment available for immediate rollback.
- If payment or Redis probes fail, roll back first; do not weaken fail-closed entitlement or AI quota checks.
