"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

const SITE_URL = "https://allaboutpdfediting.xyz";

/** The full product story: every basic tool plus all professional features. */
const BASIC_FEATURES = [
  "Compress, Merge & Split PDFs",
  "e-Sign, Protect & Unlock",
  "Watermark, Rotate, Crop & Resize",
  "Delete, Reorder & Reverse Pages",
  "PDF ⇄ Word, Images, Excel & Text",
  "OCR, Forms, Flatten & Page Numbers",
  "Annotate, Redact & Edit Metadata",
];

const PRO_FEATURES = [
  "⚡ PDF Studio multi-step pipeline",
  "🤖 AI Chat with PDF",
  "🛡️ PII Guardian auto-redaction",
  "🔍 PDF Diff visual comparison",
  "⚙️ Automation Recipes",
  "🔢 Bates Numbering for legal docs",
  "🏆 Bulk Certificate Generator",
  "📖 Booklet & N-up printing",
  "⬛ Search & Redact whole words",
  "🧹 Metadata Sanitizer",
  "📑 Split by Bookmarks",
  "📊 Form Data → CSV extraction",
  "🏷️ Bulk Rename by metadata",
  "🔐 Encrypted Secure Vault",
  "📱 QR Code Stamp",
  "🎧 PDF to Audio (TTS)",
  "🎨 Dark-mode Color Inverter",
  "⚙️ Batch Process 20 files at once",
];

function getPageMeta() {
  if (typeof window === "undefined") {
    return {
      url: SITE_URL,
      title: "PDFTools",
      desc: "Free online PDF tools",
      image: "",
      summary: "",
      tool: "",
    };
  }
  const url = window.location.href;
  const title = document.title;
  const desc =
    document.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "Free online PDF tools — compress, merge, split, sign & more";
  const image =
    document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
  const toolMatch = url.match(/\/([a-z-]+)(?:\?|#|$)/);
  const tool = toolMatch ? toolMatch[1] : "";

  const proBullet = PRO_FEATURES.map((f) => `${f}`).join("\n");

  let summary: string;
  if (url.includes("/blog/")) {
    summary = `I just read this PDF guide on PDFTools 📚\n\nAll of this runs in the browser — no uploads, no signup:\n${BASIC_FEATURES.map((f) => `✅ ${f}`).join("\n")}\n\nPlus 18 pro features:\n${proBullet}\n\nRead it here:`;
  } else if (tool && tool !== "blog" && tool !== "premium") {
    const label = tool.replace(/-/g, " ");
    summary = `I just used PDFTools to ${label} — took seconds, right in the browser 🔥\n\nBasic tools are FREE & unlimited:\n${BASIC_FEATURES.map((f) => `✅ ${f}`).join("\n")}\n\nPro features included:\n${proBullet}\n\nTry it free:`;
  } else {
    summary = `PDFTools is my go-to PDF toolkit 🧰 52 tools, 100% in your browser — no uploads, no signup.\n\nBasic tools are FREE & unlimited:\n${BASIC_FEATURES.map((f) => `✅ ${f}`).join("\n")}\n\nPro features included:\n${proBullet}\n\nTry it free:`;
  }

  return { url, title, desc, image, summary, tool };
}

interface Platform {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const platforms: Platform[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20bd5a]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "X",
    color: "bg-black hover:bg-gray-800",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#166fe5]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "bg-[#0A66C2] hover:bg-[#095aa8]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "bg-[#229ED9] hover:bg-[#1c8cbf]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "bg-[#FF4500] hover:bg-[#e03d00]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-6.994 4.87-3.865 0-6.994-2.176-6.994-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12.3c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "Email",
    color: "bg-indigo-600 hover:bg-indigo-700",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function ShareModal({ open, onClose }: ShareModalProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleClose = useCallback(() => {
    setCopiedMessage(false);
    setCopiedLink(false);
    setShowAllFeatures(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  if (!open) return null;

  const { url, summary, image } = getPageMeta();
  const visibleFeatures = showAllFeatures ? PRO_FEATURES : PRO_FEATURES.slice(0, 6);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "PDFTools — Free Online PDF Tools", text: summary, url });
      } catch {
        // User dismissed the native sheet; nothing to do.
      }
    }
    handleClose();
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`${summary}\n\n${url}`);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2200);
    } catch {
      // Clipboard unavailable (permissions/insecure context); silently ignore.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Clipboard unavailable.
    }
  };

  const shareUrl = (platform: string) => {
    const text = encodeURIComponent(`${summary}\n\n${url}`);
    const u = encodeURIComponent(url);
    const t = encodeURIComponent("PDFTools — Free Online PDF Tools");
    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${text}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent(summary.slice(0, 200))}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
      case "whatsapp":
        return `https://wa.me/?text=${text}`;
      case "telegram":
        return `https://t.me/share/url?url=${u}&text=${encodeURIComponent(summary.slice(0, 900))}`;
      case "reddit":
        return `https://www.reddit.com/submit?url=${u}&title=${t}`;
      case "email":
        return `mailto:?subject=${t}&body=${encodeURIComponent(`${summary}\n\n${url}`)}`;
      default:
        return url;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Share PDFTools"
    >
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-[var(--card)] z-10 border-b border-[var(--card-border)]/60">
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">Share PDFTools 🚀</h3>
            <p className="text-xs text-[var(--muted)]">52 tools · 100% in-browser · no uploads</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[var(--card-border)] text-[var(--muted)] transition shrink-0"
            aria-label="Close share dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {image && (
          <div className="px-5 pt-4">
            <Image
              src={image}
              alt=""
              width={1200}
              height={630}
              loading="lazy"
              className="w-full aspect-[1200/630] rounded-xl object-cover border border-[var(--card-border)]"
            />
          </div>
        )}

        {/* Feature highlights */}
        <div className="px-5 pt-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
            <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider mb-2">✅ Free &amp; unlimited basics</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {BASIC_FEATURES.map((feature) => (
                <span key={feature} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {feature}
                </span>
              ))}
            </div>
            <p className="text-xs font-extrabold text-amber-500 uppercase tracking-wider mb-2">⭐ Pro features</p>
            <div className="flex flex-wrap gap-1.5">
              {visibleFeatures.map((feature) => (
                <span key={feature} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {feature}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 hover:bg-indigo-500/20 transition"
              >
                {showAllFeatures ? "− Show less" : `+ ${PRO_FEATURES.length - 6} more`}
              </button>
            </div>
          </div>
        </div>

        {/* Share message preview */}
        <div className="px-5 pt-4">
          <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">Message your friends get</p>
          <pre className="text-xs text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-3 whitespace-pre-wrap max-h-28 overflow-y-auto font-sans leading-relaxed">
            {summary}
          </pre>
        </div>

        {/* Platforms */}
        <div className="px-5 pt-4 grid grid-cols-4 gap-2.5">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={shareUrl(p.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${p.label}`}
              className={`${p.color} text-white rounded-xl px-2 py-2.5 flex flex-col items-center gap-1 transition hover:scale-105 active:scale-95`}
            >
              {p.icon}
              <span className="text-[9px] font-bold opacity-90">{p.label}</span>
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 py-5 grid grid-cols-2 gap-2.5">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-95 transition active:scale-95 shadow-md shadow-indigo-500/20"
            >
              📤 More options…
            </button>
          )}
          <button
            onClick={copyMessage}
            aria-live="polite"
            className={`py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 border ${
              copiedMessage
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent text-white hover:opacity-95"
            }`}
          >
            {copiedMessage ? "✓ Message copied!" : "Copy message"}
          </button>
          <button
            onClick={copyLink}
            aria-live="polite"
            className={`py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 border ${
              copiedLink
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : "border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-border)]/50"
            }`}
          >
            {copiedLink ? "✓ Link copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
