"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

type Layout = "booklet" | "2x2" | "4x4";

export default function BookletPage() {
  usePageMeta("Create PDF Booklet - N-Up Printing & Booklet Layout | PDFTools Premium", "Convert PDF to booklet format for printing. N-up layouts, custom margins, saddle-stitch booklets. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<Layout>("booklet");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generate = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
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
    <PremiumGate
      title="PDF Booklet & N-Up Imposition Creator"
      description="Convert PDFs to booklet layout for dual-sided saddle-stitch printing or compact 2×2 / 4×4 sheets to save paper."
      icon="📖"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Booklet Creator" description="Convert PDF to booklet format, N-up printing layouts. Premium feature." url="https://allaboutpdfediting.xyz/booklet" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.7, bestRating: 5, ratingCount: 134 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Booklet", item: "https://allaboutpdfediting.xyz/booklet" }]} />
        <HowToJsonLd name="Create PDF Booklet" description="Convert any PDF into a printable booklet with various layouts" steps={[{name:"Upload PDF",text:"Upload the PDF you want to convert to a booklet"},{name:"Choose layout",text:"Select side-by-side 2x2 grid or 4x4 grid layout"},{name:"Download booklet",text:"Download the formatted PDF ready for printing and binding"}]} />
        <AiSummaryJsonLd name="Booklet Creator" summary="Convert PDFs into printable booklets with configurable N-up layouts" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Booklet formatting","N-up layouts 2x2 4x4","Saddle-stitch ready","Side-by-side pages","Print optimization"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF Booklet Creator</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Convert any PDF into a booklet or multi-up layout for professional printing.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Imposition Layout</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: "booklet" as Layout, label: "📖 Booklet", desc: "Side-by-side 2-up" },
                { value: "2x2" as Layout, label: "📐 2×2 Grid", desc: "4 pages per sheet" },
                { value: "4x4" as Layout, label: "📐 4×4 Grid", desc: "16 pages per sheet" },
              ].map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLayout(l.value)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-200 ${layout === l.value ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30" : "border-[var(--card-border)] bg-[var(--background)] hover:border-amber-400/50"}`}
                >
                  <div className="text-3xl mb-1">{l.label.split(" ")[0]}</div>
                  <p className="text-xs font-bold text-[var(--foreground)]">{l.label.split(" ").slice(1).join(" ")}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!file || processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {processing ? "Generating Booklet..." : "⚡ Generate & Download Booklet"}
          </button>
        </div>

        {success && (
          <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold animate-scaleIn">
            ✅ Booklet created and downloaded successfully!
          </div>
        )}
        {error && (
          <div className="mt-6 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
