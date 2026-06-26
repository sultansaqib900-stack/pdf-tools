import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All PDF Tools - 40+ Free & Premium PDF Tools | PDFTools",
  description: "Browse 40+ PDF tools. Compress, merge, split, convert, edit, sign, protect PDFs plus premium tools: PDF diff, certificates, audio, booklet creation, QR codes, and more. 100% free, no uploads.",
  openGraph: {
    title: "All PDF Tools - 40+ Free & Premium PDF Tools",
    description: "Browse 40+ PDF tools including premium features like document comparison, certificate generation, PDF-to-audio, and more.",
  },
};

const categories = [
  {
    name: "Compress & Convert",
    tools: [
      { name: "Compress PDF", href: "/compress", desc: "Reduce PDF file size without losing quality" },
      { name: "PDF to Excel", href: "/pdf-to-excel", desc: "Extract tables from PDF to Excel spreadsheets" },
      { name: "PDF to Images", href: "/pdf-to-images", desc: "Convert PDF pages to JPG and PNG images" },
      { name: "Image to PDF", href: "/image-to-pdf", desc: "Convert JPG, PNG images to PDF documents" },
      { name: "HTML to PDF", href: "/html-to-pdf", desc: "Convert web pages and HTML to PDF" },
      { name: "Text to PDF", href: "/text-to-pdf", desc: "Convert plain text to PDF documents" },
    ],
  },
  {
    name: "Organize & Edit",
    tools: [
      { name: "Merge PDF", href: "/merge", desc: "Combine multiple PDFs into one document" },
      { name: "Split PDF", href: "/split", desc: "Separate PDF pages into multiple files" },
      { name: "Organize Pages", href: "/organize", desc: "Reorder, rotate, and arrange PDF pages" },
      { name: "Delete Pages", href: "/delete-pages", desc: "Remove unwanted pages from PDF" },
      { name: "Insert Blank Pages", href: "/insert-blank", desc: "Add empty pages to any PDF" },
      { name: "Reverse PDF Order", href: "/reverse-pdf", desc: "Flip the entire page sequence" },
      { name: "Crop PDF", href: "/crop", desc: "Remove margins and trim PDF pages" },
      { name: "Resize PDF", href: "/resize", desc: "Change PDF page size to A4, Letter, custom" },
      { name: "Rotate PDF", href: "/rotate", desc: "Fix upside-down or sideways pages" },
    ],
  },
  {
    name: "Security & Signatures",
    tools: [
      { name: "Protect PDF", href: "/protect", desc: "Add password protection to PDF files" },
      { name: "Unlock PDF", href: "/unlock", desc: "Remove password from protected PDFs" },
      { name: "Sign PDF", href: "/sign", desc: "Add electronic signatures to documents" },
      { name: "Redact PDF", href: "/redact", desc: "Permanently remove sensitive content" },
      { name: "Flatten PDF", href: "/flatten-pdf", desc: "Merge layers and form fields permanently" },
    ],
  },
  {
    name: "Content & Annotations",
    tools: [
      { name: "Extract Text", href: "/extract-text", desc: "Copy text from scanned or digital PDFs" },
      { name: "Word Counter", href: "/word-counter", desc: "Count words, characters and pages" },
      { name: "Add Page Numbers", href: "/add-page-numbers", desc: "Number PDF pages with custom formatting" },
      { name: "Watermark PDF", href: "/watermark", desc: "Add text or image watermarks" },
      { name: "Annotate PDF", href: "/annotate", desc: "Highlight text, add comments, draw shapes" },
      { name: "Fill PDF Form", href: "/fill-form", desc: "Complete interactive PDF forms" },
      { name: "Edit Metadata", href: "/metadata", desc: "Change title, author, subject, keywords" },
    ],
  },
  {
    name: "AI & Advanced",
    tools: [
      { name: "Chat with PDF", href: "/chat-pdf", desc: "Ask AI questions about your PDF content" },
      { name: "Batch Process", href: "/batch", desc: "Process multiple PDFs at once" },
    ],
  },
  {
    name: "Premium Features ⭐",
    premium: true,
    tools: [
      { name: "PDF Diff", href: "/pdf-diff", desc: "Compare two PDFs and see highlighted differences" },
      { name: "Certificate Generator", href: "/certificate-generator", desc: "Bulk-generate personalized PDF certificates" },
      { name: "PDF to Audio", href: "/pdf-to-audio", desc: "Listen to PDFs with natural text-to-speech" },
      { name: "Form Data Extraction", href: "/form-data-extract", desc: "Extract filled form data to CSV" },
      { name: "Bulk Rename", href: "/bulk-rename", desc: "Rename PDFs by metadata automatically" },
      { name: "Booklet Creator", href: "/booklet", desc: "Create N-up booklets for professional printing" },
      { name: "Search & Redact", href: "/search-redact", desc: "Auto-redact specific words across entire PDF" },
      { name: "Color Inverter", href: "/pdf-inverter", desc: "Dark mode, grayscale, or high-contrast conversion" },
      { name: "PDF Vault", href: "/vault", desc: "Encrypted browser-based document storage" },
      { name: "QR Code Stamp", href: "/qr-stamp", desc: "Add QR codes to every PDF page" },
      { name: "Metadata Sanitizer", href: "/metadata-sanitizer", desc: "Strip all hidden metadata from PDFs" },
      { name: "Split by Bookmarks", href: "/split-by-bookmarks", desc: "Extract chapters from PDF outline structure" },
      { name: "Bates Numbering", href: "/bates-numbering", desc: "Add sequential page numbers to every page" },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">All PDF Tools</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          40+ free and premium PDF tools. All processing happens in your browser — no uploads, no signup, 100% private.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat.name} className="mb-12">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[var(--card-border)]">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{cat.name}</h2>
            {(cat as any).premium && (
              <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:shadow-lg transition ${
                  (cat as any).premium ? "hover:border-amber-400/30 hover:shadow-amber-500/5" : "hover:border-indigo-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--foreground)] text-sm">{tool.name}</h3>
                  {(cat as any).premium && <span className="text-[10px] font-bold text-amber-500">⭐</span>}
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-8 pt-8 border-t border-[var(--card-border)]">
        <p className="text-sm text-[var(--muted)] mb-4">Can&apos;t find what you need?</p>
        <a href="/blog" className="text-indigo-500 hover:underline font-medium text-sm">Check our blog for guides &rarr;</a>
      </div>
    </div>
  );
}
