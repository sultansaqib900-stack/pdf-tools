"use client";

import { useEffect } from "react";
import { verifyPremiumServer } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

/**
 * Keeps the cached premium flag honest.
 *
 * Runs on every page load and reconciles localStorage against the server in
 * both directions, so an entitlement revoked by the LemonSqueezy webhook
 * (refund, cancellation, failed payment) clears on the user's next page view
 * instead of persisting indefinitely.
 *
 * It no longer short-circuits when the session user claims premium: that value
 * comes from the same KV record the webhook clears, so trusting it without
 * asking would reintroduce the stale-grant problem it is here to prevent.
 */
export default function PremiumVerifier() {
  const { user } = useAuth();

  useEffect(() => {
    verifyPremiumServer(user?.email);
  }, [user]);

  return null;
}
