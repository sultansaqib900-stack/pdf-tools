"use client";

import { useSyncExternalStore } from "react";

const CONSENT_KEY = "pdftools_cookie_consent";
const CONSENT_EVENT = "pdftools:cookie-consent-change";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
  };
}

function isConsentPromptVisible(): boolean {
  return !localStorage.getItem(CONSENT_KEY);
}

export default function CookieConsent() {
  // The server snapshot stays hidden during hydration. React then reads the
  // browser's localStorage snapshot without changing the initial HTML tree.
  const show = useSyncExternalStore(subscribe, isConsentPromptVisible, () => false);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--card-border)] p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[var(--muted)] flex-1">
          We use analytics to understand site usage. No advertising scripts are currently loaded. See our{" "}
          <a href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
