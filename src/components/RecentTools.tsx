"use client";

import Link from "next/link";
import { useToolHistory } from "@/hooks/useToolHistory";

export default function RecentTools() {
  const { recentTools } = useToolHistory();

  if (recentTools.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8 -mt-4">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          Recent Tools
        </h3>
        <div className="flex flex-wrap gap-2">
          {recentTools.map((t) => (
            <Link
              key={t.path}
              href={`/${t.path}`}
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
