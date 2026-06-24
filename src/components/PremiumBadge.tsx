"use client";

import { useState } from "react";

export default function PremiumBadge() {
  const isPremium = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("pdftools_premium") === "true";
  })[0];

  if (!isPremium) return null;

  return (
    <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold px-2.5 py-0.5 rounded-full ml-2">
      Premium
    </span>
  );
}
