"use client";

import { useState, useRef } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function BatesNumberingPage() {
  usePageMeta("Add Bates Numbering to PDF - Sequential Page Numbers | PDFTools Premium", "Add sequential Bates numbers, letters, or custom labels to every page of your PDF. Perfect for legal documents, discovery, and document indexing. Premium feature.");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [startNum, setStartNum] = useState(1);
  const [suffix, setSuffix] = useState("");
  const [digits, setDigits] = useState(5);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center">("bottom-right");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleProcess() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const font = await srcDoc.embedFont(StandardFonts.Helvetica);
      const total = srcDoc.getPageCount();
      for (let i = 0; i < total; i++) {
        const page = srcDoc.getPage(i);
        const { width, height } = page.getSize();
        const num = (startNum + i).toString().padStart(digits, "0");
        const label = `${prefix}${num}${suffix}`;
        const fontSize = 8;
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        let x = 0;
        let y = 0;
        const margin = 36;
        switch (position) {
          case "bottom-right":
            x = width - textWidth - margin;
            y = margin;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "top-right":
            x = width - textWidth - margin;
            y = height - margin;
            break;
          case "top-left":
            x = margin;
            y = height - margin;
            break;
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = margin;
            break;
        }
        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      }
      const pdfBytes = await srcDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to process PDF. Try a different file.");
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  }

  return (
    <PremiumGate
      title="Bates Numbering for Legal & Professional PDFs"
      description="Add sequential page numbers, custom prefixes/suffixes, and document identifiers to every page of your PDF documents."
      icon="🔢"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <BreadcrumbJsonLd items={[{ name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Bates Numbering", item: "https://allaboutpdfediting.xyz/bates-numbering" }]} />
        <HowToJsonLd name="Bates Numbering for PDF" description="Add sequential page numbers and custom labels to every page of a PDF" steps={[{name:"Upload PDF",text:"Upload the PDF document to number"},{name:"Configure numbering",text:"Set prefix suffix start number digit padding and position"},{name:"Download numbered PDF",text:"Download the PDF with Bates numbers applied to every page"}]} />
        <AiSummaryJsonLd name="Bates Numbering" summary="Add sequential page numbers letters or custom labels to every page of PDF documents for legal and professional indexing" category="BusinessApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Sequential numbering","Custom prefix suffix","Digit padding","Position selection","Legal document support"]} limits="Premium subscribers" />
        <SoftwareAppJsonLd name="Bates Numbering for PDF" description="Add sequential page numbers and labels to PDF documents." url="https://allaboutpdfediting.xyz/bates-numbering" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.9, bestRating: 5, ratingCount: 98 }} />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Bates Numbering</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Add sequential page numbers, letters, or custom labels to every page.</p>
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-xl"}`}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-4">🔢</div>
            <p className="font-bold text-lg text-[var(--foreground)] mb-1">Drop a PDF here or click to browse</p>
            <p className="text-sm text-[var(--muted)]">Add Bates numbers to every page</p>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          </div>
        ) : (
          <div>
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 mb-6 shadow-xl">
              <p className="text-sm text-[var(--muted)] mb-4">File: <span className="font-semibold text-[var(--foreground)]">{file.name}</span> ({file.size < 1024 * 1024 ? Math.round(file.size / 1024) + " KB" : (file.size / (1024 * 1024)).toFixed(1) + " MB"})</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Prefix</label>
                  <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. DEF-" className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Suffix</label>
                  <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. -v1" className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Start Number</label>
                  <input type="number" value={startNum} onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Digit Padding</label>
                  <select value={digits} onChange={(e) => setDigits(parseInt(e.target.value))} className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] outline-none focus:border-indigo-500">
                    <option value={3}>000 (3 digits)</option>
                    <option value={4}>0000 (4 digits)</option>
                    <option value={5}>00000 (5 digits)</option>
                    <option value={6}>000000 (6 digits)</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] outline-none focus:border-indigo-500">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
              <div className="text-sm text-[var(--muted)] mb-5 p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                Preview sample: <code className="text-indigo-500 font-bold">{prefix}{startNum.toString().padStart(digits, "0")}{suffix}</code>, <code className="text-indigo-500 font-bold">{prefix}{(startNum + 1).toString().padStart(digits, "0")}{suffix}</code>...
              </div>
              <div className="flex gap-3">
                <button onClick={handleProcess} disabled={processing} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-sm hover:opacity-95 disabled:opacity-50 transition shadow-md shadow-amber-500/20">
                  {processing ? "Applying Numbering..." : "Apply Bates Numbers"}
                </button>
                <button onClick={() => { setFile(null); setDownloadUrl(null); }} className="px-4 py-3 border border-[var(--card-border)] text-[var(--muted)] rounded-xl text-sm hover:text-[var(--foreground)] transition">Cancel</button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {downloadUrl && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center animate-scaleIn">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">✅ Bates numbering applied successfully!</p>
                <a href={downloadUrl} download={`numbered-${file.name}`} className="inline-block px-8 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/25">Download Numbered PDF</a>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
