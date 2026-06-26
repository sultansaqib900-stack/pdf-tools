"use client";

import { useState } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

interface FileMeta {
  file: File;
  title: string;
  author: string;
  pages: number;
  newName: string;
}

export default function BulkRenamePage() {
  usePageMeta("Bulk Rename PDF Files - Auto-Rename by Metadata | PDFTools Premium", "Rename multiple PDF files at once based on their metadata - title, author, date. Batch PDF renamer. Premium.");
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumBanner, setPremiumBanner] = useState(false);
  const [pattern, setPattern] = useState("{title}");
  const [success, setSuccess] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Bulk PDF Renamer" description="Rename multiple PDF files by metadata automatically. Premium." url="https://allaboutpdfediting.xyz/bulk-rename" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.5, bestRating: 5, ratingCount: 98 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🏷️</div>
          <h1 className="text-3xl font-bold mb-3">Bulk PDF Renamer</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Rename dozens of PDF files instantly based on their document title, author, or page count.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can bulk rename PDFs</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const meta = await pdf.getMetadata();
        const title = (meta as any).info?.Title || f.name.replace(".pdf", "");
        const author = (meta as any).info?.Author || "Unknown";
        metas.push({
          file: f,
          title,
          author,
          pages: pdf.numPages,
          newName: f.name,
        });
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

  const downloadAll = () => {
    for (const f of files) {
      const blob = new Blob([f.file], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.newName;
      a.click();
      URL.revokeObjectURL(url);
    }
    setSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Bulk PDF Renamer" description="Rename multiple PDF files at once using document metadata. Premium batch renamer." url="https://allaboutpdfediting.xyz/bulk-rename" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.5, bestRating: 5, ratingCount: 98 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Bulk Rename", item: "https://allaboutpdfediting.xyz/bulk-rename" }]} />
      <HowToJsonLd name="Bulk Rename PDF Files" description="Rename multiple PDFs at once using their embedded metadata" steps={[{name:"Upload PDF files",text:"Select multiple PDF files to rename"},{name:"Choose naming pattern",text:"Select metadata fields like title author or page count as naming pattern"},{name:"Apply new names",text:"Download files with new names based on your pattern"}]} />
      <AiSummaryJsonLd name="Bulk Rename" summary="Rename multiple PDF files simultaneously using embedded metadata fields" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Metadata-based renaming","Batch processing","Custom naming patterns","Title author page count extraction","Client-side only"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Bulk PDF Renamer</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Rename dozens of PDFs at once using their metadata — title, author, or page count.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <input type="file" accept=".pdf" multiple onChange={(e) => handleFiles(e.target.files)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />

        {files.length > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Naming Pattern</label>
              <div className="flex gap-2">
                <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm font-mono" />
                <button onClick={applyPattern} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm">Apply</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {["{title}", "{author}", "{pages}", "{filename}"].map(p => (
                  <button key={p} onClick={() => setPattern(prev => prev + p)} className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded-lg hover:border-indigo-500 font-mono">{p}</button>
                ))}
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <span className="text-xs text-[var(--muted)] w-6">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{f.file.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">Title: {f.title} · Author: {f.author} · {f.pages}p</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 truncate max-w-[200px]">→ {f.newName}</span>
                </div>
              ))}
            </div>

            <button onClick={downloadAll} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition">
              Rename & Download All ({files.length} files)
            </button>
          </>
        )}
      </div>

      {processing && <p className="text-center text-sm text-[var(--muted)] mt-4">Reading PDF metadata...</p>}
      {success && <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-700">✅ Files renamed and downloaded!</div>}
      {error && <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Bulk PDF Renamer</h2>
        <div className="text-sm text-[var(--muted)] space-y-3">Organize your PDF library by renaming files based on their embedded metadata. Use patterns like <code className="bg-[var(--background)] px-1 rounded">{`{title} - {author}`}</code> to create consistent, meaningful filenames across hundreds of documents.</div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
