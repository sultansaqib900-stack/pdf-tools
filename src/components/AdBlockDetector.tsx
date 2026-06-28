"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdBlockDetector() {
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const bait = document.createElement("div");
    bait.className = "adsbox";
    bait.style.cssText = "position:absolute;left:-9999px;height:1px;width:1px";
    document.body.appendChild(bait);
    const timer = setTimeout(() => {
      if (bait.offsetHeight === 0) setBlocked(true);
      bait.remove();
    }, 2000);
    return () => { clearTimeout(timer); bait.remove(); };
  }, []);

  if (!blocked || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md bg-[var(--card)] border border-amber-500/40 rounded-xl p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">🛡️</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">Ad blocker detected</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Ads keep PDFTools free. Please whitelist this site or consider{" "}
            <Link href="/premium" className="text-indigo-500 underline font-medium" onClick={() => setDismissed(true)}>
              going Premium
            </Link>{" "}
            to support us.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none" aria-label="Dismiss">&times;</button>
      </div>
    </div>
  );
}
