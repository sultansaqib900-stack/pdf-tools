/**
 * Monetag vignette integration — values copied from src/tag.txt.
 *
 * Canonical dashboard tag:
 *   <script>(function(s){s.dataset.zone='11530056',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
 *
 * The tag is injected by components/AdManager.tsx only when an ad is due:
 * five seconds after opening the site and once per three completed tool tasks.
 * Premium members never receive the script.
 */

export const MONETAG_VIGNETTE_SRC: string =
  (process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_SRC || "").trim() ||
  "https://n6wxm.com/vignette.min.js";

export const MONETAG_VIGNETTE_ZONE: string =
  (process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_ZONE || "").trim() ||
  "11530056";

export function isMonetagConfigured(): boolean {
  return (
    /^https?:\/\//i.test(monetagVignetteUrl()) &&
    /^\d+$/.test(MONETAG_VIGNETTE_ZONE)
  );
}

/** Normalize `//host/path` shorthand into a loadable absolute URL. */
export function monetagVignetteUrl(): string {
  return MONETAG_VIGNETTE_SRC.startsWith("//")
    ? `https:${MONETAG_VIGNETTE_SRC}`
    : MONETAG_VIGNETTE_SRC;
}
