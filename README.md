# PDFTools

PDFTools is a 52-tool PDF suite: 38 core tools are free and unlimited with no account, and 14 professional tools cover legal, automation, and bulk workflows. Core PDF processing and PDF Studio run locally in the browser. Optional AI chat sends extracted text (and AI OCR sends page images) to the AI service.

## Try PDF Studio free for three days

PDF Studio chains edits in one session without downloading and re-uploading between steps. Its **Studio-only** trial starts when the visitor clicks the activation button and lasts 72 hours. No account or payment card is required. Premium is required afterwards; there is no automatic charge.

- Includes Studio's editing, signing, watermarking, protection, compression, PII redaction, and recipes, with files up to 100MB.
- Does **not** grant site-wide Premium or consume the separate five-file professional-tools trial. The 38 core tools remain free.
- Uses the existing KV configuration from `.env.example`. Only identity/access timestamps go to the server, not PDF content. No schema migration or new secret is required.
- Redis server time controls expiry. The earliest activation is persisted across repeat visits and linked to an account when signing in. A KV outage fails closed with a retry option.
- Anonymous trials follow the browser identity; clearing browser storage or changing browsers can create a fresh anonymous identity. This is not an anti-fraud system.

## Development

```bash
npm ci
cp .env.example .env.local  # configure the services needed locally
npm run dev
```

Open http://localhost:3000. For a remote development preview, bind with `npm run dev -- --hostname 0.0.0.0`.

## Validation

```bash
npm test
npm run lint
npm run build
```

The Studio trial tests cover explicit activation, exact expiry, repeat and concurrent requests, device/account linking, paid bypass, storage failures, UI access, and isolation from site-wide Premium.
