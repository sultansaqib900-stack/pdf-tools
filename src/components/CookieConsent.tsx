"use client";

import { useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("pdftools_cookie_consent");
  });

  const accept = () => {
    localStorage.setItem("pdftools_cookie_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--card-border)] p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[var(--muted)] flex-1">
          We use cookies for analytics and ads. By using PDFTools, you agree to our{" "}
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
