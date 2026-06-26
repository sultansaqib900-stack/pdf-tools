"use client";

import Link from "next/link";
import { useState, useEffect, lazy, Suspense } from "react";
import { isPremium } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const ShareModal = lazy(() => import("./ShareModal"));
const ExportHistory = lazy(() => import("./ExportHistory"));

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
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
  const [premiumMenu, setPremiumMenu] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = localStorage.getItem("theme");
      if (!stored) {
        setDark(true);
        document.documentElement.classList.add("dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  const premiumLinks = [
    { href: "/pdf-diff", label: "PDF Diff" },
    { href: "/certificate-generator", label: "Certificates" },
    { href: "/pdf-to-audio", label: "PDF to Audio" },
    { href: "/form-data-extract", label: "Form Data" },
    { href: "/bulk-rename", label: "Bulk Rename" },
    { href: "/booklet", label: "Booklet" },
    { href: "/search-redact", label: "Search Redact" },
    { href: "/pdf-inverter", label: "Inverter" },
    { href: "/vault", label: "Vault" },
    { href: "/qr-stamp", label: "QR Stamp" },
    { href: "/metadata-sanitizer", label: "Sanitizer" },
    { href: "/split-by-bookmarks", label: "Split Bookmarks" },
    { href: "/bates-numbering", label: "Bates Numbering" },
  ];

  return (
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent shrink-0 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          PDFTools
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium overflow-x-auto flex-nowrap scrollbar-none ml-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 after:rounded-full after:transition-all hover:after:w-full">
              {link.label}
            </Link>
          ))}
          <div className="relative" onMouseEnter={() => setPremiumMenu(true)} onMouseLeave={() => setPremiumMenu(false)}>
            <button className="text-amber-500 hover:text-amber-600 transition-all whitespace-nowrap font-semibold flex items-center gap-1 animate-glowPulse">
              Premium ⭐
              <svg className={`w-3 h-3 transition-transform duration-300 ${premiumMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {premiumMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl py-2 min-w-[200px] z-50 animate-scaleIn origin-top-right">
                {premiumLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-all hover:translate-x-1">
                    ⭐ {link.label}
                  </Link>
                ))}
                <div className="border-t border-[var(--card-border)] my-1" />
                <Link href="/premium" className="block px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-all hover:translate-x-1">
                  View All Premium →
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Suspense fallback={null}><ExportHistory /></Suspense>
          <button onClick={() => setShareOpen(true)} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all active:scale-90" aria-label="Share">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button onClick={toggleDark} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all active:scale-90" aria-label="Toggle dark mode">
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          {premium ? (
            <span className="hidden sm:inline-flex bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium animate-successBounce">✓ Premium</span>
          ) : (
            <Link href="/premium" className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md hover:shadow-amber-500/20 active:scale-95">
              Premium
            </Link>
          )}
          {user ? (
            <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--card-border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {user.email.split("@")[0]}
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--card-border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all">
              Sign In
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--card)]/95 backdrop-blur-lg px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto animate-slideUp">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">⭐ Premium Tools</p>
          {premiumLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-sm text-amber-600 hover:text-amber-700 hover:translate-x-1 transition-all">⭐ {link.label}</Link>
          ))}
          <div className="border-t border-[var(--card-border)] my-2" />
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">{link.label}</Link>
          ))}
          <Link href="/premium" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition">Premium →</Link>
          <div className="border-t border-[var(--card-border)] my-2" />
          {user ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--foreground)] font-medium">{user.email}</Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-indigo-500 font-medium">Sign In</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="block text-sm text-indigo-500 font-medium">Create Account</Link>
            </>
          )}
        </div>
      )}

      <Suspense fallback={null}>
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      </Suspense>
    </header>
  );
}
