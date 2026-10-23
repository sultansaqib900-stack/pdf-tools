/**
 * Monetag ads disabled — kept as empty no-op exports so existing imports remain safe
 * and never load any third-party ad script even if legacy env vars exist.
 */

export const MONETAG_VIGNETTE_SRC = "";
export const MONETAG_VIGNETTE_ZONE = "";

export function isMonetagConfigured(): boolean {
  return false;
}

export function monetagVignetteUrl(): string {
  return "";
}
