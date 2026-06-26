"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

function getPageMeta() {
  const url = window.location.href;
  const title = document.title;
  const desc =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") ||
    "Free online PDF tools — compress, merge, split, sign & more";
  const image =
    document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content") || "";
  const toolMatch = url.match(/\/([a-z-]+)(?:\?|#|$)/);
  const tool = toolMatch ? toolMatch[1] : "";

  const features = [
    "Compress, Merge, Split PDFs", "Image/Text to PDF & PDF to Images",
    "Sign & e-Sign Documents", "Protect & Unlock with Passwords",
    "Extract Text & Add Page Numbers", "Watermark, Rotate & Crop Pages",
    "Resize, Organize & Delete Pages", "Fill Forms & Flatten PDFs",
    "Reverse Page Order & Edit Metadata", "AI Chat with PDF & AI OCR",
    "Batch Process Multiple Files", "100% Free — No Uploads, No Signup",
  ];
  const featuresBullet = features.map((f) => `• ${f}`).join("\n");

  let summary: string;
  if (tool && tool !== "blog" && tool !== "premium") {
    const label = tool.replace(/-/g, " ");
    summary = `I just used PDFTools to ${label} a PDF — took seconds, no signup, no uploads!\n\n25+ PDF tools:\n${featuresBullet}\n\nTry it free:`;
  } else if (url.includes("/blog/")) {
    summary = `I just read this guide on PDFTools. 25+ free PDF tools + AI Chat with PDF — all in your browser, no uploads:\n\n${featuresBullet}\n\nRead more:`;
  } else {
    summary = `I use PDFTools for all my PDF editing — 25+ tools, AI Chat with PDF, 100% free, no uploads, no signup:\n\n${featuresBullet}\n\nTry it:`;
  }

  return { url, title, desc, image, summary, tool };
}

const platforms = [
  {
    id: "twitter",
    label: "X (Twitter)",
    color: "bg-black hover:bg-gray-800",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#166fe5]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "bg-[#0A66C2] hover:bg-[#095aa8]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20bd5a]",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function ShareModal({ open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useState(() => {
    if (typeof navigator === "undefined") return false;
    return "share" in navigator;
  })[0];

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const { url, summary, image } = getPageMeta();

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "PDFTools - Free Online PDF Tools", text: summary, url });
      } catch {}
    }
    onClose();
  };

  const handleCopy = async () => {
    try {
      const full = `${summary}\n\n${url}`;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareUrl = (platform: string) => {
    const text = encodeURIComponent(`${summary}\n\n${url}`);
    const u = encodeURIComponent(url);
    const t = encodeURIComponent("PDFTools - Free Online PDF Tools");
    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${text}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent(summary)}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${u}&title=${t}&summary=${encodeURIComponent(summary)}`;
      case "whatsapp":
        return `https://wa.me/?text=${text}`;
      default:
        return url;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Share</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--card-border)] text-[var(--muted)] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {image && (
          <div className="px-5 pb-3">
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

        <div className="px-5 pb-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
            {summary}
          </p>
        </div>

        <div className="px-5 pb-5 grid grid-cols-4 gap-3">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={shareUrl(p.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${p.color} text-white rounded-xl p-3 flex items-center justify-center transition`}
            >
              {p.icon}
            </a>
          ))}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Share via...
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl border border-[var(--card-border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--card-border)] transition"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
