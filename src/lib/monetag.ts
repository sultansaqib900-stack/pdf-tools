/**
 * Monetag vignette banner integration — single source of truth.
 *
 * The vignette tag from the Monetag dashboard is a script that renders a
 * full-screen banner when it loads. We control WHEN it loads (see ads.ts):
 * 10 seconds after the visitor opens the site, then after every 3 completed
 * tasks. Premium members never see ads.
 *
 * ── PASTE YOUR TAG HERE ──────────────────────────────────────────────────
 * The default below is the site's Monetag vignette script URL. If you rotate
 * the zone in the Monetag dashboard, replace the URL here (or set the
 * NEXT_PUBLIC_MONETAG_VIGNETTE_SRC environment variable on Vercel and
 * redeploy). A full dashboard tag looks like:
 *
 *   <script data-cfasync="false" src="//n6wxm.com/vignette.min.js" async></script>
 *
 * Only the src URL belongs in this constant (https:// or // prefixed).
 */
export const MONETAG_VIGNETTE_SRC: string =
  (process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_SRC || "").trim() ||
  "https://n6wxm.com/vignette.min.js";

export function isMonetagConfigured(): boolean {
  return /^https?:|^\/\//.test(MONETAG_VIGNETTE_SRC);
}

/** Normalize `//host/path` shorthand into a loadable absolute URL. */
export function monetagVignetteUrl(): string {
  return MONETAG_VIGNETTE_SRC.startsWith("//")
    ? `https:${MONETAG_VIGNETTE_SRC}`
    : MONETAG_VIGNETTE_SRC;
}
