"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { transformPdfColors } from "@/lib/pdfRaster";
import { downloadBytes, isPdfFile } from "@/lib/pdfBytes";

type Mode = "invert" | "grayscale" | "high-contrast";

export default function PdfInverterPage() {
  usePageMeta("PDF Color Inverter - Dark Mode & Accessibility Converter | PDFTools Premium", "Convert PDF colors: invert to dark mode, convert to grayscale, or increase contrast for accessibility. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("invert");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const transform = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    try {
      if (!isPdfFile(file)) throw new Error("Please select a valid PDF file.");
      const bytes = await transformPdfColors(
        await file.arrayBuffer(),
        mode,
        (completed, total) => setProgress(Math.round((completed / total) * 100)),
      );
      downloadBytes(bytes, `${mode}-${file.name}`);
      setSuccess(true);
    } catch (transformError) {
      setError(transformError instanceof Error ? transformError.message : "Failed to transform PDF colors. The file may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PremiumGate
      title="PDF Color Inverter & Dark Mode Engine"
      description="Invert document colors to true dark mode, convert colored PDFs into ink-saving grayscale, or increase contrast."
      icon="🎨"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Color Inverter" description="Invert colors, grayscale, or high-contrast for PDF accessibility." url="https://allaboutpdfediting.xyz/pdf-inverter" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.4, bestRating: 5, ratingCount: 78 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Inverter", item: "https://allaboutpdfediting.xyz/pdf-inverter" }]} />
        <HowToJsonLd name="Invert PDF Colors" description="Transform PDF colors to dark mode grayscale or high-contrast" steps={[{name:"Upload PDF",text:"Upload the PDF you want to transform"},{name:"Choose color mode",text:"Select dark mode grayscale or high-contrast"},{name:"Download transformed PDF",text:"Download the PDF with new color scheme applied"}]} />
        <AiSummaryJsonLd name="Color Inverter" summary="Transform PDF color schemes to dark mode grayscale or high-contrast for accessibility" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Dark mode conversion","Grayscale conversion","High-contrast mode","Accessibility features","Client-side rendering"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF Color Inverter</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Transform PDF colors for dark mode reading, accessibility, or ink savings.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => { const selected = e.target.files?.[0] || null; if (selected && isPdfFile(selected)) { setFile(selected); setError(null); setSuccess(false); } else if (selected) setError("Please select a valid PDF file."); }} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 font-semibold mt-2">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "invert" as Mode, label: "🌙 Dark Mode", desc: "Invert all colors" },
              { value: "grayscale" as Mode, label: "⚫ Grayscale", desc: "Remove all color" },
              { value: "high-contrast" as Mode, label: "🔲 High Contrast", desc: "Max readability" },
            ].map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-2xl border text-center transition-all ${mode === m.value ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30" : "border-[var(--card-border)] bg-[var(--background)] hover:border-amber-400/50"}`}
              >
                <div className="text-3xl mb-1">{m.label.split(" ")[0]}</div>
                <p className="text-xs font-bold text-[var(--foreground)]">{m.label.split(" ").slice(1).join(" ")}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>

          {processing && (
            <div className="space-y-1" aria-live="polite">
              <div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="text-xs text-[var(--muted)] text-center">Rendering and transforming pages… {progress}%</p>
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">Color conversion rebuilds pages as images so every pixel—including scanned content—is transformed consistently.</p>

          <button
            onClick={transform}
            disabled={!file || processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {processing ? "Transforming Colors..." : "⚡ Transform & Download PDF"}
          </button>
        </div>

        {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 font-bold">✅ Transformed PDF downloaded!</div>}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
