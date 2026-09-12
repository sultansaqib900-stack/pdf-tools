"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { copyPdfBytes, downloadBytes, isPdfFile, sanitizeDownloadFilename } from "@/lib/pdfBytes";
import { parseCsv } from "@/lib/csv";

interface TemplatePlaceholder {
  key: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

function normalizedKey(value: string): string {
  return value.replace(/^\{\{?|\}\}?$/g, "").trim().toLocaleLowerCase();
}

async function findTextPlaceholders(bytes: Uint8Array): Promise<TemplatePlaceholder[]> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({ data: copyPdfBytes(bytes) });
  const pdf = await loadingTask.promise;
  const placeholders: TemplatePlaceholder[] = [];

  try {
    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex + 1);
      const content = await page.getTextContent();
      for (const item of content.items) {
        const textItem = item as { str?: string; transform?: number[]; width?: number; height?: number };
        const text = textItem.str ?? "";
        if (!textItem.transform || !text) continue;
        const expression = /\{\{\s*([^{}]+?)\s*\}\}|\{\s*([^{}]+?)\s*\}/g;
        let match: RegExpExecArray | null;
        while ((match = expression.exec(text)) !== null) {
          const averageWidth = (textItem.width ?? text.length * 6) / Math.max(text.length, 1);
          placeholders.push({
            key: normalizedKey(match[1] || match[2]),
            pageIndex,
            x: textItem.transform[4] + match.index * averageWidth,
            y: textItem.transform[5],
            width: Math.max(match[0].length * averageWidth, 12),
            height: Math.max(textItem.height ?? Math.abs(textItem.transform[3]) ?? 12, 8),
          });
        }
      }
      page.cleanup();
    }
    return placeholders;
  } finally {
    await loadingTask.destroy();
  }
}

export default function CertificateGeneratorPage() {
  usePageMeta("PDF Certificate Generator - Bulk Certificate Creator | PDFTools Premium", "Generate personalized PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and event participation. Premium.");
  const [template, setTemplate] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTemplate = (file: File | null) => {
    if (!file) return;
    if (!isPdfFile(file)) { setError("Please choose a valid PDF template."); return; }
    setTemplate(file);
    setError(null);
    setSuccess(false);
  };

  const handleCsv = async (file: File | null) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) { setError("Please choose a CSV data file."); return; }
    try {
      const parsed = parseCsv(await file.text());
      setCsvData(file);
      setColumns(parsed.headers);
      setError(parsed.rows.length === 0 ? "CSV must contain at least one data row." : null);
      setSuccess(false);
    } catch (csvError) {
      setCsvData(null);
      setColumns([]);
      setError(csvError instanceof Error ? csvError.message : "Could not read the CSV file.");
    }
  };

  const generate = async () => {
    if (!template || !csvData) return;
    setGenerating(true);
    setProgress(0);
    setGeneratedCount(0);
    setError(null);
    setSuccess(false);

    try {
      const table = parseCsv(await csvData.text());
      if (table.rows.length === 0) throw new Error("CSV must contain at least one data row.");
      if (table.rows.length > 250) throw new Error("Generate at most 250 certificates at a time.");

      const templateBytes = new Uint8Array(await template.arrayBuffer());
      const placeholders = await findTextPlaceholders(templateBytes);
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup, StandardFonts, rgb } = await import("pdf-lib");
      const files: Record<string, Uint8Array> = {};

      for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
        const row = table.rows[rowIndex];
        const values = new Map(Object.entries(row).map(([key, value]) => [normalizedKey(key), value]));
        const document = await PDFDocument.load(copyPdfBytes(templateBytes));
        const font = await document.embedFont(StandardFonts.Helvetica);
        let replacements = 0;

        try {
          const form = document.getForm();
          for (const field of form.getFields()) {
            const value = values.get(normalizedKey(field.getName()));
            if (value === undefined) continue;
            if (field instanceof PDFTextField) {
              field.setText(value);
            } else if (field instanceof PDFCheckBox) {
              if (/^(1|true|yes|checked|x)$/i.test(value)) field.check();
              else field.uncheck();
            } else if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
              if (value) field.select(value);
            } else {
              continue;
            }
            replacements += 1;
          }
          if (replacements > 0) {
            form.updateFieldAppearances(font);
            form.flatten();
          }
        } catch {
          // Text placeholders below still work for templates without AcroForms.
        }

        for (const placeholder of placeholders) {
          const value = values.get(placeholder.key);
          if (value === undefined) continue;
          const page = document.getPage(placeholder.pageIndex);
          const { width: pageWidth } = page.getSize();
          const maxTextWidth = Math.max(30, pageWidth - placeholder.x - 24);
          let fontSize = Math.max(10, Math.min(28, placeholder.height * 1.35));
          while (fontSize > 7 && font.widthOfTextAtSize(value, fontSize) > maxTextWidth) fontSize -= 1;
          page.drawRectangle({
            x: Math.max(0, placeholder.x - 2),
            y: placeholder.y - placeholder.height * 0.25,
            width: placeholder.width + 4,
            height: placeholder.height * 1.35,
            color: rgb(1, 1, 1),
          });
          page.drawText(value, {
            x: placeholder.x,
            y: placeholder.y,
            size: fontSize,
            font,
            color: rgb(0.08, 0.08, 0.08),
            maxWidth: maxTextWidth,
          });
          replacements += 1;
        }

        if (replacements === 0) {
          throw new Error(`No template field or {{COLUMN}} placeholder matched the CSV headers: ${table.headers.join(", ")}.`);
        }

        const nameValue = values.get("name") || values.get(normalizedKey(table.headers[0])) || String(rowIndex + 1);
        let outputName = sanitizeDownloadFilename(`certificate-${nameValue}.pdf`);
        if (files[outputName]) outputName = sanitizeDownloadFilename(`certificate-${nameValue}-${rowIndex + 1}.pdf`);
        files[outputName] = await document.save({ useObjectStreams: true });
        setProgress(Math.round(((rowIndex + 1) / table.rows.length) * 100));
      }

      const entries = Object.entries(files);
      if (entries.length === 1) {
        downloadBytes(entries[0][1], entries[0][0]);
      } else {
        const { zipSync } = await import("fflate");
        const archive = zipSync(files, { level: 6 });
        downloadBytes(archive, "certificates.zip", "application/zip");
      }
      setGeneratedCount(entries.length);
      setSuccess(true);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Failed to generate certificates.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PremiumGate title="Bulk PDF Certificate Generator" description="Create personalized PDF certificates and diplomas in bulk from a fillable PDF or {{COLUMN}} text placeholders and a CSV participant list." icon="🏆">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Certificate Generator" description="Generate personalized PDF certificates in bulk from a template and CSV. Premium." url="https://allaboutpdfediting.xyz/certificate-generator" image="https://allaboutpdfediting.xyz/opengraph-image.png" />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Certificate Generator", item: "https://allaboutpdfediting.xyz/certificate-generator" }]} />
        <HowToJsonLd name="Generate PDF Certificates in Bulk" description="Create personalized PDF certificates in bulk from a template and CSV data" steps={[{name:"Prepare template",text:"Use PDF form fields or text such as {{NAME}} matching your CSV headers"},{name:"Upload CSV data",text:"Upload a CSV file with one participant per row"},{name:"Generate certificates",text:"Download one PDF or a ZIP containing all generated certificates"}]} />
        <AiSummaryJsonLd name="Certificate Generator" summary="Bulk-generate personalized PDF certificates from fillable fields or named placeholders and CSV data" category="BusinessApplications" inputType="PDF+CSV" outputType="PDF or ZIP" processing="client-side" price="premium" features={["Bulk certificate generation","Quoted CSV support","Fillable form support","Text placeholders","ZIP download","Client-side rendering"]} limits="Premium subscribers; 250 rows per batch" />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2"><h1 className="text-3xl font-extrabold text-[var(--foreground)]">Certificate Generator</h1><span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full">Premium</span></div>
          <p className="text-[var(--muted)]">Fill PDF form fields or placeholders such as <code className="text-indigo-500">{"{{NAME}}"}</code> from each row of a CSV.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">1. Certificate Template (PDF)</label>
            <p className="text-xs text-[var(--muted)] mb-3">Use fillable field names or visible {"{{COLUMN}}"} placeholders that match the CSV header.</p>
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => handleTemplate(event.target.files?.[0] || null)} className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white" />
            {template && <p className="text-xs font-semibold text-emerald-600 mt-2">✓ {template.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">2. Participant Data (CSV)</label>
            <p className="text-xs text-[var(--muted)] mb-3">Quoted commas and multi-line values are supported. Maximum 250 rows.</p>
            <input type="file" accept="text/csv,.csv" onChange={(event) => void handleCsv(event.target.files?.[0] || null)} className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white" />
            {columns.length > 0 && <p className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs">Columns: <span className="text-indigo-500 font-bold">{columns.join(", ")}</span></p>}
          </div>

          {generating && <div className="space-y-1" aria-live="polite"><div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden"><div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} /></div><p className="text-xs text-center text-[var(--muted)]">Generating… {progress}%</p></div>}

          <button onClick={generate} disabled={!template || !csvData || generating} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25">
            {generating ? "Generating Certificates…" : "⚡ Generate Certificates"}
          </button>
        </div>

        {success && <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center"><div className="text-4xl mb-2">🎉</div><p className="font-bold text-emerald-600 text-lg">{generatedCount} certificate{generatedCount === 1 ? "" : "s"} generated and downloaded.</p></div>}
        {error && <div role="alert" className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
