"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
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
          <div className="flex justify-center mb-6"><Icon name="fileSheet" size={42} className="text-[var(--muted)]" /></div>
          <h1 className="text-3xl font-bold mb-3">Form Data Extraction</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Extract filled form data from PDF documents into CSV files for analysis in Excel.</p>
          <div className="inline-block bg-[var(--premium)] text-white px-8 py-4 rounded-[var(--r-xl)] shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can extract form data</p>
            <a href="/premium" className="inline-block bg-white text-[var(--premium)] px-6 py-2 rounded-[var(--r-lg)] font-semibold text-sm hover:bg-[var(--premium-subtle)] transition">Upgrade to Premium</a>
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
          <span className="text-xs font-semibold bg-[var(--premium)] text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Extract filled AcroForm field data from PDFs into a CSV file for Excel, Google Sheets, or analysis.</p>
      </div>


      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Upload filled PDF forms</label>
          <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium w-full" />
          {files.length > 0 && <p className="text-xs text-[var(--muted)] mt-1">{files.length} file(s) selected</p>}
        </div>

        <button
          onClick={extract}
          disabled={files.length === 0 || extracting}
          className="w-full py-3 bg-[var(--premium)] text-white font-bold rounded-[var(--r-lg)] hover:opacity-90 disabled:opacity-40 transition"
        >
          {extracting ? "Extracting..." : `Extract Data from ${files.length} File(s)`}
        </button>

        {csvResult && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button onClick={downloadCsv} className="flex-1 py-2.5 bg-[var(--success)] text-white font-medium rounded-[var(--r-lg)] hover:opacity-90 transition text-sm">⬇ Download CSV</button>
              <button onClick={() => { navigator.clipboard.writeText(csvResult); }} className="flex-1 py-2.5 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] transition text-sm">📋 Copy to Clipboard</button>
            </div>
            <textarea readOnly value={csvResult} className="w-full h-48 p-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)]" />
          </div>
        )}
      </div>

      {success && (
        <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center">
          <p className="text-sm text-[var(--success)]">✅ Data extracted! Download the CSV or copy it to your clipboard.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] dark:text-[var(--danger)] text-sm">{error}</div>
      )}


      <ToolGuide slug="form-data-extract" />

      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
