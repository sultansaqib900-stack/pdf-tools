"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PoweredBy() {
  const searchParams = useSearchParams();
  if (searchParams?.get("embed") !== "1") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="mx-auto max-w-3xl px-4 pb-2 text-center pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-900/30 rounded-full px-4 py-1.5 shadow-sm">
          <span className="text-[10px] text-gray-500">Powered by</span>
          <a
            href="https://allaboutpdfediting.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            allaboutpdfediting.xyz — 45+ Free PDF Tools
          </a>
        </div>
      </div>
    </div>
  );
}

export default function EmbedModePoweredBy() {
  return <Suspense fallback={null}><PoweredBy /></Suspense>;
}
