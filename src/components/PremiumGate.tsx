"use client";

import { isPremium } from "@/lib/premium";
import AdBanner from "./AdBanner";

export default function PremiumGate({
  children,
  showAd = true,
}: {
  children: React.ReactNode;
  showAd?: boolean;
}) {
  const premium = isPremium();

  if (premium) {
    return <>{children}</>;
  }

  return (
    <div>
      {showAd && <AdBanner className="mb-6" />}
      {children}
      {showAd && <AdBanner className="mt-6" />}
    </div>
  );
}
