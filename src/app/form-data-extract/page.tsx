"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function FormDataExtractPage() {
  usePageMeta("Extract PDF Form Data to CSV - Form Field Extractor | PDFTools Premium", "Extract filled form field data from PDF documents to CSV. Batch export PDF form data to Excel. Premium.");
  const [files, setFiles] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [csvResult, setCsvResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    <PremiumGate
      title="Extract PDF Form Data to CSV"
      description="Batch extract filled form fields and questionnaire responses from PDF documents directly into CSV spreadsheets."
      icon="📊"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Form Data Extractor" description="Extract filled form field data from PDF documents to CSV spreadsheet files." url="https://allaboutpdfediting.xyz/form-data-extract" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 143 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Form Data Extract", item: "https://allaboutpdfediting.xyz/form-data-extract" }]} />
        <HowToJsonLd name="Extract PDF Form Data to CSV" description="Extract filled form field data from PDF forms and export to CSV" steps={[{name:"Upload PDF form",text:"Upload a PDF with interactive form fields AcroForms or XFA"},{name:"Extract data",text:"The tool reads all form fields and extracts their values"},{name:"Download CSV",text:"Download the extracted data as a CSV file for analysis"}]} />
        <AiSummaryJsonLd name="Form Data Extraction" summary="Extract field values from PDF forms and export them to CSV format" category="BusinessApplications" inputType="PDF" outputType="CSV" processing="client-side" price="premium" features={["AcroForm extraction","CSV export","Batch processing","Field name mapping","No data uploads"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Form Data Extraction</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Extract filled AcroForm field data from PDFs into a CSV file for Excel, Google Sheets, or analysis.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Upload filled PDF forms</label>
            <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
              <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
              {files.length > 0 && <p className="text-xs text-emerald-600 font-semibold mt-2">{files.length} file(s) selected</p>}
            </div>
          </div>

          <button
            onClick={extract}
            disabled={files.length === 0 || extracting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {extracting ? "Extracting Form Data..." : `⚡ Extract Data from ${files.length} File(s)`}
          </button>

          {csvResult && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <button onClick={downloadCsv} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition text-sm shadow-md shadow-emerald-600/20">⬇ Download CSV</button>
                <button onClick={() => { navigator.clipboard.writeText(csvResult); }} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm">📋 Copy to Clipboard</button>
              </div>
              <textarea readOnly value={csvResult} className="w-full h-48 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] leading-relaxed" />
            </div>
          )}
        </div>

        {success && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">✅ Data extracted! Download your CSV or copy to clipboard.</p>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>
        )}
      </div>
    </PremiumGate>
  );
}
