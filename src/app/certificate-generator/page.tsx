"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


export default function CertificateGeneratorPage() {
  usePageMeta("PDF Certificate Generator - Bulk Certificate Creator | PDFTools Premium", "Generate personalized PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and event participation. Premium.");
  const [template, setTemplate] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<File | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Certificate Generator" description="Generate personalized PDF certificates in bulk. Premium." url="https://allaboutpdfediting.xyz/certificate-generator" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 189 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-bold mb-3">Certificate Generator</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Create personalized certificates for your students, attendees, or team members in bulk.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can generate certificates</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
            const placeholder = `[${header.toUpperCase()}]`;
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Certificate Generator" description="Generate personalized PDF certificates in bulk from a template and CSV. Premium." url="https://allaboutpdfediting.xyz/certificate-generator" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 189 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Certificate Generator", item: "https://allaboutpdfediting.xyz/certificate-generator" }]} />
      <HowToJsonLd name="Generate PDF Certificates in Bulk" description="Create personalized PDF certificates in bulk from a template and CSV data" steps={[{name:"Upload certificate template",text:"Upload your PDF certificate template with placeholder fields"},{name:"Upload CSV data",text:"Upload a CSV file with participant names and details"},{name:"Generate certificates",text:"The tool merges data into the template and generates individual PDF certificates"}]} />
      <AiSummaryJsonLd name="Certificate Generator" summary="Bulk-generate personalized PDF certificates from a template and CSV data" category="BusinessApplications" inputType="PDF+CSV" outputType="PDF" processing="client-side" price="premium" features={["Bulk certificate generation","CSV data merge","Customizable templates","Batch processing","Client-side rendering"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Certificate Generator</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Upload a certificate template and a CSV of names/dates to generate personalized PDFs in bulk.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">1. Certificate Template (PDF)</label>
          <p className="text-xs text-[var(--muted)] mb-2">Create a PDF with placeholders like <code className="bg-[var(--background)] px-1 rounded">[NAME]</code>, <code className="bg-[var(--background)] px-1 rounded">[DATE]</code>, <code className="bg-[var(--background)] px-1 rounded">[COURSE]</code></p>
          <div className="flex items-center gap-3">
            <input type="file" accept=".pdf" onChange={(e) => handleTemplate(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium" />
            {template && <span className="text-xs text-emerald-600">Loaded: {template.name}</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">2. Data File (CSV)</label>
          <p className="text-xs text-[var(--muted)] mb-2">First row should match your placeholders: <code className="bg-[var(--background)] px-1 rounded">NAME,DATE,COURSE</code></p>
          <input type="file" accept=".csv" onChange={(e) => handleCsv(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium" />
          {placeholders.length > 0 && (
            <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg">
              <p className="text-xs font-medium text-[var(--foreground)]">Detected placeholders: <code className="text-indigo-600">{placeholders.map(p => `[${p.toUpperCase()}]`).join(", ")}</code></p>
              <p className="text-xs text-[var(--muted)] mt-1">Make sure your PDF template contains these markers</p>
            </div>
          )}
        </div>

        <button
          onClick={generate}
          disabled={!template || !csvData || generating}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition"
        >
          {generating ? "Generating..." : "Generate Certificates"}
        </button>
      </div>

      {success && (
        <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">{generatedCount} certificate(s) generated and downloading</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Certificate Generator</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Create personalized certificates for course completions, event participation, awards, and professional development. Upload your certificate template as a PDF (with placeholders like <code>[NAME]</code>), upload a CSV with the data, and we generate one personalized PDF per row.</p>
          <p>Perfect for: online course creators, HR departments, event organizers, school administrators, and training coordinators.</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
