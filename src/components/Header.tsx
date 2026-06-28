"use client";

import Link from "next/link";
import { useState, lazy, Suspense } from "react";
import { isPremium } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

const ShareModal = lazy(() => import("./ShareModal"));
const ExportHistory = lazy(() => import("./ExportHistory"));

export default function Header() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "midnight";
    return document.documentElement.getAttribute("data-theme") || "midnight";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [premium, setPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    return isPremium();
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [premiumMenu, setPremiumMenu] = useState(false);
  const [resourcesMenu, setResourcesMenu] = useState(false);
  const [toolsMenu, setToolsMenu] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);

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
    { href: "/compress", label: "Compress" },
    { href: "/merge", label: "Merge" },
    { href: "/split", label: "Split" },
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
        { href: "/extract-text", label: "Extract Text" },
        { href: "/ocr-pdf", label: "OCR PDF" },
        { href: "/chat-pdf", label: "Chat with PDF" },
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
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent shrink-0 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          PDFTools
        </Link>

        <nav className="hidden md:flex items-center gap-3 text-sm font-medium ml-4" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 after:rounded-full after:transition-all hover:after:w-full">
              {link.label}
            </Link>
          ))}
          <Link href="/image-to-pdf" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">Image to PDF</Link>
          <div className="relative" onMouseEnter={() => setToolsMenu(true)} onMouseLeave={() => setToolsMenu(false)}>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] transition-all flex items-center gap-1">
              More Tools
              <svg className={`w-3 h-3 transition-transform ${toolsMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {toolsMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl py-4 min-w-[600px] z-50 animate-scaleIn origin-top-left grid grid-cols-2 gap-x-4 gap-y-2 px-4" style={{ gridTemplateRows: "auto 1fr" }}>
                {toolCategories.map((cat) => (
                  <div key={cat.name} className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 px-3">{cat.name}</p>
                    {cat.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setToolsMenu(false)} className="block px-3 py-1.5 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 rounded-lg transition-all">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <div className="relative" onMouseEnter={() => setResourcesMenu(true)} onMouseLeave={() => setResourcesMenu(false)}>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] transition-all flex items-center gap-1">
              Resources
              <svg className={`w-3 h-3 transition-transform duration-300 ${resourcesMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {resourcesMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl py-2 min-w-[200px] z-50 animate-scaleIn origin-top-right">
                <Link href="/blog" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">📝 Blog</Link>
                <Link href="/ultimate-guide-to-pdf-editing" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">📖 Ultimate Guide</Link>
                <Link href="/tools" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">🔧 All Tools</Link>
                <Link href="/contact" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">📞 Contact</Link>
                <div className="border-t border-[var(--card-border)] my-1" />
                <p className="px-4 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Comparisons</p>
                <Link href="/smallpdf-alternative" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">vs SmallPDF</Link>
                <Link href="/ilovepdf-alternative" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">vs iLovePDF</Link>
                <Link href="/adobe-acrobat-alternative" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">vs Adobe Acrobat</Link>
                <Link href="/best-free-pdf-editor" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">🏆 Best Free PDF Editor</Link>
                <div className="border-t border-[var(--card-border)] my-1" />
                <p className="px-4 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">By Role</p>
                <Link href="/pdf-tools-for-students" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">🎓 For Students</Link>
                <Link href="/pdf-tools-for-business" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">💼 For Business</Link>
                <div className="border-t border-[var(--card-border)] my-1" />
                <p className="px-4 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">More</p>
                <Link href="/contact" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">📧 Contact</Link>
                <Link href="/qa" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">❓ Q&A</Link>
                <Link href="/offline" className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1">📡 Offline Mode</Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Suspense fallback={null}><ExportHistory /></Suspense>
          <button onClick={() => setShareOpen(true)} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all active:scale-90" aria-label="Share">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <div className="relative">
            <button onClick={() => setThemeMenu(!themeMenu)} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 transition-all active:scale-90 flex items-center gap-1.5" aria-label="Switch theme">
              <span className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" style={{ backgroundColor: themes.find(t => t.id === theme)?.color }} />
              <svg className={`w-3 h-3 transition-transform ${themeMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {themeMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl py-1 min-w-[130px] z-50 animate-scaleIn origin-top-right">
                {themes.map(t => (
                  <button key={t.id} onClick={() => pickTheme(t.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/30 transition-all">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                    {theme === t.id && <svg className="w-3 h-3 ml-auto text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition" aria-label="Menu" aria-expanded={menuOpen}>
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
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">📖 Resources</p>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">Blog</Link>
          <Link href="/ultimate-guide-to-pdf-editing" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">Ultimate Guide</Link>
          <Link href="/tools" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">All Tools</Link>
          <Link href="/pdf-tools-for-students" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">For Students</Link>
          <Link href="/pdf-tools-for-business" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">For Business</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">Contact</Link>
          <Link href="/qa" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">Q&A</Link>
          <Link href="/offline" onClick={() => setMenuOpen(false)} className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1 transition-all">Offline Mode</Link>
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
