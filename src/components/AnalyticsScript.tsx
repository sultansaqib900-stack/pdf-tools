"use client";

import { useEffect } from "react";
import { GA_CONFIG } from "@/lib/analytics";

export default function AnalyticsScript() {
  useEffect(() => {
    if (!GA_CONFIG.enabled) return;

    const existing = document.querySelector(
      'script[src*="googletagmanager"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    function gtag(...args: unknown[]) {
      w.dataLayer!.push(args);
    }
    w.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_CONFIG.measurementId);
  }, []);

  return null;
}
