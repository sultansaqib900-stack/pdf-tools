"use client";

/**
 * Mounts the Monetag vignette schedule for non-Premium visitors:
 *  - first vignette 5 seconds after the page opens,
 *  - one more after every 3 completed tool tasks,
 *  - never for Premium members (including an upgrade in the current session).
 *
 * Mounted inside <EmbedModeDetector> in the root layout so embedded
 * ("?embed=1") widgets stay ad-free.
 */

import { useEffect } from "react";
import { createAdScheduler, setActiveAdScheduler } from "@/lib/ads";
import {
  getPremiumSnapshot,
  isPremium,
  subscribePremium,
} from "@/lib/premium";
import {
  isMonetagConfigured,
  MONETAG_VIGNETTE_ZONE,
  monetagVignetteUrl,
} from "@/lib/monetag";

const SCRIPT_MARKER = "data-pdftools-monetag-vignette";
let currentScript: HTMLScriptElement | null = null;

/** Remove every tag injected by this integration (including an HMR orphan). */
export function removeMonetagVignette(): void {
  if (typeof document === "undefined") return;
  currentScript?.remove();
  currentScript = null;
  document
    .querySelectorAll<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`)
    .forEach((script) => script.remove());
}

/**
 * Execute the exact Monetag tag from src/tag.txt. A fresh script element is
 * appended for every scheduled display; setting data-zone before src/append is
 * required by Monetag's loader.
 */
export function showMonetagVignette(): void {
  if (
    typeof document === "undefined" ||
    !isMonetagConfigured() ||
    isPremium()
  ) {
    return;
  }

  try {
    removeMonetagVignette();
    const script = document.createElement("script");
    script.async = true;
    script.dataset.zone = MONETAG_VIGNETTE_ZONE;
    script.src = monetagVignetteUrl();
    script.setAttribute(SCRIPT_MARKER, "true");
    script.setAttribute("data-cfasync", "false");
    script.onerror = () => {
      script.remove();
      if (currentScript === script) currentScript = null;
    };
    currentScript = script;

    // This matches the dashboard snippet, which prefers body and falls back to
    // documentElement. AdManager mounts after <body>, but keep the fallback for
    // tests and defensive use.
    (document.body || document.documentElement).appendChild(script);
  } catch {
    // Advertising must never break the tool experience.
    removeMonetagVignette();
  }
}

export default function AdManager() {
  useEffect(() => {
    const scheduler = createAdScheduler({
      showVignette: showMonetagVignette,
      hideVignette: removeMonetagVignette,
      isPremium,
      isPremiumReady: () => getPremiumSnapshot().ready,
      subscribePremium,
    });
    setActiveAdScheduler(scheduler);
    scheduler.start();
    return () => {
      setActiveAdScheduler(null);
      scheduler.stop();
    };
  }, []);

  return null;
}
