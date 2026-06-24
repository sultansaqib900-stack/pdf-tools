"use client";

import Link from "next/link";
import { useState } from "react";
import { isPremium } from "@/lib/premium";
import ShareModal from "./ShareModal";
import ExportHistory from "./ExportHistory";

export default function Header() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [premium, setPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    return isPremium();
  });
  const [shareOpen, setShareOpen] = useState(false);

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const navLinks = [
    { href: "/compress", label: "Compress" },
    { href: "/merge", label: "Merge" },
    { href: "/split", label: "Split" },
    { href: "/image-to-pdf", label: "Image to PDF" },
    { href: "/pdf-to-images", label: "PDF to Images" },
    { href: "/protect", label: "Protect" },
    { href: "/redact", label: "Redact" },
    { href: "/annotate", label: "Annotate" },
    { href: "/unlock", label: "Unlock" },
    { href: "/watermark", label: "Watermark" },
    { href: "/sign", label: "Sign" },
    { href: "/extract-text", label: "Extract" },
    { href: "/rotate", label: "Rotate" },
    { href: "/resize", label: "Resize" },
    { href: "/crop", label: "Crop" },
    { href: "/delete-pages", label: "Delete" },
    { href: "/text-to-pdf", label: "Text to PDF" },
    { href: "/organize", label: "Organize" },
    { href: "/metadata", label: "Metadata" },
    { href: "/word-counter", label: "Words" },
    { href: "/insert-blank", label: "Blank Pages" },
    { href: "/pdf-to-excel", label: "PDF to Excel" },
    { href: "/add-page-numbers", label: "Numbers" },
    { href: "/html-to-pdf", label: "HTML to PDF" },
    { href: "/batch", label: "Batch" },
  ];

  return (
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--background)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          PDFTools
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium overflow-x-auto flex-nowrap scrollbar-none ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ExportHistory />
          <button
            onClick={() => setShareOpen(true)}
            className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
            aria-label="Share"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {premium ? (
            <span className="hidden sm:inline-flex bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              &#10003; Premium
            </span>
          ) : (
            <Link
              href="/premium"
              className="hidden sm:inline-flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Premium
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--card)] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/premium"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-indigo-500"
          >
            Premium
          </Link>
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </header>
  );
}
