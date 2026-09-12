"use client";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";

const allTools = [
  { label: "PDF Studio (Multi-Step Workspace)", href: "/studio", badge: "New" },
  { label: "Compress PDF", href: "/compress" },
  { label: "Merge PDF", href: "/merge" },
  { label: "Split PDF", href: "/split" },
  { label: "Image to PDF", href: "/image-to-pdf" },
  { label: "Scan to PDF", href: "/scan-to-pdf" },
  { label: "OCR PDF", href: "/ocr-pdf" },
  { label: "PDF to Images", href: "/pdf-to-images" },
  { label: "Edit PDF", href: "/edit-pdf" },
  { label: "PDF to Word", href: "/pdf-to-word" },
  { label: "Word to PDF", href: "/word-to-pdf" },
  { label: "Repair PDF", href: "/repair-pdf" },
  { label: "PDF to PDF/A", href: "/pdf-to-pdfa" },
  { label: "Protect PDF", href: "/protect" },
  { label: "Unlock PDF", href: "/unlock" },
  { label: "Redact PDF", href: "/redact" },
  { label: "Annotate PDF", href: "/annotate" },
  { label: "Sign PDF", href: "/sign" },
  { label: "Watermark PDF", href: "/watermark" },
  { label: "Rotate PDF", href: "/rotate" },
  { label: "Resize PDF", href: "/resize" },
  { label: "Crop PDF", href: "/crop" },
  { label: "Delete Pages", href: "/delete-pages" },
  { label: "Organize Pages", href: "/organize" },
  { label: "Extract Text", href: "/extract-text" },
  { label: "HTML to PDF", href: "/html-to-pdf" },
  { label: "Text to PDF", href: "/text-to-pdf" },
  { label: "PDF to Excel", href: "/pdf-to-excel" },
  { label: "PDF to Audio", href: "/pdf-to-audio" },
  { label: "Word Counter", href: "/word-counter" },
  { label: "Add Page Numbers", href: "/add-page-numbers" },
  { label: "Insert Blank Pages", href: "/insert-blank" },
  { label: "Metadata", href: "/metadata" },
  { label: "Batch Process", href: "/batch" },
  { label: "Chat with PDF (AI)", href: "/chat-pdf" },
  { label: "Fill Form", href: "/fill-form" },
  { label: "Flatten PDF", href: "/flatten-pdf" },
  { label: "Reverse PDF", href: "/reverse-pdf" },
  { label: "PDF Diff (Compare)", href: "/pdf-diff" },
  { label: "Certificate Generator", href: "/certificate-generator" },
  { label: "Bulk Rename", href: "/bulk-rename" },
  { label: "Booklet Creator", href: "/booklet" },
  { label: "Search & Redact", href: "/search-redact" },
  { label: "PDF Inverter", href: "/pdf-inverter" },
  { label: "Secure Vault", href: "/vault" },
  { label: "QR Code Stamp", href: "/qr-stamp" },
  { label: "Metadata Sanitizer", href: "/metadata-sanitizer" },
  { label: "Split by Bookmarks", href: "/split-by-bookmarks" },
  { label: "Bates Numbering", href: "/bates-numbering" },
  { label: "Form Data Extract", href: "/form-data-extract" },
];

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTools.filter((t) => t.label.toLowerCase().includes(q));
  }, [query]);

  const open = isOpen && results.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center bg-[var(--card)]/90 backdrop-blur-md border border-[var(--card-border)] rounded-2xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-lg shadow-black/5 transition-all">
        <svg className="w-5 h-5 text-indigo-500 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search 40+ free PDF tools, Studio & AI..."
          className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] w-full placeholder:text-[var(--muted)] font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="w-6 h-6 rounded-full bg-[var(--card-border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition text-xs"
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-[var(--card)]/98 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-2xl py-2 max-h-72 overflow-y-auto z-50 animate-scaleIn divide-y divide-[var(--card-border)]/40">
          {results.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => { setQuery(""); setIsOpen(false); }}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--foreground)] hover:text-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-all hover:pl-5 group"
            >
              <span className="font-medium">{tool.label}</span>
              {tool.badge ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
                  {tool.badge}
                </span>
              ) : (
                <span className="text-xs text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
