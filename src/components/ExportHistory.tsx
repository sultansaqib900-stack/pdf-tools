"use client";

import { useState } from "react";
import { useToolHistory } from "@/hooks/useToolHistory";

export default function ExportHistory() {
  const { exportHistory, clearHistory } = useToolHistory();
  const [open, setOpen] = useState(false);

  if (exportHistory.length === 0) return null;

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--card-border)] rounded-lg hover:border-[var(--accent)] transition"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        History
        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
          {exportHistory.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
              <span className="text-xs font-semibold text-[var(--foreground)]">Export History</span>
              <button
                onClick={clearHistory}
                className="text-[10px] text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {exportHistory.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--background)] transition text-xs border-b border-[var(--card-border)] last:border-0">
                  <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">{e.fileName}</p>
                    <p className="text-[10px] text-[var(--muted)]">{e.tool} · {formatBytes(e.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
