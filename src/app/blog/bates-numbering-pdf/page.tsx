"use client";
import ArticleJsonLd from "@/components/ArticleJsonLd";

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <ArticleJsonLd
        title="How to Add Bates Numbering to PDF Documents — Sequential Page Labels"
        description="Learn how to add Bates numbering, sequential page numbers, and custom labels to every page of a PDF. Perfect for legal documents and discovery."
        url="https://allaboutpdfediting.xyz/blog/bates-numbering-pdf"
        datePublished="2026-06-26"
      />
      <a href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">How to Add Bates Numbering to PDF Documents</h1>
      <p className="text-sm text-[var(--muted)] mb-8">5 min read · Updated June 2026</p>

      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">
        <p>Bates numbering (also called Bates stamping) is the practice of assigning sequential numbers, letters, or date labels to each page of a document set. It is widely used in legal discovery, medical records management, contract administration, and any industry that needs to index large volumes of pages. Adding Bates numbers manually is tedious — a dedicated tool automates the process in seconds.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Why Use Bates Numbering?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Legal discovery</strong> — Numbered pages make it easy to reference exhibits and depositions</li>
          <li><strong>Document indexing</strong> — Every page gets a unique identifier for filing and retrieval</li>
          <li><strong>Contract management</strong> — Track versions and amendments by sequential page labels</li>
          <li><strong>Medical records</strong> — Maintain page order and audit trails in patient files</li>
          <li><strong>Compliance</strong> — Meet regulatory requirements for tamper-evident page numbering</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Bates Numbering Options</h2>
        <p>A good Bates numbering tool lets you control every aspect of the label:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Prefix</strong> — Add a text prefix like <code className="bg-[var(--card)] px-1 rounded">DEF-</code> or <code className="bg-[var(--card)] px-1 rounded">EXH-A-</code></li>
          <li><strong>Suffix</strong> — Append text after the number, e.g. <code className="bg-[var(--card)] px-1 rounded">-v1</code></li>
          <li><strong>Start number</strong> — Begin from any number, not just 1</li>
          <li><strong>Digit padding</strong> — Zero-pad to 3, 4, 5, or 6 digits for consistent alignment</li>
          <li><strong>Position</strong> — Place the label at any corner or centered at the bottom</li>
        </ul>
        <p>Example output: <code className="bg-[var(--card)] px-1 rounded">DEF-00001-v1</code>, <code className="bg-[var(--card)] px-1 rounded">DEF-00002-v1</code>, <code className="bg-[var(--card)] px-1 rounded">DEF-00003-v1</code> across all pages.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">How to Add Bates Numbering in 3 Steps</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li><strong>Upload your PDF</strong> — Drag and drop any PDF file.</li>
          <li><strong>Configure your labels</strong> — Set prefix, suffix, start number, digit padding, and position.</li>
          <li><strong>Apply and download</strong> — The tool stamps every page and gives you a numbered PDF to save.</li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Use Cases</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Law firms</strong> — Number exhibit binders and deposition transcripts</li>
          <li><strong>Corporate legal departments</strong> — Index contract repositories and NDAs</li>
          <li><strong>Government agencies</strong> — Label public records and FOIA responses</li>
          <li><strong>Healthcare</strong> — Organize medical record requests and patient files</li>
          <li><strong>Real estate</strong> — Number property disclosure packages and closing documents</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Premium Feature</h2>
        <p>Bates numbering is a <strong>premium feature</strong> available to PDFTools Premium subscribers. Premium also unlocks document comparison, bulk certificate generation, PDF-to-audio conversion, and more. <a href="/premium" className="text-indigo-500 hover:underline font-medium">Learn more about Premium →</a></p>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6 mt-6">
          <p className="font-bold text-[var(--foreground)] mb-1">Need Bates numbering?</p>
          <p className="text-xs mb-3">Add sequential page numbers to every page of your PDF in seconds.</p>
          <a href="/bates-numbering" className="inline-block px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition">Bates Numbering →</a>
        </div>
      </div>
    </article>
  );
}
