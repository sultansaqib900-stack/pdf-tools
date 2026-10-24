"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => void }).prompt();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="App installation banner"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
    >
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 shadow-xl flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">📄</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--foreground)]">Install PDFTools</p>
          <p className="text-xs text-[var(--muted)]">Install a convenient app shortcut</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Dismiss install prompt"
          className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] text-sm rounded-md transition"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
