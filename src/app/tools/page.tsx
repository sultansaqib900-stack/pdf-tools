import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All PDF Tools - 40+ Free & Premium PDF Tools | PDFTools",
  description: "Browse 40+ free PDF tools: compress, merge, split, convert, edit, sign and protect. Everything runs in your browser with no uploads.",
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
      { name: "PDF to Word", href: "/pdf-to-word", desc: "Convert PDF to editable Word documents" },
      { name: "Word to PDF", href: "/word-to-pdf", desc: "Convert DOCX files to PDF" },
      { name: "PDF to PDF/A", href: "/pdf-to-pdfa", desc: "Convert to PDF/A for long-term archiving" },
      { name: "OCR PDF", href: "/ocr-pdf", desc: "Make scanned PDFs searchable and selectable" },
      { name: "Scan to PDF", href: "/scan-to-pdf", desc: "Turn phone photos into clean PDF scans" },
      { name: "Repair PDF", href: "/repair-pdf", desc: "Fix corrupted or damaged PDF files" },
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
    name: "Premium Features",
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

const guides = [
  { name: "Ultimate guide to PDF editing", href: "/ultimate-guide-to-pdf-editing", desc: "Everything you need to know about editing PDFs" },
  { name: "Best free PDF editors in 2026", href: "/best-free-pdf-editor", desc: "Ten free PDF editors compared side by side" },
  { name: "Edit PDF online", href: "/edit-pdf", desc: "Add text, images and annotations to any PDF" },
  { name: "Adobe Acrobat alternative", href: "/adobe-acrobat-alternative", desc: "Free, no-subscription alternative to Acrobat" },
  { name: "iLovePDF alternative", href: "/ilovepdf-alternative", desc: "The same tools, without the uploads" },
  { name: "SmallPDF alternative", href: "/smallpdf-alternative", desc: "No daily task limits and no signup" },
];

const audiences = [
  { name: "PDF tools for students", href: "/pdf-tools-for-students", desc: "Lecture slides, research papers and assignments" },
  { name: "PDF tools for teachers", href: "/pdf-tools-for-teachers", desc: "Worksheets, submissions and certificates" },
  { name: "PDF tools for lawyers", href: "/pdf-tools-for-lawyers", desc: "Redaction, discovery and Bates numbering" },
  { name: "PDF tools for small business", href: "/pdf-tools-for-small-business", desc: "Invoices, contracts and signed agreements" },
  { name: "PDF tools for business", href: "/pdf-tools-for-business", desc: "Secure document workflows at scale" },
  { name: "Embed PDF tools on your site", href: "/embed", desc: "Free widgets you can drop into any page" },
];

export default function ToolsPage() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="max-w-2xl mb-10">
        <h1 className="text-[2rem] font-semibold text-[var(--foreground)]">All PDF tools</h1>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
          {total} free and premium tools. Everything runs in your browser — no uploads,
          no signup, nothing stored.
        </p>
      </header>

      {categories.map((cat) => {
        const isPremium = "premium" in cat && Boolean((cat as { premium?: boolean }).premium);
        return (
          <section key={cat.name} className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{cat.name}</h2>
              {isPremium && <span className="badge badge-premium">Premium</span>}
              <span className="text-[0.75rem] text-[var(--muted)]">{cat.tools.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {cat.tools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="card-interactive group p-4">
                  <h3 className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Guides &amp; comparisons</h2>
        <p className="text-[0.8125rem] text-[var(--muted)] mb-4">
          Picking a tool, or moving from another PDF service? Start here.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {guides.map((g) => (
            <Link key={g.href} href={g.href} className="card-interactive group p-4">
              <h3 className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                {g.name}
              </h3>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">{g.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">PDF tools by profession</h2>
        <p className="text-[0.8125rem] text-[var(--muted)] mb-4">
          Curated workflows for the documents you actually work with.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {audiences.map((g) => (
            <Link key={g.href} href={g.href} className="card-interactive group p-4">
              <h3 className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                {g.name}
              </h3>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">{g.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
        <p className="text-[0.875rem] text-[var(--muted)]">Can&apos;t find what you need?</p>
        <Link href="/blog" className="mt-1.5 inline-block text-[0.875rem] font-medium text-[var(--accent)] hover:underline">
          Browse our guides
        </Link>
      </div>
    </div>
  );
}
