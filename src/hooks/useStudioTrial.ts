"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { getClientId } from "@/lib/premium";
import { STUDIO_TRIAL_DURATION_MS, type StudioTrialStatus } from "@/lib/studioTrial";

export function useStudioTrial() {
  const { user, loading } = useAuth();
  const premium = usePremiumStatus();
  const [trial, setTrial] = useState<StudioTrialStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const version = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async (start = false) => {
    const request = ++version.current;
    const requestedAt = performance.now();
    setBusy(true);
    setError("");
    try {
      const clientId = getClientId();
      const response = await fetch(start ? "/api/studio/trial" : `/api/studio/trial?clientId=${encodeURIComponent(clientId)}`, {
        method: start ? "POST" : "GET",
        cache: "no-store",
        ...(start ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }) } : {}),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.error || "Could not verify PDF Studio access.");
      if (!["not_started", "active", "expired", "premium"].includes(data.status)
        || !Number.isFinite(data.remainingMs) || data.remainingMs < 0 || data.remainingMs > STUDIO_TRIAL_DURATION_MS
        || (data.status === "active" && (!Number.isFinite(data.expiresAt) || data.remainingMs <= 0))) {
        throw new Error("Could not verify PDF Studio access.");
      }
      if (version.current !== request) return;
      if (timer.current) clearTimeout(timer.current);
      // Use server-calculated duration, not the user's wall clock. Subtract
      // the request round trip conservatively and enforce expiry in open tabs.
      const remainingMs = Math.max(0, data.remainingMs - (performance.now() - requestedAt));
      setTrial({ status: data.status === "active" && !remainingMs ? "expired" : data.status, expiresAt: data.expiresAt, remainingMs });
      if (data.status === "active" && remainingMs > 0) {
        timer.current = setTimeout(() => {
          ++version.current; // Late status responses cannot reopen an expired session.
          setBusy(false);
          setTrial({ status: "expired", expiresAt: data.expiresAt, remainingMs: 0 });
        }, remainingMs);
      }
    } catch (cause) {
      if (version.current !== request) return;
      setTrial(null);
      setError(cause instanceof Error ? cause.message : "Could not verify PDF Studio access. Please try again.");
    } finally {
      if (version.current === request) setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    // Re-check on identity/payment changes, tab focus, and once a minute.
    // This effect initiates an external access check; it does not derive UI state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const onFocus = () => { void refresh(); };
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "pdftools_client_id") void refresh();
    };
    const interval = setInterval(onFocus, 60_000);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      // This ref is a request generation counter, not a DOM node. Invalidate the latest request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++version.current;
      clearInterval(interval);
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loading, user?.id, premium.premium, premium.ready, refresh]);

  return { trial, busy, error, refresh };
}
