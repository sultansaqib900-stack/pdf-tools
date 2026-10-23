"use client";

/**
 * Monetag ads removed — cleans up any residual ad script element if ever mounted,
 * and never injects third-party ad tags.
 */

import { useEffect } from "react";

const SCRIPT_MARKER = "data-pdftools-monetag-vignette";

export function removeMonetagVignette(): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`)
    .forEach((script) => script.remove());
}

export function showMonetagVignette(): void {
  // Intentionally disabled — ads removed completely.
}

export default function AdManager() {
  useEffect(() => {
    removeMonetagVignette();
  }, []);

  return null;
}
