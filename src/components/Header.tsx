"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, lazy, Suspense, useEffect } from "react";
import { isPremium } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

const ShareModal = lazy(() => import("./ShareModal"));
const ExportHistory = lazy(() => import("./ExportHistory"));

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState("midnight");
  const [menuOpen, setMenuOpen] = useState(false);
  const [premium, setPremiumState] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [premiumMenu, setPremiumMenu] = useState(false);
  const [resourcesMenu, setResourcesMenu] = useState(false);
  const [toolsMenu, setToolsMenu] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);

  useEffect(() => {
    setPremiumState(isPremium());
    const currentTheme = document.documentElement.getAttribute("data-theme") || "midnight";
    setTheme(currentTheme);
  }, []);

  const pathLocale = pathname.startsWith("/es") ? "es" : "en";

  const themes = [
    { id: "midnight", label: "Midnight", color: "#6366f1" },
    { id: "amber", label: "Amber", color: "#f59e0b" },
    { id: "ocean", label: "Ocean", color: "#06b6d4" },
  ];

  const pickTheme = (id: string) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("theme", id);
    setThemeMenu(false);
  };

  const navLinks = [
    { href: "/studio", label: "⚡ PDF Studio", highlight: true },
    { href: "/recipes", label: "⚡ Recipes" },
    { href: "/pii-guardian", label: "🛡️ PII Guardian" },
    { href: "/vs/adobe-acrobat", label: "⚔️ vs Adobe" },
    { href: "/compress", label: "Compress" },
  ];

  const toolCategories = [
    {
      name: "Convert & Compress",
      links: [
        { href: "/compress", label: "Compress PDF" },
        { href: "/merge", label: "Merge PDF" },
        { href: "/split", label: "Split PDF" },
        { href: "/image-to-pdf", label: "Image to PDF" },
        { href: "/scan-to-pdf", label: "Scan to PDF" },
        { href: "/pdf-to-images", label: "PDF to Images" },
        { href: "/pdf-to-word", label: "PDF to Word" },
        { href: "/word-to-pdf", label: "Word to PDF" },
        { href: "/pdf-to-excel", label: "PDF to Excel" },
        { href: "/html-to-pdf", label: "HTML to PDF" },
        { href: "/text-to-pdf", label: "Text to PDF" },
        { href: "/pdf-to-pdfa", label: "PDF to PDF/A" },
        { href: "/repair-pdf", label: "Repair PDF" },
      ],
    },
    {
      name: "Edit & Organize",
      links: [
        { href: "/studio", label: "⚡ PDF Studio (Multi-Step)" },
        { href: "/edit-pdf", label: "Edit PDF" },
        { href: "/organize", label: "Organize Pages" },
        { href: "/delete-pages", label: "Delete Pages" },
        { href: "/insert-blank", label: "Insert Blank Pages" },
        { href: "/reverse-pdf", label: "Reverse Order" },
        { href: "/crop", label: "Crop PDF" },
        { href: "/resize", label: "Resize PDF" },
        { href: "/rotate", label: "Rotate PDF" },
        { href: "/add-page-numbers", label: "Add Page Numbers" },
        { href: "/annotate", label: "Annotate PDF" },
        { href: "/word-counter", label: "Word Counter" },
        { href: "/metadata", label: "Edit Metadata" },
      ],
    },
    {
      name: "Security & Sign",
      links: [
        { href: "/pii-guardian", label: "🛡️ PII Guardian (Auto-Redact)" },
        { href: "/protect", label: "Protect PDF" },
        { href: "/unlock", label: "Unlock PDF" },
        { href: "/sign", label: "Sign PDF" },
        { href: "/redact", label: "Redact PDF" },
        { href: "/flatten-pdf", label: "Flatten PDF" },
        { href: "/watermark", label: "Watermark PDF" },
      ],
    },
    {
      name: "Extract & AI",
      links: [
        { href: "/recipes", label: "⚡ PDF Automation Recipes" },
        { href: "/extract-text", label: "Extract Text" },
        { href: "/ocr-pdf", label: "OCR PDF" },
        { href: "/chat-pdf", label: "Chat with PDF (AI)" },
        { href: "/fill-form", label: "Fill PDF Form" },
        { href: "/batch", label: "Batch Process" },
      ],
    },
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
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--background)]/85 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent shrink-0 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </span>
          <span className="tracking-tight">PDFTools</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 text-sm font-semibold ml-6" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-all whitespace-nowrap px-3 py-1.5 rounded-xl ${
                link.highlight
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-500 border border-indigo-500/20 hover:border-indigo-500 font-bold"
                  : pathname === link.href
                  ? "text-indigo-500 bg-indigo-500/10"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" onMouseEnter={() => setToolsMenu(true)} onMouseLeave={() => setToolsMenu(false)}>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 hover:bg-[var(--card-border)]/40">
              All Tools
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {toolsMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[var(--card)]/98 backdrop-blur-2xl border border-[var(--card-border)] rounded-3xl shadow-2xl py-6 min-w-[720px] z-50 animate-scaleIn grid grid-cols-4 gap-6 px-6">
                {toolCategories.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <p className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider mb-2.5 px-2.5 pb-1 border-b border-[var(--card-border)]/60">{cat.name}</p>
                    {cat.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setToolsMenu(false)}
                        className="block px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 rounded-xl transition-all font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => setPremiumMenu(true)} onMouseLeave={() => setPremiumMenu(false)}>
            <button className="text-amber-500 hover:text-amber-600 px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20">
              ⭐ Premium (13 Tools)
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${premiumMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {premiumMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[var(--card)]/98 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-2xl py-3 min-w-[240px] z-50 animate-scaleIn">
                <div className="max-h-72 overflow-y-auto px-2 space-y-0.5">
                  {premiumLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setPremiumMenu(false)}
                      className="block px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                    >
                      ⭐ {link.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[var(--card-border)] my-2" />
                <div className="px-2">
                  <Link
                    href="/premium"
                    onClick={() => setPremiumMenu(false)}
                    className="block text-center py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md shadow-amber-500/20 hover:opacity-95 transition"
                  >
                    View All Premium Plans →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => setResourcesMenu(true)} onMouseLeave={() => setResourcesMenu(false)}>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 hover:bg-[var(--card-border)]/40">
              Resources
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {resourcesMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[var(--card)]/98 backdrop-blur-2xl border border-[var(--card-border)] rounded-2xl shadow-2xl py-2 min-w-[200px] z-50 animate-scaleIn">
                <Link href="/blog" onClick={() => setResourcesMenu(false)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition">📚 Guides & Blog</Link>
                <Link href="/ultimate-guide-to-pdf-editing" onClick={() => setResourcesMenu(false)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition">📖 Ultimate Guide</Link>
                <Link href="/qa" onClick={() => setResourcesMenu(false)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition">❓ Q&A Support</Link>
                <Link href="/embed" onClick={() => setResourcesMenu(false)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition">🔌 Embed Widget</Link>
                <Link href="/contact" onClick={() => setResourcesMenu(false)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition">📧 Contact Us</Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <Suspense fallback={null}><ExportHistory /></Suspense>
          
          <button
            onClick={() => setShareOpen(true)}
            className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/50 transition-all active:scale-95"
            aria-label="Share"
            title="Share PDFTools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>

          <Link
            href={pathLocale === "es" ? pathname.replace(/^\/es/, "") || "/" : `/es${pathname === "/" ? "" : pathname}`}
            className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/50 transition-all active:scale-95 text-xs font-bold"
            aria-label="Switch language"
          >
            {pathLocale === "es" ? "EN" : "ES"}
          </Link>

          <div className="relative">
            <button
              onClick={() => setThemeMenu(!themeMenu)}
              className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/50 transition-all active:scale-95 flex items-center gap-1.5"
              aria-label="Switch theme"
              title="Change Theme"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" style={{ backgroundColor: themes.find(t => t.id === theme)?.color }} />
            </button>
            {themeMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[var(--card)]/98 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-2xl py-1.5 min-w-[140px] z-50 animate-scaleIn">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => pickTheme(t.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-all"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                    {theme === t.id && <span className="ml-auto text-indigo-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {premium ? (
            <span className="hidden sm:inline-flex bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20">
              ✓ Premium
            </span>
          ) : (
            <Link
              href="/premium"
              className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              Go Premium
            </Link>
          )}

          {user ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] hover:border-indigo-500 transition-all"
            >
              {user.email.split("@")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition"
            aria-label="Toggle Navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--card-border)] bg-[var(--card)]/98 backdrop-blur-2xl px-5 py-6 space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp">
          <Link
            href="/studio"
            onClick={() => setMenuOpen(false)}
            className="block p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-sm text-center shadow-lg shadow-indigo-500/25"
          >
            ⚡ Open PDF Studio Pipeline
          </Link>

          <div className="pt-2">
            <p className="text-xs font-extrabold text-amber-500 uppercase tracking-wider mb-2">⭐ Premium Features</p>
            <div className="grid grid-cols-2 gap-2">
              {premiumLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block p-2 rounded-xl bg-[var(--background)] text-xs font-semibold text-[var(--foreground)] hover:text-amber-500 transition border border-[var(--card-border)]"
                >
                  ⭐ {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--card-border)]">
            <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider mb-2">Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block p-2 rounded-xl bg-[var(--background)] text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition border border-[var(--card-border)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/tools" onClick={() => setMenuOpen(false)} className="block p-2 rounded-xl bg-[var(--background)] text-xs font-medium text-indigo-500 transition border border-[var(--card-border)]">All 40+ Tools →</Link>
              <Link href="/premium" onClick={() => setMenuOpen(false)} className="block p-2 rounded-xl bg-[var(--background)] text-xs font-medium text-amber-500 transition border border-[var(--card-border)]">Premium Tier →</Link>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--card-border)] flex gap-3">
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center bg-indigo-600 text-white font-bold rounded-xl text-xs">My Account</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center border border-[var(--card-border)] text-[var(--foreground)] font-bold rounded-xl text-xs">Sign In</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center bg-indigo-600 text-white font-bold rounded-xl text-xs">Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      </Suspense>
    </header>
  );
}
