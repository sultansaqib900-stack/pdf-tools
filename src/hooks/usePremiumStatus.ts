"use client";

import { useSyncExternalStore } from "react";
import {
  getPremiumSnapshot,
  getServerPremiumSnapshot,
  subscribePremium,
} from "@/lib/premium";

export function usePremiumStatus() {
  return useSyncExternalStore(
    subscribePremium,
    getPremiumSnapshot,
    getServerPremiumSnapshot,
  );
}
