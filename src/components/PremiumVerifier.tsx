"use client";

import { useEffect } from "react";
import { verifyPremiumServer } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function PremiumVerifier() {
  const { token, loading, user } = useAuth();

  // Re-verify on login/logout too: the session rides in an HttpOnly cookie
  // (token stays null), so without the user dependency a freshly signed-in
  // owner/Premium account would not be recognized until the next interval.
  useEffect(() => {
    if (loading) return;
    const verify = () => { void verifyPremiumServer(token || undefined); };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") verify();
    };

    verify();
    const interval = window.setInterval(verify, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loading, token, user?.id]);

  return null;
}
