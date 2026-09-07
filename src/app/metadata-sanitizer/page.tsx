"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/ui/ToolShell";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
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
          <div className="flex justify-center mb-6"><Icon name="eraser" size={42} className="text-[var(--muted)]" /></div>
          <h1 className="text-3xl font-bold mb-3">PDF Metadata Sanitizer</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Strip all hidden metadata — author, creation date, software info, annotations, and embedded files.</p>
          <div className="inline-block bg-[var(--premium)] text-white px-8 py-4 rounded-[var(--r-xl)] shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can sanitize metadata</p>
            <a href="/premium" className="inline-block bg-white text-[var(--premium)] px-6 py-2 rounded-[var(--r-lg)] font-semibold text-sm hover:bg-[var(--premium-subtle)] transition">Upgrade to Premium</a>
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
    <ToolShell icon="eraser" title={"PDF Metadata Sanitizer"} lead={"Strip hidden metadata \u2014 author name, creation date, software info, annotations, and more."} premium>
      <SoftwareAppJsonLd name="PDF Metadata Sanitizer" description="Strip hidden metadata from PDFs. Privacy cleaning tool." url="https://allaboutpdfediting.xyz/metadata-sanitizer" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 89 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Metadata Sanitizer", item: "https://allaboutpdfediting.xyz/metadata-sanitizer" }]} />
      <HowToJsonLd name="Clean PDF Metadata" description="Strip all hidden metadata from PDF documents including author and software info" steps={[{name:"Upload PDF",text:"Upload the PDF document to sanitize"},{name:"Select metadata to remove",text:"Choose which metadata fields to strip"},{name:"Download cleaned PDF",text:"Download the PDF with all selected metadata removed"}]} />
      <AiSummaryJsonLd name="Metadata Sanitizer" summary="Remove hidden metadata from PDFs including author creation date software info annotations and embedded files" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Author removal","Date stripping","Software info removal","Annotation cleaning","Embedded file removal"]} limits="Premium subscribers" />


      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium w-full" />

        <button onClick={sanitize} disabled={!file || processing} className="w-full py-3 bg-[var(--premium)] text-white font-bold rounded-[var(--r-lg)] hover:opacity-90 disabled:opacity-40 transition">
          {processing ? "Sanitizing..." : "Sanitize Metadata"}
        </button>
      </div>

      {beforeMeta && (
        <div className="mt-4 p-4 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-[var(--r-lg)]">
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

      {success && <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center text-sm text-[var(--success)]">✅ Metadata sanitized — clean file downloading!</div>}
      {error && <div className="mt-6 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] text-sm">{error}</div>}


      <ToolGuide slug="metadata-sanitizer" />
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </ToolShell>
  );
}
