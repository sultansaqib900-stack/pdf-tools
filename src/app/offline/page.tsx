"use client";

import Icon from "@/components/ui/Icon";

export default function OfflinePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[var(--r-xl)] bg-[var(--premium-subtle)] text-[var(--premium)] dark:text-[var(--premium)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">You&apos;re offline</h1>
      <p className="text-[var(--muted)] mb-8 leading-relaxed">
        PDFTools needs an internet connection to process files.
        The following tools are cached and available offline:
      </p>
      <ul className="text-sm text-[var(--muted)] space-y-2 mb-8">
        <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-[var(--success)]" />Compress PDF</li>
        <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-[var(--success)]" />Merge PDF</li>
        <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-[var(--success)]" />Split PDF</li>
      </ul>
      <div className="flex justify-center gap-3">
        <a href="/" className="px-5 py-2.5 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] transition text-sm">
          Go Home
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-medium rounded-[var(--r-lg)] hover:bg-[var(--border)] transition text-sm"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
