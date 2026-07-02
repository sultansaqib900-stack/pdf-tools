"use client";

import { useEffect } from "react";
import { verifyPremiumServer, setPremium } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

export default function PremiumVerifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.premium) {
      setPremium(true);
    } else {
      verifyPremiumServer(user?.email);
    }
  }, [user]);

  return null;
}
