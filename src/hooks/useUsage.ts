"use client";

import { useState, useEffect, useCallback } from "react";
import { trackUsage, peekUsage as peekUsageApi, isPremium, getTotalProcessed, isUnlimited } from "@/lib/premium";
import { trackEvent } from "@/lib/analytics";

function getToolName(): string {
  if (typeof window === "undefined") return "unknown";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return "home";
  return path.replace(/\//g, "_");
}

export function useUsage(toolName?: string) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [totalProcessed, setTotalProcessed] = useState<number | null>(null);
  const [showUsageBar, setShowUsageBar] = useState(false);
  const tool = toolName || getToolName();
  const unlimited = !isPremium() && isUnlimited(tool);

  useEffect(() => {
    getTotalProcessed().then(setTotalProcessed).catch(() => setTotalProcessed(12430));
  }, []);

  const checkAndTrack = useCallback(async (): Promise<boolean> => {
    if (isPremium() || unlimited) return true;

    trackEvent("tool_start", { tool });

    const result = await trackUsage();
    if (result.remaining < 0) {
      trackEvent("tool_limit_reached", { tool });
      return false;
    }
    setRemaining(result.remaining);
    return true;
  }, [tool, unlimited]);

  const peekUsage = useCallback(async (): Promise<number> => {
    if (isPremium() || unlimited) return 999;
    const result = await peekUsageApi();
    setRemaining(result.remaining);
    return result.remaining;
  }, [unlimited]);

  const refreshUsage = useCallback(async () => {
    if (isPremium() || unlimited) return;
    const result = await trackUsage();
    setRemaining(result.remaining);
  }, [unlimited]);

  return {
    remaining: unlimited ? 999 : remaining,
    totalProcessed,
    showUsageBar,
    setShowUsageBar,
    checkAndTrack,
    peekUsage,
    refreshUsage,
    unlimited,
  };
}
