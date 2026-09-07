"use client";

import Link from "next/link";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
import { isPremium } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";
import Icon, { type IconName } from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";

const ES_SLUGS = new Set(["", "compress", "merge", "split", "image-to-pdf", "edit-pdf"]);

const ShareModal = lazy(() => import("./ShareModal"));

/* ── Navigation model ─────────────────────────────────────────────────────
   Consolidated from five dropdowns (Tools, Premium, Resources, Theme, auth)
   down to two: Tools and Resources. Everything else is a direct link or an
   icon button. Fewer, better-organised choices.
   ---------------------------------------------------------------------- */

const TOOL_GROUPS: { name: string; links: { href: string; label: string; icon: IconName }[] }[] = [
  {
    name: "Organise",
    links: [
      { href: "/merge", label: "Merge PDF", icon: "merge" },
      { href: "/split", label: "Split PDF", icon: "split" },
      { href: "/organize", label: "Organise pages", icon: "organize" },
      { href: "/delete-pages", label: "Delete pages", icon: "delete" },
      { href: "/rotate", label: "Rotate PDF", icon: "rotate" },
      { href: "/crop", label: "Crop PDF", icon: "crop" },
    ],
  },
  {
    name: "Convert",
    links: [
      { href: "/compress", label: "Compress PDF", icon: "compress" },
      { href: "/image-to-pdf", label: "Image to PDF", icon: "image" },
      { href: "/pdf-to-word", label: "PDF to Word", icon: "fileWord" },
      { href: "/pdf-to-excel", label: "PDF to Excel", icon: "fileSheet" },
      { href: "/pdf-to-images", label: "PDF to images", icon: "image" },
      { href: "/word-to-pdf", label: "Word to PDF", icon: "fileText" },
    ],
  },
  {
    name: "Edit & sign",
    links: [
      { href: "/edit-pdf", label: "Edit PDF", icon: "edit" },
      { href: "/annotate", label: "Annotate PDF", icon: "annotate" },
      { href: "/sign", label: "Sign PDF", icon: "signature" },
      { href: "/fill-form", label: "Fill form", icon: "form" },
      { href: "/watermark", label: "Watermark", icon: "droplet" },
      { href: "/add-page-numbers", label: "Page numbers", icon: "numbers" },
    ],
  },
  {
    name: "Secure & extract",
    links: [
      { href: "/protect", label: "Protect PDF", icon: "lock" },
      { href: "/unlock", label: "Unlock PDF", icon: "unlock" },
      { href: "/redact", label: "Redact PDF", icon: "redact" },
      { href: "/ocr-pdf", label: "OCR PDF", icon: "scan" },
      { href: "/extract-text", label: "Extract text", icon: "fileText" },
      { href: "/chat-pdf", label: "Chat with PDF", icon: "sparkles" },
    ],
  },
];

const RESOURCE_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/blog", label: "Blog", icon: "book" },
  { href: "/ultimate-guide-to-pdf-editing", label: "Ultimate guide", icon: "book" },
  { href: "/qa", label: "Questions & answers", icon: "info" },
  { href: "/contact", label: "Contact", icon: "user" },
];

const COMPARE_LINKS = [
  { href: "/smallpdf-alternative", label: "vs Smallpdf" },
  { href: "/ilovepdf-alternative", label: "vs iLovePDF" },
  { href: "/adobe-acrobat-alternative", label: "vs Adobe Acrobat" },
];

/** Shared dropdown behaviour: click to open, close on outside click / Escape. */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [premium, setPremium] = useState(false);

  const tools = useDropdown();
  const resources = useDropdown();

  // Read after mount — isPremium() touches localStorage and would desync SSR.
  useEffect(() => setPremium(isPremium()), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const isEs = pathname.startsWith("/es");
  const cleanPath = isEs ? pathname.replace(/^\/es/, "") || "/" : pathname || "/";
  // Only these pages have a Spanish translation; linking to /es/<anything else>
  // produced a 404 and shipped soft-404 links on every page.
  const hasEs = ES_SLUGS.has(cleanPath.replace(/^\//, ""));
  const localeHref = isEs ? cleanPath : `/es${cleanPath === "/" ? "" : cleanPath}`;

  const navLink =
    "px-2.5 py-1.5 rounded-[var(--r-md)] text-[0.8125rem] font-medium text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors";
  const iconBtn =
    "inline-flex items-center justify-center w-9 h-9 rounded-[var(--r-md)] text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/70">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-1">
        {/* Wordmark — flat, no gradient text */}
        <Link href="/" className="flex items-center gap-2 mr-3 shrink-0 group">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--r-md)] bg-[var(--accent)] text-[var(--accent-fg)]">
            <Icon name="fileText" size={16} strokeWidth={2} />
          </span>
          <span className="text-[0.9375rem] font-semibold tracking-tight text-[var(--foreground)]">
            PDFTools
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
          {/* Tools mega-menu */}
          <div className="relative" ref={tools.ref}>
            <button
              onClick={() => { tools.setOpen(!tools.open); resources.setOpen(false); }}
              aria-expanded={tools.open}
              aria-haspopup="true"
              className={`${navLink} inline-flex items-center gap-1`}
            >
              Tools
              <Icon name="chevronDown" size={13} className={`transition-transform duration-150 ${tools.open ? "rotate-180" : ""}`} />
            </button>
            {tools.open && (
              <div className="absolute left-0 top-full mt-1.5 w-[640px] p-4 rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-scaleIn origin-top-left z-50">
                <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                  {TOOL_GROUPS.map((g) => (
                    <div key={g.name}>
                      <p className="px-2 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {g.name}
                      </p>
                      {g.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => tools.setOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <Icon name={l.icon} size={14} className="text-[var(--muted)] shrink-0" />
                          <span className="truncate">{l.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="rule my-3" />
                <Link
                  href="/tools"
                  onClick={() => tools.setOpen(false)}
                  className="flex items-center gap-1.5 px-2 text-[0.8125rem] font-medium text-[var(--accent)] hover:underline"
                >
                  Browse all 49 tools
                  <Icon name="arrowRight" size={13} />
                </Link>
              </div>
            )}
          </div>

          <Link href="/premium" className={navLink}>Premium</Link>

          {/* Resources */}
          <div className="relative" ref={resources.ref}>
            <button
              onClick={() => { resources.setOpen(!resources.open); tools.setOpen(false); }}
              aria-expanded={resources.open}
              aria-haspopup="true"
              className={`${navLink} inline-flex items-center gap-1`}
            >
              Resources
              <Icon name="chevronDown" size={13} className={`transition-transform duration-150 ${resources.open ? "rotate-180" : ""}`} />
            </button>
            {resources.open && (
              <div className="absolute left-0 top-full mt-1.5 w-56 p-1.5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-scaleIn origin-top-left z-50">
                {RESOURCE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => resources.setOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <Icon name={l.icon} size={15} className="text-[var(--muted)]" />
                    {l.label}
                  </Link>
                ))}
                <div className="rule my-1.5" />
                <p className="px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Compare
                </p>
                {COMPARE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => resources.setOpen(false)}
                    className="block px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1" />

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setShareOpen(true)} className={`${iconBtn} hidden sm:inline-flex`} aria-label="Share this page">
            <Icon name="share" size={17} />
          </button>
          {(isEs || hasEs) && (
            <Link href={localeHref} className={`${iconBtn} hidden sm:inline-flex text-[0.6875rem] font-semibold`} aria-label={isEs ? "Switch to English" : "Cambiar a español"}>
              {isEs ? "EN" : "ES"}
            </Link>
          )}
          <ThemeToggle />

          <div className="w-px h-5 bg-[var(--border)] mx-1.5 hidden sm:block" />

          {premium ? (
            <span className="badge badge-premium hidden sm:inline-flex">
              <Icon name="star" size={10} strokeWidth={2.5} />
              Premium
            </span>
          ) : (
            <Link href="/premium" className="btn btn-primary hidden sm:inline-flex h-8 px-3 text-[0.8125rem]">
              Get Premium
            </Link>
          )}

          <Link
            href={user ? "/dashboard" : "/login"}
            className={`${iconBtn} hidden sm:inline-flex`}
            aria-label={user ? "Dashboard" : "Sign in"}
            title={user ? user.email : "Sign in"}
          >
            <Icon name="user" size={17} />
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`${iconBtn} md:hidden`}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={19} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-slideUp">
          <div className="px-4 py-4 space-y-5">
            {TOOL_GROUPS.map((g) => (
              <div key={g.name}>
                <p className="pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--muted)]">{g.name}</p>
                <div className="grid grid-cols-2 gap-0.5">
                  {g.links.map((l) => (
                    <Link key={l.href} href={l.href} className="flex items-center gap-2 py-2 text-[0.8125rem] text-[var(--muted-strong)]">
                      <Icon name={l.icon} size={15} className="text-[var(--muted)] shrink-0" />
                      <span className="truncate">{l.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="rule" />

            <div className="grid grid-cols-2 gap-0.5">
              <Link href="/tools" className="py-2 text-[0.8125rem] font-medium text-[var(--foreground)]">All tools</Link>
              {RESOURCE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="py-2 text-[0.8125rem] text-[var(--muted-strong)]">{l.label}</Link>
              ))}
              {(isEs || hasEs) && (
                <Link href={localeHref} className="py-2 text-[0.8125rem] text-[var(--muted-strong)]">
                  {isEs ? "English" : "Español"}
                </Link>
              )}
            </div>

            <div className="rule" />

            <div className="flex items-center gap-2 pb-1">
              {!premium && <Link href="/premium" className="btn btn-primary flex-1">Get Premium</Link>}
              <Link href={user ? "/dashboard" : "/login"} className="btn btn-secondary flex-1">
                {user ? "Dashboard" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        {shareOpen && <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />}
      </Suspense>
    </header>
  );
}
