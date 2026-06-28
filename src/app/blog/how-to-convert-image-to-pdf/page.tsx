"use client";
import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export default function HowToConvertImageToPDF() {
  return (
    <>
      <ArticleJsonLd title="How to Convert Images to PDF — JPG, PNG to PDF Online Free" description="Learn how to convert images to PDF online free. Convert JPG, PNG, WebP images to PDF documents. No signup, no uploads." url="https://allaboutpdfediting.xyz/blog/how-to-convert-image-to-pdf" datePublished="2026-06-27" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Convert Images to PDF", item: "https://allaboutpdfediting.xyz/blog/how-to-convert-image-to-pdf" }]} />
      <HowToJsonLd name="How to Convert Images to PDF" description="Learn how to convert images to PDF online free. Convert JPG, PNG, WebP images to PDF documents. No signup, no uploads." steps={[{name:"Go to PDFTools Image to PDF",text:"Go to PDFTools Image to PDF"},{name:"Upload one or more images (JPG, PNG, WebP)",text:"Upload one or more images (JPG, PNG, WebP)"},{name:"Drag to reorder images if uploading multiple",text:"Drag to reorder images if uploading multiple"},{name:"Choose page size and orientation (optional)",text:"Choose page size and orientation (optional)"},{name:"Click Convert and download your PDF",text:"Click Convert and download your PDF"}]} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</Link>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">How to Convert Images to PDF</h1>
        <p className="text-xs text-[var(--muted)] mb-6">June 27, 2026 · 3 min read</p>
        <p className="text-sm text-[var(--muted)] mb-4">Converting images to PDF is essential for creating documents from photos, scans, and screenshots. <Link href="/image-to-pdf" className="text-indigo-500 underline">PDFTools Image to PDF</Link> lets you convert JPG, PNG, and WebP images into a professional PDF document in seconds.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 mt-8">Step-by-Step: Image to PDF</h2>
        <ol className="list-decimal pl-5 text-sm text-[var(--muted)] space-y-2 mb-6">
          <li>Go to <Link href="/image-to-pdf" className="text-indigo-500 underline">PDFTools Image to PDF</Link></li>
          <li>Upload one or more images (JPG, PNG, WebP)</li>
          <li>Drag to reorder images if uploading multiple</li>
          <li>Choose page size and orientation (optional)</li>
          <li>Click Convert and download your PDF</li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 mt-8">Supported Image Formats</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-[var(--card-border)] rounded-xl p-4 text-center">
            <p className="font-semibold text-[var(--foreground)]">JPG</p>
            <p className="text-xs text-[var(--muted)]">Photos & camera images</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4 text-center">
            <p className="font-semibold text-[var(--foreground)]">PNG</p>
            <p className="text-xs text-[var(--muted)]">Screenshots & graphics</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4 text-center">
            <p className="font-semibold text-[var(--foreground)]">WebP</p>
            <p className="text-xs text-[var(--muted)]">Modern web images</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 mt-8">Use Cases</h2>
        <ul className="list-disc pl-5 text-sm text-[var(--muted)] space-y-1 mb-6">
          <li><strong>Scan documents:</strong> Take photos of documents with your phone and convert to PDF</li>
          <li><strong>Create portfolios:</strong> Combine multiple design mockups into one portfolio PDF</li>
          <li><strong>Share receipts:</strong> Convert expense receipt photos into a single PDF for accounting</li>
          <li><strong>Send presentations:</strong> Convert slides screenshotted as images into a PDF deck</li>
        </ul>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Convert Images to PDF Free</h2>
          <p className="text-sm text-white/80 mb-4">No uploads, no signup, 100% private.</p>
          <Link href="/image-to-pdf" className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl hover:bg-white/90 transition">Convert Now →</Link>
        </div>
      </div>
    </>
  );
}
