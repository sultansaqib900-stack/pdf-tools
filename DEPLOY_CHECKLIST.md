# Deploy Checklist

## Environment Variables (required on Vercel)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Required for Chat PDF AI features |
| `KV_REST_API_URL` | Upstash Redis URL — premium, rate limits, usage, checkout nonces |
| `KV_REST_API_TOKEN` | Upstash Redis token |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | For verifying LemonSqueezy webhook calls |
| `SENTRY_DSN` | Sentry error monitoring |
| `BUTTONDOWN_API_KEY` | Email subscription service |

## Pre-Deploy Checks

- [ ] `npm run build` passes (88 pages, TypeScript clean)
- [ ] `npm test` passes (36+ tests)
- [ ] All KV-dependent endpoints fall back gracefully if KV is unavailable

## Post-Deploy

- [ ] Set custom domain: `allaboutpdfediting.xyz` → Vercel nameservers
- [ ] Enable HTTPS / SSL
- [ ] Configure Vercel Analytics (or rely on GA4)
- [ ] Verify LemonSqueezy webhook points to `https://allaboutpdfediting.xyz/api/webhook`
- [ ] Verify Chat PDF works (Gemini API calls succeed)
- [ ] Verify premium checkout flow (nonce-based)
- [ ] Verify PWA install prompt works
- [ ] Verify sitemap loads at `/sitemap.xml`

## Directory Submissions (Manual)

- [ ] Product Hunt
- [ ] G2
- [ ] Capterra
- [ ] AlternativeTo
- [ ] BetaList
- [ ] SaaSHub
