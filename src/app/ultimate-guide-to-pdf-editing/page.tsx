import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Ultimate Guide to PDF Editing — Free Online PDF Tools | PDFTools",
  description: "The complete guide to editing PDFs online free. Learn how to compress, merge, split, convert, sign, and edit PDFs — all in your browser with no uploads.",
};

export default function UltimateGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Ultimate Guide to PDF Editing", item: "https://allaboutpdfediting.xyz/ultimate-guide-to-pdf-editing" }]} />
      <ArticleJsonLd title="Ultimate Guide to PDF Editing — Free Online PDF Tools" description="The complete guide to editing PDFs online free. Learn how to compress, merge, split, convert, sign, and edit PDFs — all in your browser with no uploads." url="https://allaboutpdfediting.xyz/ultimate-guide-to-pdf-editing" datePublished="2026-06-27" dateModified="2026-06-27" />
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">The Ultimate Guide to PDF Editing</h1>
      <p className="text-[var(--muted)] mb-2">A complete resource for working with PDFs online — from basic edits to advanced features. All tools run in your browser with zero server uploads.</p>
      <p className="text-xs text-[var(--muted)] mb-8">Updated June 27, 2026</p>

      <nav className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-10">
        <h2 className="font-semibold text-[var(--foreground)] mb-3">Table of Contents</h2>
        <ul className="space-y-1.5 text-sm">
          <li><a href="#what-is-pdf" className="text-indigo-500 hover:underline">1. What is a PDF?</a></li>
          <li><a href="#basic-editing" className="text-indigo-500 hover:underline">2. Basic PDF Editing</a></li>
          <li><a href="#compress" className="text-indigo-500 hover:underline">3. Compressing PDFs</a></li>
          <li><a href="#merge-split" className="text-indigo-500 hover:underline">4. Merging &amp; Splitting PDFs</a></li>
          <li><a href="#convert" className="text-indigo-500 hover:underline">5. Converting PDFs</a></li>
          <li><a href="#security" className="text-indigo-500 hover:underline">6. PDF Security</a></li>
          <li><a href="#annotate" className="text-indigo-500 hover:underline">7. Annotating &amp; Signing</a></li>
          <li><a href="#advanced" className="text-indigo-500 hover:underline">8. Advanced Features</a></li>
          <li><a href="#ai" className="text-indigo-500 hover:underline">9. AI-Powered PDF Tools</a></li>
          <li><a href="#tips" className="text-indigo-500 hover:underline">10. Tips &amp; Best Practices</a></li>
        </ul>
      </nav>

      <section id="what-is-pdf" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">1. What is a PDF?</h2>
        <p className="text-sm text-[var(--muted)] mb-3">PDF (Portable Document Format) was created by Adobe in 1993 to present documents consistently across any device or platform. Unlike Word documents or web pages, a PDF preserves fonts, images, layouts, and formatting exactly as intended.</p>
        <p className="text-sm text-[var(--muted)] mb-3">Today, PDF is the universal format for sharing documents professionally — used for contracts, invoices, eBooks, forms, reports, and archival records. Billions of PDFs are created, edited, and shared every day.</p>
        <p className="text-sm text-[var(--muted)]">The challenge? Most PDF editors are expensive (Adobe Acrobat), require server uploads (SmallPDF, iLovePDF), or limit free usage. PDFTools solves this by offering free, private PDF editing entirely in your browser.</p>
      </section>

      <section id="basic-editing" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">2. Basic PDF Editing</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Basic PDF editing includes tasks like rotating pages, deleting pages, rearranging pages, and adding text. Here are the tools you need:</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/rotate" className="text-indigo-500 hover:underline">Rotate PDF Pages</Link></h3>
            <p className="text-xs text-[var(--muted)]">Fix pages that were scanned upside-down or rotated. Rotate individual pages or entire documents.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/organize" className="text-indigo-500 hover:underline">Organize PDF Pages</Link></h3>
            <p className="text-xs text-[var(--muted)]">Drag and drop to reorder pages, delete unwanted pages, and arrange your document structure.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/delete-pages" className="text-indigo-500 hover:underline">Delete PDF Pages</Link></h3>
            <p className="text-xs text-[var(--muted)]">Remove specific pages from your PDF. Useful for stripping cover pages, blank pages, or appendices.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/edit-pdf" className="text-indigo-500 hover:underline">Edit PDF Content</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add text boxes, rectangles, circles, and lines to your PDF pages. Perfect for filling forms or highlighting sections.</p>
          </div>
        </div>
      </section>

      <section id="compress" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">3. Compressing PDFs</h2>
        <p className="text-sm text-[var(--muted)] mb-3">Large PDFs are slow to email, upload, and download. Compression reduces file size by optimizing images, removing redundant data, and streamlining the PDF structure.</p>
        <p className="text-sm text-[var(--muted)] mb-3">Our <Link href="/compress" className="text-indigo-500 underline">PDF Compressor</Link> uses pdf-lib to compress PDFs client-side. You can choose from multiple compression levels:</p>
        <ul className="list-disc pl-5 text-sm text-[var(--muted)] space-y-1 mb-4">
          <li><strong>Maximum compression</strong> — Smallest file size, lower image quality (good for email)</li>
          <li><strong>Balanced compression</strong> — Good size reduction with acceptable quality (recommended)</li>
          <li><strong>Minimum compression</strong> — Slight size reduction, near-original quality (best for printing)</li>
        </ul>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)]"><strong>Pro tip:</strong> Compress PDFs before uploading to cloud storage or sending via email — a 20MB PDF can often be reduced to 3-5MB without noticeable quality loss.</p>
        </div>
      </section>

      <section id="merge-split" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">4. Merging &amp; Splitting PDFs</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Combining multiple PDFs into one document or extracting pages from a large PDF are two of the most common PDF tasks.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/merge" className="text-indigo-500 hover:underline">Merge PDFs</Link></h3>
            <p className="text-xs text-[var(--muted)]">Combine multiple PDF files into a single document. Drag and drop to reorder files before merging. Useful for consolidating reports, contracts, or scanned documents.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/split" className="text-indigo-500 hover:underline">Split PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Extract specific pages or divide a large PDF into smaller files. Split by page range, extract every N pages, or separate single pages.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/split-by-bookmarks" className="text-indigo-500 hover:underline">Split by Bookmarks</Link></h3>
            <p className="text-xs text-[var(--muted)]">Advanced splitting: extract chapters and sections from a PDF using its bookmark/outline structure. Perfect for eBooks and manuals.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/insert-blank" className="text-indigo-500 hover:underline">Insert Blank Pages</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add blank pages between existing pages — useful for creating separators, interleaving, or formatting booklets.</p>
          </div>
        </div>
      </section>

      <section id="convert" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">5. Converting PDFs</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Converting between PDF and other formats is essential for document workflows. PDFTools offers multiple conversion options:</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/image-to-pdf" className="text-indigo-500 hover:underline">Image to PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert JPG, PNG, WebP images to PDF. Combines multiple images into one PDF document.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-to-images" className="text-indigo-500 hover:underline">PDF to Images</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert each PDF page to a JPG or PNG image. Useful for sharing individual pages or inserting into presentations.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/html-to-pdf" className="text-indigo-500 hover:underline">HTML to PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert HTML content or web pages to PDF. Enter HTML code and download a formatted PDF.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/text-to-pdf" className="text-indigo-500 hover:underline">Text to PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert plain text to a formatted PDF document. Fast way to create PDFs from notes or code.</p>
          </div>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] mb-2 mt-6">Office Document Conversion</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-to-word" className="text-indigo-500 hover:underline">PDF to Word</Link></h3>
            <p className="text-xs text-[var(--muted)]">Extract text from PDFs and convert to editable DOCX format for Microsoft Word.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/word-to-pdf" className="text-indigo-500 hover:underline">Word to PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert Word documents to PDF while preserving formatting and layout.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-to-excel" className="text-indigo-500 hover:underline">PDF to Excel</Link></h3>
            <p className="text-xs text-[var(--muted)]">Extract tables and data from PDFs to CSV/Excel format. Premium tool with advanced table detection.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-to-pdfa" className="text-indigo-500 hover:underline">PDF to PDF/A</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert PDFs to PDF/A archive format for long-term preservation and compliance.</p>
          </div>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] mb-2 mt-6">Specialized Conversions</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-to-audio" className="text-indigo-500 hover:underline">PDF to Audio</Link></h3>
            <p className="text-xs text-[var(--muted)]">Listen to your PDFs. Converts text to speech with voice selection and speed control.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/scan-to-pdf" className="text-indigo-500 hover:underline">Scan to PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Use your device camera to capture documents and convert them instantly to PDF.</p>
          </div>
        </div>
      </section>

      <section id="security" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">6. PDF Security</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Protecting sensitive information in PDFs is critical for business and personal documents.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/protect" className="text-indigo-500 hover:underline">Protect PDF with Password</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add password protection to your PDF. Prevent unauthorized opening, printing, or editing of sensitive documents.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/unlock" className="text-indigo-500 hover:underline">Unlock PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Remove password protection from PDFs you own. Extract content from protected documents you have permission to edit.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/redact" className="text-indigo-500 hover:underline">Redact PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Permanently remove sensitive information from PDFs. Black out text, images, or sections before sharing.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/search-redact" className="text-indigo-500 hover:underline">Search &amp; Redact</Link></h3>
            <p className="text-xs text-[var(--muted)]">Automatically find and redact specific words or phrases across your entire document. Ideal for GDPR compliance.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/metadata-sanitizer" className="text-indigo-500 hover:underline">Clean PDF Metadata</Link></h3>
            <p className="text-xs text-[var(--muted)]">Strip hidden metadata from PDFs — author names, creation dates, software used, and embedded files.</p>
          </div>
        </div>
      </section>

      <section id="annotate" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">7. Annotating &amp; Signing PDFs</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Mark up documents, add comments, and sign PDFs electronically without printing.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/annotate" className="text-indigo-500 hover:underline">Annotate PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add highlights, underlines, strikethroughs, and comments to PDFs. Perfect for reviewing documents.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/sign" className="text-indigo-500 hover:underline">Sign PDF</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add your signature and initials to PDF documents. Draw, type, or upload an image of your signature.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/fill-form" className="text-indigo-500 hover:underline">Fill PDF Forms</Link></h3>
            <p className="text-xs text-[var(--muted)]">Complete fillable PDF forms online. Type into form fields, check boxes, and submit digitally.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/watermark" className="text-indigo-500 hover:underline">Add Watermark</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add text or image watermarks to your PDF. Mark documents as Draft, Confidential, or with your brand logo.</p>
          </div>
        </div>
      </section>

      <section id="advanced" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">8. Advanced PDF Features</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Premium tools for power users who need more from their PDF editor:</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/batch" className="text-indigo-500 hover:underline">Batch Process PDFs</Link></h3>
            <p className="text-xs text-[var(--muted)]">Apply operations (compress, watermark, rotate) to multiple PDFs at once. Save hours of repetitive work.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-diff" className="text-indigo-500 hover:underline">Compare PDFs</Link></h3>
            <p className="text-xs text-[var(--muted)]">Side-by-side PDF comparison with highlighted differences. Essential for contract reviews and version tracking.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/certificate-generator" className="text-indigo-500 hover:underline">Certificate Generator</Link></h3>
            <p className="text-xs text-[var(--muted)]">Bulk generate personalized PDF certificates from a template and CSV data. Perfect for course completions.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/bates-numbering" className="text-indigo-500 hover:underline">Bates Numbering</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add sequential page numbers to every page. Essential for legal documents, discovery, and indexing.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/booklet" className="text-indigo-500 hover:underline">PDF Booklet</Link></h3>
            <p className="text-xs text-[var(--muted)]">Convert PDFs to booklet format (side-by-side, 2x2 grid, 4x4 grid) for printing and binding.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/bulk-rename" className="text-indigo-500 hover:underline">Bulk Rename PDFs</Link></h3>
            <p className="text-xs text-[var(--muted)]">Rename PDF files by metadata (title, author, page count) with customizable naming patterns.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/pdf-inverter" className="text-indigo-500 hover:underline">PDF Dark Mode</Link></h3>
            <p className="text-xs text-[var(--muted)]">Transform PDF colors — dark mode, grayscale, or high contrast. Reduce eye strain when reading PDFs at night.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-1"><Link href="/qr-stamp" className="text-indigo-500 hover:underline">QR Code Stamping</Link></h3>
            <p className="text-xs text-[var(--muted)]">Add QR codes to every PDF page. Perfect for document tracking, linking to digital resources, or branding.</p>
          </div>
        </div>
      </section>

      <section id="ai" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">9. AI-Powered PDF Tools</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Modern PDF editing goes beyond simple file operations. PDFTools offers AI features that transform how you work with documents:</p>
        <div className="space-y-4 mb-4">
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]"><Link href="/chat-pdf" className="text-indigo-500 hover:underline">Chat with PDF (AI)</Link></h3>
            <p className="text-sm text-[var(--muted)]">Upload any PDF and ask questions about its content using AI. Get summaries, extract key data, find specific information, and generate insights from your documents — without reading them entirely. Supports long documents with intelligent context management.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]"><Link href="/ocr-pdf" className="text-indigo-500 hover:underline">OCR PDF (Text Recognition)</Link></h3>
            <p className="text-sm text-[var(--muted)]">Extract text from scanned PDFs and images using Tesseract.js OCR. Make scanned documents searchable, selectable, and editable. Supports multiple languages.</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]"><strong>Coming soon:</strong> AI document summarization, AI form auto-fill, and intelligent data extraction will make PDFTools even more powerful.</p>
        </div>
      </section>

      <section id="tips" className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">10. Tips &amp; Best Practices</h2>
        <div className="space-y-4">
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Always Compress Before Sharing</h3>
            <p className="text-sm text-[var(--muted)]">A compressed PDF uploads faster, emails quicker, and uses less storage. Run compress as the last step before sharing any PDF.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Strip Metadata for Confidential Documents</h3>
            <p className="text-sm text-[var(--muted)]">Before sharing PDFs externally, use the metadata sanitizer to remove author names, creation dates, software info, and hidden content.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Use PDF/A for Archiving</h3>
            <p className="text-sm text-[var(--muted)]">For documents that need to be preserved long-term (legal records, historical archives), convert to PDF/A format which ensures future readability.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Process PDFs Offline</h3>
            <p className="text-sm text-[var(--muted)]">PDFTools runs entirely in your browser. Once loaded, you can disconnect from the internet and still process PDFs. Your files never leave your device.</p>
          </div>
        </div>
      </section>

      <AdBanner className="mb-8" />

      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Start Editing PDFs Free</h2>
        <p className="text-sm text-[var(--muted)] mb-4">No uploads, no signup, no limits. 100% free PDF editing in your browser.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/compress" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition">Compress PDF</Link>
          <Link href="/merge" className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-sm hover:bg-emerald-700 transition">Merge PDF</Link>
          <Link href="/split" className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl text-sm hover:bg-purple-700 transition">Split PDF</Link>
          <Link href="/image-to-pdf" className="px-5 py-2.5 bg-amber-600 text-white font-medium rounded-xl text-sm hover:bg-amber-700 transition">Image to PDF</Link>
        </div>
      </div>
    </div>
  );
}
