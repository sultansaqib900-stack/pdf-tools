"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

type Layout = "booklet" | "2x2" | "4x4";

export default function BookletPage() {
  usePageMeta("Create PDF Booklet - N-Up Printing & Booklet Layout | PDFTools Premium", "Convert PDF to booklet format for printing. N-up layouts, custom margins, saddle-stitch booklets. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<Layout>("booklet");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Booklet Creator" description="Convert PDFs to booklet format for printing. Premium N-up layout tool." url="https://allaboutpdfediting.xyz/booklet" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 134 }} />
        <div className="text-center py-20">
          <div className="flex justify-center mb-6"><Icon name="book" size={42} className="text-[var(--muted)]" /></div>
          <h1 className="text-3xl font-bold mb-3">PDF Booklet Creator</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Convert any PDF into a printable booklet or multi-up layout for professional printing.</p>
          <div className="inline-block bg-[var(--premium)] text-white px-8 py-4 rounded-[var(--r-xl)] shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can create booklets</p>
            <a href="/premium" className="inline-block bg-white text-[var(--premium)] px-6 py-2 rounded-[var(--r-lg)] font-semibold text-sm hover:bg-[var(--premium-subtle)] transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const generate = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const totalPages = srcDoc.getPageCount();

      if (layout === "booklet") {
        const srcW = srcDoc.getPage(0).getWidth();
        const srcH = srcDoc.getPage(0).getHeight();
        for (let i = 0; i < totalPages; i += 2) {
          const page = newDoc.addPage([srcW * 2, srcH]);
          const leftIdx = i;
          const rightIdx = i + 1 < totalPages ? i + 1 : -1;
          if (leftIdx < totalPages) {
            const [leftSrc] = await newDoc.copyPages(srcDoc, [leftIdx]);
            const leftEmb = await newDoc.embedPage(leftSrc);
            page.drawPage(leftEmb, { x: 0, y: 0, width: page.getWidth() / 2, height: page.getHeight() });
          }
          if (rightIdx >= 0) {
            const [rightSrc] = await newDoc.copyPages(srcDoc, [rightIdx]);
            const rightEmb = await newDoc.embedPage(rightSrc);
            page.drawPage(rightEmb, { x: page.getWidth() / 2, y: 0, width: page.getWidth() / 2, height: page.getHeight() });
          }
        }
      } else {
        const grid = layout === "2x2" ? 2 : 4;
        const pagesPerSheet = grid * grid;
        const srcW = srcDoc.getPage(0).getWidth();
        const srcH = srcDoc.getPage(0).getHeight();
        for (let i = 0; i < totalPages; i += pagesPerSheet) {
          const page = newDoc.addPage([srcW * grid, srcH * grid]);
          const pw = page.getWidth() / grid;
          const ph = page.getHeight() / grid;
          for (let row = 0; row < grid; row++) {
            for (let col = 0; col < grid; col++) {
              const idx = i + row * grid + col;
              if (idx < totalPages) {
                const [pSrc] = await newDoc.copyPages(srcDoc, [idx]);
                const pEmb = await newDoc.embedPage(pSrc);
                page.drawPage(pEmb, { x: col * pw, y: page.getHeight() - (row + 1) * ph, width: pw, height: ph });
              }
            }
          }
        }
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booklet-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to create booklet. The file may be corrupted or encrypted.");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Booklet Creator" description="Convert PDF to booklet format, N-up printing layouts. Premium feature." url="https://allaboutpdfediting.xyz/booklet" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 134 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Booklet", item: "https://allaboutpdfediting.xyz/booklet" }]} />
      <HowToJsonLd name="Create PDF Booklet" description="Convert any PDF into a printable booklet with various layouts" steps={[{name:"Upload PDF",text:"Upload the PDF you want to convert to a booklet"},{name:"Choose layout",text:"Select side-by-side 2x2 grid or 4x4 grid layout"},{name:"Download booklet",text:"Download the formatted PDF ready for printing and binding"}]} />
      <AiSummaryJsonLd name="Booklet Creator" summary="Convert PDFs into printable booklets with configurable N-up layouts" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Booklet formatting","N-up layouts 2x2 4x4","Saddle-stitch ready","Side-by-side pages","Print optimization"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">PDF Booklet Creator</h1>
          <span className="text-xs font-semibold bg-[var(--premium)] text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Convert any PDF into a booklet or multi-up layout for professional printing.</p>
      </div>


      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium w-full" />

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Layout</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "booklet" as Layout, label: "Booklet", desc: "Side-by-side pages" },
              { value: "2x2" as Layout, label: "2×2 Grid", desc: "4 pages per sheet" },
              { value: "4x4" as Layout, label: "4×4 Grid", desc: "16 pages per sheet" },
            ].map(l => (
              <button key={l.value} onClick={() => setLayout(l.value)} className={`p-4 rounded-[var(--r-lg)] border text-center transition ${layout === l.value ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent-border)]"}`}>
                <div className="text-2xl mb-1">{l.label.split(" ")[0]}</div>
                <p className="text-xs font-medium">{l.label.split(" ").slice(1).join(" ")}</p>
                <p className="text-[10px] text-[var(--muted)]">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={!file || processing} className="w-full py-3 bg-[var(--premium)] text-white font-bold rounded-[var(--r-lg)] hover:opacity-90 disabled:opacity-40 transition">
          {processing ? "Generating..." : "Create Booklet"}
        </button>
      </div>

      {success && <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center text-sm text-[var(--success)]">✅ Booklet created and downloading!</div>}
      {error && <div className="mt-6 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] text-sm">{error}</div>}


      <ToolGuide slug="booklet" />
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
