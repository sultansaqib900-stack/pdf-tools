"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PREMIUM_TOOLS, TOOL_CATALOG } from "@/lib/toolCatalog";
import { localeSwitchHref, pathLocale as detectPathLocale } from "@/lib/i18n";

const ShareModal = lazy(() => import("./ShareModal"));
const ExportHistory = lazy(() => import("./ExportHistory"));

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState("midnight");
  const [menuOpen, setMenuOpen] = useState(false);
  const { premium } = usePremiumStatus();
  const [shareOpen, setShareOpen] = useState(false);

  // Accessible active dropdown state: null | 'tools' | 'premium' | 'resources' | 'theme'
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "midnight";
    setTheme(currentTheme);
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const pathLocale = detectPathLocale(pathname);

  const themes = [
    { id: "midnight", label: "Daylight", color: "#4f46e5" },
    { id: "amber", label: "Sand", color: "#d97706" },
    { id: "ocean", label: "Mint", color: "#0e7490" },
  ];

  const pickTheme = (id: string) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("theme", id);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

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
      ],
    },
    {
      name: "Edit & Organize",
      links: [
        { href: "/studio", label: "⚡ PDF Studio" },
        { href: "/edit-pdf", label: "Edit PDF" },
        { href: "/organize", label: "Organize Pages" },
        { href: "/delete-pages", label: "Delete Pages" },
        { href: "/insert-blank", label: "Insert Blank" },
        { href: "/crop", label: "Crop PDF" },
        { href: "/rotate", label: "Rotate PDF" },
        { href: "/add-page-numbers", label: "Page Numbers" },
        { href: "/annotate", label: "Annotate PDF" },
      ],
    },
    {
      name: "Security & Sign",
      links: [
        { href: "/protect", label: "Protect PDF" },
        { href: "/unlock", label: "Unlock PDF" },
        { href: "/sign", label: "Sign PDF" },
        { href: "/redact", label: "Redact PDF" },
        { href: "/watermark", label: "Watermark PDF" },
        { href: "/pii-guardian", label: "⭐ PII Guardian" },
      ],
    },
    {
      name: "Extract & AI",
      links: [
        { href: "/recipes", label: "⭐ Workflow Recipes" },
        { href: "/extract-text", label: "Extract Text" },
        { href: "/ocr-pdf", label: "OCR PDF" },
        { href: "/chat-pdf", label: "⭐ Chat with PDF" },
        { href: "/fill-form", label: "Fill Form" },
        { href: "/batch", label: "⭐ Batch Process" },
      ],
    },
  ];

  const premiumLinks = PREMIUM_TOOLS.map((tool) => ({
    href: tool.href,
    label: tool.title,
    hasFreePreview: tool.hasFreePreview,
  }));

  return (
    <header className="w-full border-b border-[var(--card-border)] bg-[var(--card)] sticky top-0 z-50 transition-colors shadow-sm" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 min-w-0">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-[var(--foreground)] shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg p-1"
          aria-label="All About PDF Editing Home"
        >
          <span className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="tracking-tight text-base sm:text-lg">PDFTools</span>
            <span className="text-[10px] text-[var(--muted)] font-normal hidden sm:block">All About PDF Editing</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold min-w-0" role="navigation" aria-label="Main navigation">
          
          {/* All Tools Mega Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("tools")}
              aria-haspopup="true"
              aria-expanded={activeDropdown === "tools"}
              className={`text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDropdown === "tools" ? "bg-[var(--card-border)]/50 text-[var(--foreground)]" : ""
              }`}
            >
              <span>Tools</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "tools" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "tools" && (
              <div className="fixed left-1/2 -translate-x-1/2 top-16 w-[min(94vw,900px)] max-h-[calc(100vh-5rem)] overflow-y-auto bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl py-6 px-6 z-50 animate-scaleIn">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--card-border)]">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Comprehensive PDF Tool Suite</h3>
                    <p className="text-xs text-[var(--muted)]">Core tools process locally in your browser for privacy.</p>
                  </div>
                  <Link
                    href="/tools"
                    onClick={() => setActiveDropdown(null)}
                    className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    View All {TOOL_CATALOG.length} Tools →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {toolCategories.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 pb-1 border-b border-[var(--card-border)]">{cat.name}</p>
                      {cat.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-2 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 rounded-md transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PDF Studio Direct Link */}
          <Link
            href="/studio"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              pathname === "/studio"
                ? "bg-[var(--accent)] text-white font-bold"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/30"
            }`}
          >
            <span>⚡ PDF Studio</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white">PRO</span>
          </Link>

          {/* Workflow Recipes Link */}
          <Link
            href="/recipes"
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              pathname === "/recipes"
                ? "bg-[var(--card-border)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/30"
            }`}
          >
            Recipes
          </Link>

          {/* vs Adobe Acrobat Comparison */}
          <Link
            href="/vs/adobe-acrobat"
            className={`hidden xl:inline-flex px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              pathname.startsWith("/vs")
                ? "bg-[var(--card-border)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/30"
            }`}
          >
            vs Adobe
          </Link>

          {/* Premium Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("premium")}
              aria-haspopup="true"
              aria-expanded={activeDropdown === "premium"}
              className={`px-3 py-2 rounded-lg transition-colors font-bold flex items-center gap-1 whitespace-nowrap text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 ${
                activeDropdown === "premium" ? "bg-amber-100 dark:bg-amber-900/40" : ""
              }`}
            >
              <span>⭐ Premium</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "premium" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "premium" && (
              <div className="absolute top-full left-0 mt-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-3 w-72 z-50 animate-scaleIn">
                <div className="px-3 pb-2 mb-2 border-b border-[var(--card-border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">13 Premium Tools</span>
                  <Link
                    href="/premium"
                    onClick={() => setActiveDropdown(null)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Compare Plans →
                  </Link>
                </div>
                <div className="max-h-64 overflow-y-auto px-2 space-y-0.5">
                  {premiumLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 rounded-lg transition-colors"
                    >
                      ⭐ {link.label}{link.hasFreePreview ? " · Preview" : ""}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[var(--card-border)] mt-2 pt-2 px-3">
                  {premium ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setActiveDropdown(null)}
                      className="block text-center py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      ✓ Premium Active — Open Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/premium"
                      onClick={() => setActiveDropdown(null)}
                      className="block text-center py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      View Premium Plans &amp; Pricing →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("resources")}
              aria-haspopup="true"
              aria-expanded={activeDropdown === "resources"}
              className={`text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                activeDropdown === "resources" ? "bg-[var(--card-border)]/50 text-[var(--foreground)]" : ""
              }`}
            >
              <span>Resources</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "resources" && (
              <div className="absolute top-full right-0 mt-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-2 w-52 z-50 animate-scaleIn">
                <Link href="/blog" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors">📚 Guides &amp; Blog</Link>
                <Link href="/ultimate-guide-to-pdf-editing" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors">📖 Ultimate Guide</Link>
                <Link href="/qa" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors">❓ Q&amp;A Support</Link>
                <Link href="/embed" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors" rel="nofollow">🔌 Embed Widget</Link>
                <Link href="/contact" onClick={() => setActiveDropdown(null)} className="block px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors">📧 Contact Us</Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          
          {/* Quick Find / Search Jump */}
          <Link
            href="/tools"
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
            title="Search all PDF tools"
            aria-label="Search all PDF tools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>

          <div className="hidden md:block">
            <Suspense fallback={null}><ExportHistory /></Suspense>
          </div>

          {/* Share Modal Trigger */}
          <button
            onClick={() => setShareOpen(true)}
            className="hidden sm:flex p-2 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
            aria-label="Share PDFTools"
            title="Share PDFTools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Language Switcher */}
          <Link
            href={localeSwitchHref(pathname, pathLocale)}
            title={pathLocale === "es" ? "View this page in English" : "Ver esta página en español"}
            className="p-2 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors text-xs font-bold"
            aria-label="Switch language"
          >
            {pathLocale === "es" ? "EN" : "ES"}
          </Link>

          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("theme")}
              className="p-2 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors flex items-center"
              aria-label="Switch theme color"
              title="Change Theme Palette"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" style={{ backgroundColor: themes.find(t => t.id === theme)?.color }} />
            </button>
            {activeDropdown === "theme" && (
              <div className="absolute top-full right-0 mt-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-1.5 w-36 z-50 animate-scaleIn">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => pickTheme(t.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                    {theme === t.id && <span className="ml-auto text-[var(--accent)]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Premium Plan Link / Badge */}
          {premium ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              ✓ Premium
            </Link>
          ) : (
            <Link
              href="/premium"
              className="hidden sm:inline-flex items-center gap-1.5 bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
            >
              Go Premium
            </Link>
          )}

          {/* Auth Button */}
          {user ? (
            <Link
              href="/dashboard"
              rel="nofollow"
              title={user.email}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)] transition-colors max-w-[120px] sm:max-w-[150px] truncate"
            >
              <span className="truncate">{user.email.split("@")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              rel="nofollow"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {menuOpen ? (
                <line x1="18" y1="6" x2="6" y2="18" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
              {menuOpen && <line x1="6" y1="6" x2="18" y2="18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--card-border)] bg-[var(--card)] px-5 py-6 space-y-5 max-h-[85vh] overflow-y-auto">
          
          <div className="flex gap-2">
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-bold text-xs text-center shadow-sm"
            >
              ⚡ PDF Studio Workspace
            </Link>
            {!premium && (
              <Link
                href="/premium"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-lg bg-amber-600 text-white font-bold text-xs text-center shadow-sm"
              >
                Go Premium
              </Link>
            )}
          </div>

          {/* Mobile All Tools Directory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Popular Tools</span>
              <Link
                href="/tools"
                onClick={() => setMenuOpen(false)}
                className="text-xs font-bold text-[var(--accent)] hover:underline"
              >
                All {TOOL_CATALOG.length} Tools →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/compress" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Compress PDF</Link>
              <Link href="/merge" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Merge PDF</Link>
              <Link href="/split" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Split PDF</Link>
              <Link href="/edit-pdf" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Edit PDF</Link>
              <Link href="/sign" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Sign PDF</Link>
              <Link href="/pdf-to-word" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">PDF to Word</Link>
              <Link href="/ocr-pdf" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">OCR PDF</Link>
              <Link href="/protect" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Protect PDF</Link>
            </div>
          </div>

          {/* Mobile Premium Tools */}
          <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">⭐ Premium Suite</span>
              <Link href="/premium" onClick={() => setMenuOpen(false)} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">Pricing →</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {premiumLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)] truncate"
                >
                  ⭐ {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Resources */}
          <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Resources &amp; Support</span>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/blog" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Guides &amp; Blog</Link>
              <Link href="/vs/adobe-acrobat" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">vs Adobe Pro</Link>
              <Link href="/qa" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Q&amp;A Help</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">Contact Us</Link>
            </div>
          </div>

          {/* Mobile Auth */}
          <div className="pt-2 border-t border-[var(--card-border)] flex gap-3">
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center bg-[var(--accent)] text-white font-bold rounded-lg text-xs" rel="nofollow">
                My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center border border-[var(--card-border)] text-[var(--foreground)] font-bold rounded-lg text-xs" rel="nofollow">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex-1 py-3 text-center bg-[var(--accent)] text-white font-bold rounded-lg text-xs" rel="nofollow">
                  Create Account
                </Link>
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