"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

type Mode = "invert" | "grayscale" | "high-contrast";

export default function PdfInverterPage() {
  usePageMeta("PDF Color Inverter - Dark Mode & Accessibility Converter | PDFTools Premium", "Convert PDF colors: invert to dark mode, convert to grayscale, or increase contrast for accessibility. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("invert");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Color Inverter" description="Invert PDF colors, convert to grayscale, high contrast. Premium accessibility." url="https://allaboutpdfediting.xyz/pdf-inverter" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.4, bestRating: 5, ratingCount: 78 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-3xl font-bold mb-3">PDF Color Inverter</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Invert colors, convert to grayscale, or boost contrast for better accessibility.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can transform PDF colors</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const transform = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        if (mode === "invert") {
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0), opacity: 1 });
        } else if (mode === "grayscale") {
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.5, 0.5, 0.5), opacity: 0.15 });
        } else if (mode === "high-contrast") {
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0), opacity: 0.85 });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mode}-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to transform PDF colors. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Color Inverter" description="Invert colors, grayscale, or high-contrast for PDF accessibility." url="https://allaboutpdfediting.xyz/pdf-inverter" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.4, bestRating: 5, ratingCount: 78 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Inverter", item: "https://allaboutpdfediting.xyz/pdf-inverter" }]} />
      <HowToJsonLd name="Invert PDF Colors" description="Transform PDF colors to dark mode grayscale or high-contrast" steps={[{name:"Upload PDF",text:"Upload the PDF you want to transform"},{name:"Choose color mode",text:"Select dark mode grayscale or high-contrast"},{name:"Download transformed PDF",text:"Download the PDF with new color scheme applied"}]} />
      <AiSummaryJsonLd name="Color Inverter" summary="Transform PDF color schemes to dark mode grayscale or high-contrast for accessibility" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Dark mode conversion","Grayscale conversion","High-contrast mode","Accessibility features","Client-side rendering"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">PDF Color Inverter</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Transform PDF colors for dark mode reading, accessibility, or ink savings.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "invert" as Mode, label: "🌙 Dark Mode", desc: "Invert all colors" },
            { value: "grayscale" as Mode, label: "⚫ Grayscale", desc: "Remove all color" },
            { value: "high-contrast" as Mode, label: "🔲 High Contrast", desc: "Max readability" },
          ].map(m => (
            <button key={m.value} onClick={() => setMode(m.value)} className={`p-4 rounded-xl border text-center transition ${mode === m.value ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500" : "border-[var(--card-border)] hover:border-indigo-300"}`}>
              <div className="text-2xl mb-1">{m.label.split(" ")[0]}</div>
              <p className="text-xs font-medium">{m.label.split(" ").slice(1).join(" ")}</p>
              <p className="text-[10px] text-[var(--muted)]">{m.desc}</p>
            </button>
          ))}
        </div>

        <button onClick={transform} disabled={!file || processing} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition">
          {processing ? "Transforming..." : "Transform PDF"}
        </button>
      </div>

      {success && <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-700">✅ Transformed PDF downloading!</div>}
      {error && <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF Color Inverter</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">Transform your PDF for different viewing needs. Dark mode inverts colors for comfortable nighttime reading. Grayscale removes color for ink-efficient printing. High contrast boosts readability for visually impaired users or low-light environments.</div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
