"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { downloadBytes, isPdfFile } from "@/lib/pdfBytes";
import { sanitizePdf, type PdfMetadataSnapshot } from "@/lib/pdfSanitize";

export default function MetadataSanitizerPage() {
  usePageMeta("PDF Metadata Sanitizer - Remove Hidden Data from PDF | PDFTools Premium", "Strip hidden metadata, author info, creation dates, and embedded data from PDFs. Privacy cleaner. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [beforeMeta, setBeforeMeta] = useState<PdfMetadataSnapshot | null>(null);

  const sanitize = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    setBeforeMeta(null);
    try {
      if (!isPdfFile(file)) throw new Error("Please select a valid PDF file.");
      const sanitized = await sanitizePdf(await file.arrayBuffer());
      setBeforeMeta(sanitized.before);
      downloadBytes(sanitized.bytes, `sanitized-${file.name}`);
      setSuccess(true);
    } catch (sanitizeError) {
      setError(sanitizeError instanceof Error ? sanitizeError.message : "Failed to sanitize metadata. The file may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PremiumGate
      title="PDF Metadata Sanitizer & Privacy Stripper"
      description="Erase author names, creation timestamps, software fingerprints, annotations, and hidden properties from your PDF files."
      icon="🧹"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Metadata Sanitizer" description="Strip hidden metadata from PDFs. Privacy cleaning tool." url="https://allaboutpdfediting.xyz/metadata-sanitizer" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 89 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Metadata Sanitizer", item: "https://allaboutpdfediting.xyz/metadata-sanitizer" }]} />
        <HowToJsonLd name="Clean PDF Metadata" description="Rebuild a PDF without original metadata, attachments, actions, forms, or annotations" steps={[{name:"Upload PDF",text:"Select the PDF document to sanitize"},{name:"Rebuild document",text:"Copy page content into a fresh PDF while excluding document-level metadata and interactive objects"},{name:"Download cleaned PDF",text:"Download the rebuilt sanitized PDF"}]} />
        <AiSummaryJsonLd name="Metadata Sanitizer" summary="Remove hidden metadata from PDFs including author creation date software info annotations and embedded files" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Author removal","Date stripping","Software info removal","Annotation cleaning","Embedded file removal"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF Metadata Sanitizer</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Strip hidden metadata — author name, creation date, software info, annotations, and more.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 font-semibold mt-2">Loaded: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <button
            onClick={sanitize}
            disabled={!file || processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {processing ? "Sanitizing Metadata..." : "⚡ Clean & Download Sanitized PDF"}
          </button>
        </div>

        {beforeMeta && (
          <div className="mt-6 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl animate-scaleIn">
            <h3 className="text-sm font-bold mb-3 text-[var(--foreground)]">Removed Metadata Properties:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <p>Title: <span className="font-semibold text-[var(--foreground)]">{beforeMeta.title}</span></p>
              <p>Author: <span className="font-semibold text-[var(--foreground)]">{beforeMeta.author}</span></p>
              <p>Subject: <span className="font-semibold text-[var(--foreground)]">{beforeMeta.subject}</span></p>
              <p>Creator: <span className="font-semibold text-[var(--foreground)]">{beforeMeta.creator}</span></p>
              <p className="col-span-2">Producer: <span className="font-semibold text-[var(--foreground)]">{beforeMeta.producer}</span></p>
            </div>
          </div>
        )}

        {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 font-bold">✅ Metadata sanitized — clean file downloaded!</div>}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
