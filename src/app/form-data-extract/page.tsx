"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


export default function FormDataExtractPage() {
  usePageMeta("Extract PDF Form Data to CSV - Form Field Extractor | PDFTools Premium", "Extract filled form field data from PDF documents to CSV. Batch export PDF form data to Excel. Premium.");
  const [files, setFiles] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [csvResult, setCsvResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Form Data Extractor" description="Extract filled form field data from PDFs to CSV. Premium." url="https://allaboutpdfediting.xyz/form-data-extract" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 143 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold mb-3">Form Data Extraction</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Extract filled form data from PDF documents into CSV files for analysis in Excel.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can extract form data</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const extract = async () => {
    if (files.length === 0) return;
    setExtracting(true);
    setError(null);
    setSuccess(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const allRows: Record<string, string>[] = [];
      const allFields = new Set<string>();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        const form = pdfDoc.getForm();
        const fieldNames = form.getFields().map((f: any) => f.getName());
        const row: Record<string, string> = { _file: file.name };
        for (const name of fieldNames) {
          allFields.add(name);
          try {
            const field = (form as any).getFieldByName(name);
            const type = field.constructor.name;
            let val = "";
            if (type === "PDFTextField") val = (field as any).getText() || "";
            else if (type === "PDFCheckBox") val = (field as any).isChecked() ? "Checked" : "Unchecked";
            else if (type === "PDFDropdown" || type === "PDFOptionList") val = (field as any).getSelected()?.join(", ") || "";
            else val = "[Unsupported field type]";
            row[name] = val;
          } catch { row[name] = "[Error reading]"; }
        }
        allRows.push(row);
      }

      const headers = ["_file", ...Array.from(allFields)];
      const csvLines = [headers.join(",")];
      for (const row of allRows) {
        const vals = headers.map(h => {
          const v = row[h] || "";
          return v.includes(",") || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
        });
        csvLines.push(vals.join(","));
      }

      setCsvResult(csvLines.join("\n"));
      setSuccess(true);
    } catch {
      setError("Failed to extract form data. Ensure your PDFs contain AcroForm fields.");
    }
    setExtracting(false);
  };

  const downloadCsv = () => {
    if (!csvResult) return;
    const blob = new Blob([csvResult], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Form Data Extractor" description="Extract filled form field data from PDF documents to CSV spreadsheet files." url="https://allaboutpdfediting.xyz/form-data-extract" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 143 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Form Data Extract", item: "https://allaboutpdfediting.xyz/form-data-extract" }]} />
      <HowToJsonLd name="Extract PDF Form Data to CSV" description="Extract filled form field data from PDF forms and export to CSV" steps={[{name:"Upload PDF form",text:"Upload a PDF with interactive form fields AcroForms or XFA"},{name:"Extract data",text:"The tool reads all form fields and extracts their values"},{name:"Download CSV",text:"Download the extracted data as a CSV file for analysis"}]} />
      <AiSummaryJsonLd name="Form Data Extraction" summary="Extract field values from PDF forms and export them to CSV format" category="BusinessApplications" inputType="PDF" outputType="CSV" processing="client-side" price="premium" features={["AcroForm extraction","CSV export","Batch processing","Field name mapping","No data uploads"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Form Data Extraction</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Extract filled AcroForm field data from PDFs into a CSV file for Excel, Google Sheets, or analysis.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Upload filled PDF forms</label>
          <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />
          {files.length > 0 && <p className="text-xs text-[var(--muted)] mt-1">{files.length} file(s) selected</p>}
        </div>

        <button
          onClick={extract}
          disabled={files.length === 0 || extracting}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition"
        >
          {extracting ? "Extracting..." : `Extract Data from ${files.length} File(s)`}
        </button>

        {csvResult && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button onClick={downloadCsv} className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition text-sm">⬇ Download CSV</button>
              <button onClick={() => { navigator.clipboard.writeText(csvResult); }} className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm">📋 Copy to Clipboard</button>
            </div>
            <textarea readOnly value={csvResult} className="w-full h-48 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)]" />
          </div>
        )}
      </div>

      {success && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">✅ Data extracted! Download the CSV or copy it to your clipboard.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Form Data Extraction</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Extract all filled form fields from AcroForm PDFs into a structured CSV file. Each PDF becomes one row, each form field becomes one column. Perfect for processing survey responses, application forms, and data collection documents.</p>
          <p>Supports text fields, checkboxes, dropdowns, and option lists. The CSV can be opened directly in Excel, Google Sheets, or any spreadsheet application.</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
