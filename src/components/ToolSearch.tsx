"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const allTools = [
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
  { label: "Chat with PDF", href: "/chat-pdf" },
  { label: "Fill Form", href: "/fill-form" },
  { label: "Flatten PDF", href: "/flatten-pdf" },
  { label: "Reverse PDF", href: "/reverse-pdf" },
  { label: "PDF Diff", href: "/pdf-diff" },
  { label: "Certificates", href: "/certificate-generator" },
  { label: "Bulk Rename", href: "/bulk-rename" },
  { label: "Booklet", href: "/booklet" },
  { label: "Search & Redact", href: "/search-redact" },
  { label: "PDF Inverter", href: "/pdf-inverter" },
  { label: "Vault", href: "/vault" },
  { label: "QR Stamp", href: "/qr-stamp" },
  { label: "Metadata Sanitizer", href: "/metadata-sanitizer" },
  { label: "Split by Bookmarks", href: "/split-by-bookmarks" },
  { label: "Bates Numbering", href: "/bates-numbering" },
  { label: "Form Data Extract", href: "/form-data-extract" },
];

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof allTools>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const filtered = allTools.filter((t) => t.label.toLowerCase().includes(q));
    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query]);

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
        <svg className="w-5 h-5 text-[var(--muted)] shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PDF tools..."
          className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] w-full placeholder:text-[var(--muted)]"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }} className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none">&times;</button>
        )}
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl py-2 max-h-64 overflow-y-auto z-50 animate-scaleIn">
          {results.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => { setQuery(""); setOpen(false); }}
              className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all hover:translate-x-1"
            >
              {tool.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
