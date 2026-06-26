import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Questions Answered — Free PDF Tools & Guides | PDFTools",
  description:
    "Get answers to common PDF questions. How to compress, merge, split, edit, sign, protect, and convert PDFs. Free online PDF tools — no uploads, 100% private.",
  alternates: { canonical: "https://allaboutpdfediting.xyz/qa" },
};

const qas = [
  {
    q: "How do I compress a PDF without losing quality?",
    a: "Use our free online PDF compressor. Upload your file, select compression level, and download the smaller PDF. All processing happens in your browser — your file never leaves your device. The compressor uses advanced algorithms to reduce file size while preserving text clarity and image quality.",
  },
  {
    q: "How do I merge multiple PDFs into one document?",
    a: "Our free PDF merger lets you combine multiple PDF files into a single document. Drag and drop files in any order, rearrange pages, and download the merged result instantly. Everything runs client-side with no uploads to any server.",
  },
  {
    q: "How do I split a PDF into separate files?",
    a: "Use our PDF splitter to extract specific pages or divide a PDF into multiple documents. Choose page ranges or split every page individually. The tool works entirely in your browser using WebAssembly for fast processing.",
  },
  {
    q: "How do I add page numbers to a PDF?",
    a: "Our free tool lets you insert page numbers at any position (top, bottom, left, center, right). Customize starting number, font size, and format. No installation required — works in Chrome, Firefox, Safari, and Edge.",
  },
  {
    q: "How do I protect a PDF with a password?",
    a: "Upload your PDF to our password protection tool, set a strong password, and download your encrypted file. The encryption happens locally in your browser. Choose between view-only or full-restriction passwords.",
  },
  {
    q: "How do I remove a password from a PDF?",
    a: "Use our PDF unlocker to remove password protection from your own PDFs. Enter the existing password, and the tool decrypts the file instantly. All processing is client-side for complete privacy.",
  },
  {
    q: "How do I sign a PDF without printing?",
    a: "Our free e-sign tool lets you draw, type, or upload a signature and place it anywhere on your PDF. No account needed, no document uploads. Download the signed PDF immediately.",
  },
  {
    q: "How do I convert an image to PDF?",
    a: "Convert JPG, PNG, WebP, and other image formats to PDF with our free converter. Upload multiple images to create a single multi-page PDF or individual PDFs. All processing happens locally.",
  },
  {
    q: "How do I extract text from a PDF?",
    a: "Use our PDF text extractor to pull all text content from any PDF. The tool preserves layout and extracts text from scanned documents using built-in OCR capabilities. Works entirely in your browser.",
  },
  {
    q: "How do I rotate pages in a PDF?",
    a: "Our free PDF rotator lets you rotate individual pages or entire documents by 90, 180, or 270 degrees. Select specific pages to rotate or apply to all pages at once. Instant processing with no uploads.",
  },
  {
    q: "How do I compare two PDFs for differences?",
    a: "Premium PDF Diff tool compares two PDF documents side by side. Upload both files, and the tool highlights every difference — added, removed, or modified text and images. Perfect for document revision tracking.",
  },
  {
    q: "How do I convert a PDF to audio?",
    a: "Premium PDF to Audio tool converts any PDF to spoken audio using text-to-speech. Choose from multiple voices, adjust playback speed, and listen to documents hands-free. Supports pause, resume, and section skipping.",
  },
  {
    q: "How do I remove metadata from a PDF?",
    a: "Premium Metadata Sanitizer strips all hidden metadata from PDFs including author name, creation date, software info, annotations, and embedded files. Ensures complete privacy when sharing documents.",
  },
  {
    q: "How do I create a booklet from a PDF?",
    a: "Premium Booklet Creator converts PDFs into printable booklet layouts. Choose from side-by-side, 2x2 grid, or 4x4 grid formats. Perfect for saddle-stitch binding, brochures, and zines.",
  },
  {
    q: "How do I add sequential page numbers (Bates numbering)?",
    a: "Premium Bates Numbering tool adds sequential page numbers and custom labels to every page. Configure prefix, suffix, number of digits, font, and position. Essential for legal, medical, and business document management.",
  },
];

export default function QaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            mainEntity: qas.map((qa) => ({
              "@type": "Question",
              name: qa.q,
              acceptedAnswer: { "@type": "Answer", text: qa.a },
            })),
          }),
        }}
      />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          PDF Questions Answered
        </h1>
        <p className="text-[var(--muted)] mb-10 text-lg">
          Quick answers to the most common PDF questions. All our tools are free,
          private, and work entirely in your browser.
        </p>
        <div className="space-y-6">
          {qas.map((qa, i) => (
            <div
              key={i}
              className="border border-[var(--card-border)] rounded-xl p-6 bg-[var(--card)]"
            >
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {qa.q}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {qa.a}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
