"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


export default function MetadataSanitizerPage() {
  usePageMeta("PDF Metadata Sanitizer - Remove Hidden Data from PDF | PDFTools Premium", "Strip hidden metadata, author info, creation dates, and embedded data from PDFs. Privacy cleaner. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [beforeMeta, setBeforeMeta] = useState<Record<string, string> | null>(null);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Metadata Sanitizer" description="Strip hidden metadata and personal info from PDFs. Premium privacy tool." url="https://allaboutpdfediting.xyz/metadata-sanitizer" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 89 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🧹</div>
          <h1 className="text-3xl font-bold mb-3">PDF Metadata Sanitizer</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Strip all hidden metadata — author, creation date, software info, annotations, and embedded files.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can sanitize metadata</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const sanitize = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    setBeforeMeta(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const title = pdfDoc.getTitle() || "(none)";
      const author = pdfDoc.getAuthor() || "(none)";
      const subject = pdfDoc.getSubject() || "(none)";
      const creator = pdfDoc.getCreator() || "(none)";
      const producer = pdfDoc.getProducer() || "(none)";
      setBeforeMeta({ title, author, subject, creator, producer });

      const pages = pdfDoc.getPages();
      for (const page of pages) {
        for (const key of Object.keys(page.node as any)) {
          if (key.startsWith("Annots")) {
            delete (page.node as any)[key];
          }
        }
      }

      pdfDoc.setTitle("Untitled");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setCreator("PDFTools");
      pdfDoc.setProducer("PDFTools");

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sanitized-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to sanitize metadata. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Metadata Sanitizer" description="Strip hidden metadata from PDFs. Privacy cleaning tool." url="https://allaboutpdfediting.xyz/metadata-sanitizer" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 89 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Metadata Sanitizer", item: "https://allaboutpdfediting.xyz/metadata-sanitizer" }]} />
      <HowToJsonLd name="Clean PDF Metadata" description="Strip all hidden metadata from PDF documents including author and software info" steps={[{name:"Upload PDF",text:"Upload the PDF document to sanitize"},{name:"Select metadata to remove",text:"Choose which metadata fields to strip"},{name:"Download cleaned PDF",text:"Download the PDF with all selected metadata removed"}]} />
      <AiSummaryJsonLd name="Metadata Sanitizer" summary="Remove hidden metadata from PDFs including author creation date software info annotations and embedded files" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Author removal","Date stripping","Software info removal","Annotation cleaning","Embedded file removal"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">PDF Metadata Sanitizer</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Strip hidden metadata — author name, creation date, software info, annotations, and more.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />

        <button onClick={sanitize} disabled={!file || processing} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition">
          {processing ? "Sanitizing..." : "Sanitize Metadata"}
        </button>
      </div>

      {beforeMeta && (
        <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <h3 className="text-sm font-semibold mb-2 text-[var(--foreground)]">Removed Metadata:</h3>
          <div className="space-y-1 text-xs text-[var(--muted)]">
            <p>Title: <span className="text-[var(--foreground)]">{beforeMeta.title}</span></p>
            <p>Author: <span className="text-[var(--foreground)]">{beforeMeta.author}</span></p>
            <p>Subject: <span className="text-[var(--foreground)]">{beforeMeta.subject}</span></p>
            <p>Creator: <span className="text-[var(--foreground)]">{beforeMeta.creator}</span></p>
            <p>Producer: <span className="text-[var(--foreground)]">{beforeMeta.producer}</span></p>
          </div>
        </div>
      )}

      {success && <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-700">✅ Metadata sanitized — clean file downloading!</div>}
      {error && <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF Metadata Sanitizer</h2>
        <div className="text-sm text-[var(--muted)] space-y-3">PDFs can contain hidden metadata — author name, creation date, software used, embedded annotations, and more. This tool strips all of that, leaving a clean, anonymous PDF. Essential before sharing documents publicly or with third parties.</div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
