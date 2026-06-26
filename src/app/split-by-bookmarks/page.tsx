"use client";

import { useState, useRef } from "react";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


export default function SplitByBookmarksPage() {
  usePageMeta("Split PDF by Bookmarks - Extract Chapters | PDFTools Premium", "Split PDF documents into separate files based on bookmarks and outline structure. Extract chapters, sections, and parts automatically. Premium feature.");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumBanner, setPremiumBanner] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [splits, setSplits] = useState<{ name: string; pageStart: number; pageEnd: number }[]>([]);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Split PDF by Bookmarks" description="Split PDF files into separate documents based on bookmarks. Premium feature." url="https://allaboutpdfediting.xyz/split-by-bookmarks" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 156 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📑</div>
          <h1 className="text-3xl font-bold mb-3">Split PDF by Bookmarks</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Extract chapters, sections, and parts from your PDF based on its bookmark structure.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can split PDFs by bookmarks</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  async function handleFile(f: File) {
    setFile(f);
    setError(null);
    setSplits([]);
    setDownloadUrls([]);
    setProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const outline = await pdf.getOutline();
      if (!outline || outline.length === 0) {
        setError("No bookmarks found in this PDF. The document must have an outline/bookmark structure.");
        setProcessing(false);
        return;
      }
      const bookmarks: { title: string; page: number }[] = [];
      async function walk(items: any[], depth = 0) {
        for (const item of items) {
          if (item.dest) {
            const dest = typeof item.dest === "string" ? await pdf.getDestination(item.dest) : item.dest;
            if (dest) {
              const pageIndex = await pdf.getPageIndex(dest[0]);
              bookmarks.push({ title: item.title, page: pageIndex + 1 });
            }
          }
          if (item.items?.length) await walk(item.items, depth + 1);
        }
      }
      await walk(outline);
      if (bookmarks.length === 0) {
        setError("Could not resolve bookmark page numbers. Try a different PDF.");
        setProcessing(false);
        return;
      }
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(bytes);
      const parts: { name: string; pageStart: number; pageEnd: number }[] = [];
      for (let i = 0; i < bookmarks.length; i++) {
        const start = bookmarks[i].page;
        const end = i + 1 < bookmarks.length ? bookmarks[i + 1].page - 1 : srcDoc.getPageCount();
        if (start <= end) {
          parts.push({ name: bookmarks[i].title.replace(/[<>:"/\\|?*]/g, "_").slice(0, 50), pageStart: start, pageEnd: end });
        }
      }
      setSplits(parts);
      const urls: string[] = [];
      for (const part of parts) {
        const newDoc = await PDFDocument.create();
        const indices = [];
        for (let i = part.pageStart; i <= part.pageEnd; i++) indices.push(i - 1);
        const copied = await newDoc.copyPages(srcDoc, indices);
        for (const p of copied) newDoc.addPage(p);
        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        urls.push(URL.createObjectURL(blob));
      }
      setDownloadUrls(urls);
    } catch {
      setError("Failed to process PDF. Try a different file.");
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") handleFile(f);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[{ name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Split by Bookmarks", item: "https://allaboutpdfediting.xyz/split-by-bookmarks" }]} />
      <HowToJsonLd name="Split PDF by Bookmarks" description="Split PDF documents into separate files based on bookmark structure" steps={[{name:"Upload PDF with bookmarks",text:"Upload a PDF that contains bookmarks or an outline structure"},{name:"Review detected bookmarks",text:"The tool shows all found bookmarks with their page numbers"},{name:"Download chapter files",text:"Each bookmark becomes a separate PDF file named after the bookmark title"}]} />
      <AiSummaryJsonLd name="Split by Bookmarks" summary="Split PDF files into separate documents by extracting chapters and sections from the bookmark outline" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Bookmark-based splitting","Chapter extraction","Outline parsing","Auto-naming","Client-side processing"]} limits="Premium subscribers" />
      <SoftwareAppJsonLd name="Split PDF by Bookmarks" description="Split PDF files into separate documents based on bookmark/outline structure." url="https://allaboutpdfediting.xyz/split-by-bookmarks" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 156 }} />
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Split PDF by Bookmarks</h1>
      <p className="text-[var(--muted)] mb-8">Extract chapters and sections based on the PDF&apos;s bookmark outline.</p>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-[var(--card-border)] hover:border-indigo-500/50"}`}
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-5xl mb-4">📑</div>
          <p className="font-medium text-[var(--foreground)] mb-1">Drop a PDF here or click to browse</p>
          <p className="text-sm text-[var(--muted)]">File must contain bookmarks (outline)</p>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : processing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[var(--muted)]">Reading bookmarks and splitting pages...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => { setFile(null); setError(null); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition">Try Another File</button>
        </div>
      ) : (
        <div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-6">
            <p className="text-sm text-[var(--foreground)] font-medium mb-3">
              Found {splits.length} bookmark(s) in &quot;{file?.name}&quot;:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {splits.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-[var(--background)] rounded-lg px-3 py-2 border border-[var(--card-border)]">
                  <span className="text-[var(--foreground)] truncate mr-4">{s.name}</span>
                  <span className="text-[var(--muted)] shrink-0">p. {s.pageStart}–{s.pageEnd}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {downloadUrls.map((url, i) => (
              <a key={i} href={url} download={`${splits[i]?.name || `chapter-${i + 1}`}.pdf`} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition">
                ⬇ {splits[i]?.name?.slice(0, 30) || `Part ${i + 1}`}
              </a>
            ))}
          </div>
          <button onClick={() => { setFile(null); setSplits([]); setDownloadUrls([]); }} className="mt-6 text-sm text-indigo-500 hover:underline">Start Over</button>
        </div>
      )}
    </div>
  );
}
