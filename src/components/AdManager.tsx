"use client";

/**
 * Mounts the Monetag vignette ad schedule for non-Premium visitors:
 *  - first vignette 10 seconds after the page opens,
 *  - one more after every 3 completed tasks,
 *  - never for Premium members (checked at show time).
 *
 * Mounted inside <EmbedModeDetector> in the root layout so embedded
 * ("?embed=1") widgets stay ad-free.
 */

import { useEffect } from "react";
import { createAdScheduler, setActiveAdScheduler } from "@/lib/ads";
import { isPremium, subscribePremium } from "@/lib/premium";
import { isMonetagConfigured, monetagVignetteUrl } from "@/lib/monetag";

let currentScript: HTMLScriptElement | null = null;

/**
 * Show one Monetag vignette. The vignette script renders its banner when it
 * executes, so a display = injecting the script fresh (cache-busted). The
 * previous node is removed first so repeated triggers keep working.
 */
export function showMonetagVignette(): void {
  if (typeof document === "undefined" || !isMonetagConfigured()) return;
  try {
    currentScript?.remove();
    const script = document.createElement("script");
    script.async = true;
    script.src = `${monetagVignetteUrl()}?t=${Date.now()}`;
    script.setAttribute("data-cfasync", "false");
    script.onerror = () => script.remove();
    currentScript = script;
    document.head.appendChild(script);
  } catch {
    // Advertising must never break the tool experience.
  }
}

export default function AdManager() {
  useEffect(() => {
    const scheduler = createAdScheduler({
      showVignette: showMonetagVignette,
      isPremium,
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
