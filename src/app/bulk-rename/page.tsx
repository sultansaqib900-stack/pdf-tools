"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { createZipArchive } from "@/lib/archive";
import { downloadBytes } from "@/lib/pdfBytes";

interface FileMeta {
  file: File;
  title: string;
  author: string;
  pages: number;
  newName: string;
}

export default function BulkRenamePage() {
  usePageMeta("Bulk Rename PDF Files - Auto-Rename by Metadata | PDFTools Premium", "Package multiple PDFs with filenames based on title, author, page count, and original filename metadata. Premium.");
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState("{title}");
  const [success, setSuccess] = useState(false);

  const handleFiles = async (selected: FileList | null) => {
    if (!selected) return;
    setProcessing(true);
    setError(null);
    const metas: FileMeta[] = [];
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }
    for (const f of Array.from(selected)) {
      if (f.type !== "application/pdf") continue;
      try {
        const bytes = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
        try {
          const pdf = await loadingTask.promise;
          const meta = await pdf.getMetadata();
          const info = meta.info as { Title?: string; Author?: string };
          const title = info.Title || f.name.replace(/\.pdf$/i, "");
          const author = info.Author || "Unknown";
          metas.push({
            file: f,
            title,
            author,
            pages: pdf.numPages,
            newName: f.name,
          });
        } finally {
          await loadingTask.destroy();
        }
      } catch {
        metas.push({ file: f, title: f.name.replace(".pdf", ""), author: "Unknown", pages: 0, newName: f.name });
      }
    }
    setFiles(metas);
    setProcessing(false);
  };

  const applyPattern = () => {
    setFiles(prev => prev.map(f => {
      let name = pattern
        .replace(/{title}/g, f.title)
        .replace(/{author}/g, f.author)
        .replace(/{pages}/g, String(f.pages))
        .replace(/{filename}/g, f.file.name.replace(".pdf", ""));
      name = name.replace(/[<>:"/\\|?*]/g, "_").substring(0, 200);
      if (!name.endsWith(".pdf")) name += ".pdf";
      return { ...f, newName: name };
    }));
  };

  const downloadAll = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const entries = await Promise.all(files.map(async (item) => ({
        name: item.newName,
        bytes: await item.file.arrayBuffer(),
      })));
      const archive = createZipArchive(entries);
      downloadBytes(archive, "renamed-pdfs.zip", "application/zip");
      setSuccess(true);
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Failed to build the renamed PDF archive.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PremiumGate
      title="Bulk PDF Renamer & Metadata Organizer"
      description="Automatically batch-rename dozens of PDF documents using internal metadata tags like title, author, and page count."
      icon="🏷️"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Bulk PDF Renamer" description="Rename multiple PDF files at once using document metadata. Premium batch renamer." url="https://allaboutpdfediting.xyz/bulk-rename" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.5, bestRating: 5, ratingCount: 98 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Bulk Rename", item: "https://allaboutpdfediting.xyz/bulk-rename" }]} />
        <HowToJsonLd name="Bulk Rename PDF Files" description="Rename multiple PDFs at once using their embedded metadata" steps={[{name:"Upload PDF files",text:"Select multiple PDF files to rename"},{name:"Choose naming pattern",text:"Select metadata fields like title author or page count as naming pattern"},{name:"Apply new names",text:"Download files with new names based on your pattern"}]} />
        <AiSummaryJsonLd name="Bulk Rename" summary="Rename multiple PDF files simultaneously using embedded metadata fields" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Metadata-based renaming","Batch processing","Custom naming patterns","Title author page count extraction","Client-side only"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Bulk PDF Renamer</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Rename dozens of PDFs at once using their metadata — title, author, or page count.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept=".pdf" multiple onChange={(e) => handleFiles(e.target.files)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            <p className="text-xs text-[var(--muted)] mt-2">Select multiple PDF files to rename</p>
          </div>

          {files.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Naming Pattern Template</label>
                <div className="flex gap-2">
                  <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm font-mono outline-none focus:border-indigo-500" />
                  <button onClick={applyPattern} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-sm">Apply</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["{title}", "{author}", "{pages}", "{filename}"].map(p => (
                    <button key={p} type="button" onClick={() => setPattern(prev => prev + p)} className="px-2.5 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded-lg hover:border-indigo-500 font-mono text-indigo-500 font-semibold">{p}</button>
                  ))}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                    <span className="text-xs font-bold text-[var(--muted)] w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] truncate">{f.file.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">Title: {f.title} · Author: {f.author} · {f.pages}p</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[200px]">→ {f.newName}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={downloadAll}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
              >
                {processing ? "Building ZIP..." : `⚡ Download Renamed ZIP (${files.length} files)`}
              </button>
            </>
          )}
        </div>

        {processing && <p className="text-center text-sm text-[var(--muted)] mt-4">Reading metadata or building the ZIP archive...</p>}
        {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 font-bold">✅ Renamed PDFs packaged and downloaded as a ZIP!</div>}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
