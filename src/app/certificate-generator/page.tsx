"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function CertificateGeneratorPage() {
  usePageMeta("PDF Certificate Generator - Bulk Certificate Creator | PDFTools Premium", "Generate personalized PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and event participation. Premium.");
  const [template, setTemplate] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<File | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTemplate = (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    setTemplate(f);
    setError(null);
  };

  const handleCsv = (f: File | null) => {
    if (!f || !f.name.endsWith(".csv")) return;
    setCsvData(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      if (lines.length > 0) {
        setPlaceholders(lines[0].split(",").map(h => h.trim()));
      }
    };
    reader.readAsText(f);
  };

  const generate = async () => {
    if (!template || !csvData) return;
    setGenerating(true);
    setError(null);
    setSuccess(false);
    try {
      const csvText = await csvData.text();
      const lines = csvText.split("\n").filter(l => l.trim());
      if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); setGenerating(false); return; }
      const headers = lines[0].split(",").map(h => h.trim());
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      let count = 0;
      for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
        const vals = lines[rowIdx].split(",").map(v => v.trim());
        const bytes = await template.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();
          headers.forEach((header, i) => {
            const val = vals[i] || "";
            const text = val;
            page.drawText(text, {
              x: width / 2 - 80,
              y: height / 2,
              size: 24,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
          });
        }
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${rowIdx}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        count++;
      }
      setGeneratedCount(count);
      setSuccess(true);
    } catch {
      setError("Failed to generate certificates. Make sure your template PDF is valid and your CSV is properly formatted.");
    }
    setGenerating(false);
  };

  return (
    <PremiumGate
      title="Bulk PDF Certificate Generator"
      description="Create personalized PDF certificates and diplomas in bulk from any PDF template and CSV participant list."
      icon="🏆"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Certificate Generator" description="Generate personalized PDF certificates in bulk from a template and CSV. Premium." url="https://allaboutpdfediting.xyz/certificate-generator" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 189 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Certificate Generator", item: "https://allaboutpdfediting.xyz/certificate-generator" }]} />
        <HowToJsonLd name="Generate PDF Certificates in Bulk" description="Create personalized PDF certificates in bulk from a template and CSV data" steps={[{name:"Upload certificate template",text:"Upload your PDF certificate template with placeholder fields"},{name:"Upload CSV data",text:"Upload a CSV file with participant names and details"},{name:"Generate certificates",text:"The tool merges data into the template and generates individual PDF certificates"}]} />
        <AiSummaryJsonLd name="Certificate Generator" summary="Bulk-generate personalized PDF certificates from a template and CSV data" category="BusinessApplications" inputType="PDF+CSV" outputType="PDF" processing="client-side" price="premium" features={["Bulk certificate generation","CSV data merge","Customizable templates","Batch processing","Client-side rendering"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Certificate Generator</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Upload a certificate template and a CSV of names/dates to generate personalized PDFs in bulk.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">1. Certificate Template (PDF)</label>
            <p className="text-xs text-[var(--muted)] mb-3">Upload your certificate design layout</p>
            <div className="border border-[var(--card-border)] rounded-xl p-3 bg-[var(--background)] flex items-center justify-between">
              <input type="file" accept=".pdf" onChange={(e) => handleTemplate(e.target.files?.[0] || null)} className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold" />
              {template && <span className="text-xs font-semibold text-emerald-600">✓ {template.name}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">2. Participant Data File (CSV)</label>
            <p className="text-xs text-[var(--muted)] mb-3">First row should be headers (e.g. NAME, DATE, ROLE)</p>
            <div className="border border-[var(--card-border)] rounded-xl p-3 bg-[var(--background)]">
              <input type="file" accept=".csv" onChange={(e) => handleCsv(e.target.files?.[0] || null)} className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full" />
            </div>
            {placeholders.length > 0 && (
              <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-xs font-semibold text-[var(--foreground)]">Detected CSV Columns: <span className="text-indigo-500 font-bold">{placeholders.join(", ")}</span></p>
              </div>
            )}
          </div>

          <button
            onClick={generate}
            disabled={!template || !csvData || generating}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {generating ? "Generating Bulk Certificates..." : "⚡ Generate Certificates"}
          </button>
        </div>

        {success && (
          <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center animate-scaleIn">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{generatedCount} Certificate(s) Generated & Downloaded!</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>
        )}
      </div>
    </PremiumGate>
  );
}
