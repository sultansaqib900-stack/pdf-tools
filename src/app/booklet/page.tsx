"use client";

import { useState } from "react";
import type { PDFPage } from "pdf-lib";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { downloadBytes } from "@/lib/pdfBytes";

type Layout = "booklet" | "2x2" | "4x4";

export default function BookletPage() {
  usePageMeta("Create PDF Booklet - N-Up Printing & Booklet Layout | PDFTools Premium", "Create saddle-stitch page order or scale PDF pages into 2×2 and 4×4 N-up layouts. Premium.");
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
      if (totalPages === 0) throw new Error("The PDF has no pages.");
      const firstPage = srcDoc.getPage(0);
      const srcW = firstPage.getWidth();
      const srcH = firstPage.getHeight();
      const embeddedPages = await newDoc.embedPdf(bytes, Array.from({ length: totalPages }, (_, index) => index));

      const drawInCell = (
        sheet: PDFPage,
        sourceIndex: number,
        x: number,
        y: number,
        cellWidth: number,
        cellHeight: number,
      ) => {
        if (sourceIndex < 0 || sourceIndex >= totalPages) return;
        const embedded = embeddedPages[sourceIndex];
        const margin = Math.min(8, cellWidth * 0.02, cellHeight * 0.02);
        const availableWidth = Math.max(1, cellWidth - margin * 2);
        const availableHeight = Math.max(1, cellHeight - margin * 2);
        const scale = Math.min(availableWidth / embedded.width, availableHeight / embedded.height);
        const width = embedded.width * scale;
        const height = embedded.height * scale;
        sheet.drawPage(embedded, {
          x: x + (cellWidth - width) / 2,
          y: y + (cellHeight - height) / 2,
          width,
          height,
        });
      };

      if (layout === "booklet") {
        // Pad to a multiple of four and emit front/back sides in true
        // saddle-stitch order. For eight pages this is 8|1, 2|7, 6|3, 4|5.
        const paddedPages = Math.ceil(totalPages / 4) * 4;
        const sheetWidth = Math.max(srcW, srcH);
        const sheetHeight = Math.min(srcW, srcH);
        const cellWidth = sheetWidth / 2;
        const sheets = paddedPages / 4;
        for (let sheetIndex = 0; sheetIndex < sheets; sheetIndex += 1) {
          const front = newDoc.addPage([sheetWidth, sheetHeight]);
          drawInCell(front, paddedPages - 1 - sheetIndex * 2, 0, 0, cellWidth, sheetHeight);
          drawInCell(front, sheetIndex * 2, cellWidth, 0, cellWidth, sheetHeight);

          const back = newDoc.addPage([sheetWidth, sheetHeight]);
          drawInCell(back, sheetIndex * 2 + 1, 0, 0, cellWidth, sheetHeight);
          drawInCell(back, paddedPages - 2 - sheetIndex * 2, cellWidth, 0, cellWidth, sheetHeight);
        }
      } else {
        const grid = layout === "2x2" ? 2 : 4;
        const pagesPerSheet = grid * grid;
        for (let firstIndex = 0; firstIndex < totalPages; firstIndex += pagesPerSheet) {
          // Keep the source paper size and scale each source page into a cell;
          // increasing the sheet dimensions would not be genuine N-up output.
          const sheet = newDoc.addPage([srcW, srcH]);
          const cellWidth = srcW / grid;
          const cellHeight = srcH / grid;
          for (let row = 0; row < grid; row += 1) {
            for (let column = 0; column < grid; column += 1) {
              const sourceIndex = firstIndex + row * grid + column;
              drawInCell(
                sheet,
                sourceIndex,
                column * cellWidth,
                srcH - (row + 1) * cellHeight,
                cellWidth,
                cellHeight,
              );
            }
          }
        }
      }

      const pdfBytes = await newDoc.save();
      downloadBytes(pdfBytes, `${layout}-${file.name}`);
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
                { value: "booklet" as Layout, label: "📖 Booklet", desc: "Front/back stitch order" },
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

          {layout === "booklet" && (
            <p className="text-xs text-[var(--muted)]">Output sides are ordered for duplex saddle-stitch printing. Print at actual size, flip on the short edge, stack, fold, and verify your printer&apos;s duplex orientation with a test sheet.</p>
          )}

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
