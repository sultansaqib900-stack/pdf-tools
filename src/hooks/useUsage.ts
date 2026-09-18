"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isPremium,
  peekTrialUsage,
  releaseTrialFile,
  reserveTrialFile,
  TRIAL_FILE_LIMIT,
} from "@/lib/premium";
import { getToolTier } from "@/lib/toolCatalog";
import { trackEvent } from "@/lib/analytics";

function getToolSlug(): string {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return "home";
  return path.replace(/\//g, "_");
}

export type UsageTier = "basic" | "professional";

export interface UsageReservation {
  reservationId: string;
}

/**
 * Tier-aware usage guard.
 *
 * - Basic tools: free and unlimited. No usage API is ever called.
 * - Professional tools: free users share one lifetime trial of
 *   TRIAL_FILE_LIMIT files; checkAndTrack() reserves server-side before
 *   processing begins and releaseReservation() refunds when processing fails.
 * - Premium users bypass the trial without consuming it.
 */
export function useUsage(toolName?: string) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [trialLoaded, setTrialLoaded] = useState(false);
  // SSR renders with the neutral "home" slug; the real route is resolved in an
  // effect so the first client render matches the server HTML (no hydration
  // mismatch), then the tier refreshes immediately after mount.
  const [slug, setSlug] = useState(toolName || "home");
  useEffect(() => {
    if (!toolName) setSlug(getToolSlug());
  }, [toolName]);
  const tier: UsageTier = getToolTier(slug);
  const unlimited = tier === "basic" || isPremium();

  const refreshUsage = useCallback(async () => {
    if (tier === "basic" || isPremium()) {
      setRemaining(null);
      setTrialLoaded(true);
      return;
    }
    const status = await peekTrialUsage();
    setRemaining(status.premium ? null : status.remaining);
    setTrialLoaded(true);
  }, [tier]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  /**
   * Reserve one file for a professional tool. Resolves `null` when the trial
   * is exhausted. Basic tools and premium users resolve to a no-op marker
   * without any server call.
   */
  const checkAndTrack = useCallback(async (): Promise<UsageReservation | null> => {
    trackEvent("tool_start", { tool: slug });
    if (tier === "basic") return { reservationId: "" };
    if (isPremium()) return { reservationId: "" };

    const result = await reserveTrialFile();
    if (!result.ok) {
      setRemaining(0);
      trackEvent("tool_limit_reached", { tool: slug });
      return null;
    }
    if (!result.premium && typeof result.remaining === "number") setRemaining(result.remaining);
    return { reservationId: result.reservationId };
  }, [slug, tier]);

  /** Refund a reservation after processing failed; failed files are never counted. */
  const releaseReservation = useCallback(async (reservation: UsageReservation | null) => {
    if (!reservation || !reservation.reservationId) return;
    await releaseTrialFile(reservation.reservationId);
    void refreshUsage();
  }, [refreshUsage]);

  const peekUsage = useCallback(async (): Promise<number> => {
    if (tier === "basic" || isPremium()) return 999;
    const status = await peekTrialUsage();
    setRemaining(status.premium ? null : status.remaining);
    return status.remaining ?? 0;
  }, [tier]);

  return {
    tier,
    unlimited,
    trialLoaded,
    /** Trial files left, or 999 for unlimited (basic tools / premium users). */
    remaining: unlimited ? 999 : remaining,
    limit: TRIAL_FILE_LIMIT,
    checkAndTrack,
    releaseReservation,
    peekUsage,
    refreshUsage,
  };
}
