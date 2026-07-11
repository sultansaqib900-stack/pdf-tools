"use client";

import { useState } from "react";

const TOOLS = [
  { id: "compress", label: "Compress PDF" },
  { id: "merge", label: "Merge PDF" },
  { id: "split", label: "Split PDF" },
  { id: "image-to-pdf", label: "Image to PDF" },
  { id: "edit-pdf", label: "Edit PDF" },
  { id: "unlock", label: "Unlock PDF" },
  { id: "protect", label: "Protect PDF" },
  { id: "rotate", label: "Rotate PDF" },
  { id: "delete-pages", label: "Delete Pages" },
  { id: "organize", label: "Organize Pages" },
  { id: "sign", label: "Sign PDF" },
  { id: "fill-form", label: "Fill Form" },
  { id: "ocr-pdf", label: "OCR PDF" },
  { id: "extract-text", label: "Extract Text" },
  { id: "pdf-to-word", label: "PDF to Word" },
  { id: "word-to-pdf", label: "Word to PDF" },
  { id: "repair-pdf", label: "Repair PDF" },
  { id: "watermark", label: "Add Watermark" },
  { id: "add-page-numbers", label: "Add Page Numbers" },
  { id: "annotate", label: "Annotate PDF" },
  { id: "flatten-pdf", label: "Flatten PDF" },
  { id: "reverse-pdf", label: "Reverse Pages" },
  { id: "resize", label: "Resize PDF" },
  { id: "crop", label: "Crop PDF" },
  { id: "html-to-pdf", label: "HTML to PDF" },
  { id: "text-to-pdf", label: "Text to PDF" },
  { id: "scan-to-pdf", label: "Scan to PDF" },
  { id: "batch", label: "Batch Process" },
  { id: "chat-pdf", label: "Chat with PDF" },
  { id: "metadata", label: "Edit Metadata" },
];

export default function EmbedPage() {
  const [tool, setTool] = useState("compress");
  const [copied, setCopied] = useState(false);

  const snippet = `<pdf-tool tool="${tool}"></pdf-tool>\n<script src="https://allaboutpdfediting.xyz/embed.js"></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Embed Free PDF Tools on Your Site</h1>
        <p className="text-[var(--muted)]">
          Add a fully functional PDF tool to any webpage with 3 lines of HTML. Zero API keys, zero backend, zero cost.
          All processing happens in the user&apos;s browser — no files uploaded to any server.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">1. Choose a tool</h2>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="w-full p-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
          >
            {TOOLS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <h2 className="text-lg font-semibold mt-6 mb-2">2. Copy the code</h2>
          <div className="relative">
            <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 text-xs leading-relaxed overflow-x-auto border border-gray-700">
              <code>{snippet}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">3. Paste into your site</h2>
          <p className="text-sm text-[var(--muted)]">
            Paste the code anywhere in your HTML where you want the tool to appear.
            Works on WordPress, Webflow, Shopify, Carrd, Ghost, and any other platform that supports custom HTML.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Optional attributes</h2>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <div className="flex gap-2">
              <code className="text-indigo-500 font-mono text-xs whitespace-nowrap">theme=&quot;dark&quot;</code>
              <span>Use dark theme</span>
            </div>
            <div className="flex gap-2">
              <code className="text-indigo-500 font-mono text-xs whitespace-nowrap">height=&quot;600px&quot;</code>
              <span>Custom height (default varies by tool)</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 400 }}>
            <iframe
              src={`https://allaboutpdfediting.xyz/${tool}?embed=1`}
              className="w-full h-full"
              title="Tool preview"
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-2 text-center">
            This is how the tool will appear on your site.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold mb-4">Why embed PDF tools?</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-[var(--muted)]">
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--foreground)]">Keep visitors on your site</h3>
            <p>Instead of sending users to another PDF tool site, they process PDFs right on your page. Higher engagement, lower bounce rate.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--foreground)]">Zero maintenance</h3>
            <p>No servers, no API keys, no rate limits. All processing happens in the browser using WebAssembly. We update the tools, your embed stays current.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[var(--foreground)]">100% private</h3>
            <p>Files never leave the browser. No uploads to any server. Your users&apos; data stays on their device, end to end.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold mb-4">WordPress Plugin</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Using WordPress? Install our free plugin to add PDF tools via shortcode or Gutenberg block,
          no manual code needed.
        </p>
        <a
          href="https://github.com/sultansaqib900-stack/free-pdf-toolkit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          View on GitHub
        </a>
      </div>
    </div>
  );
}
