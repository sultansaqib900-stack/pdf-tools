"use client";

import { useState, useCallback, useEffect } from "react";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";
import { downloadBytes } from "@/lib/pdfBytes";

const rc = getRelatedContent("image-to-pdf");

export default function ImageToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { trackToolVisit("image-to-pdf"); }, []);

  const addImages = useCallback((list: FileList | null) => {
    if (!list) return;
    const selected = Array.from(list);
    const supported = selected.filter((f) => f.type === "image/jpeg" || f.type === "image/png");
    if (supported.length !== selected.length) {
      setError("Only JPEG and PNG images are supported. Unsupported files were skipped.");
    } else {
      setError(null);
    }
    for (const f of supported) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const newImages = supported.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
    setSuccess(false);
  }, [upsell]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const destination = index + direction;
      if (destination < 0 || destination >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }, []);

  const runConvert = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      for (const { file } of images) {
        const imgBytes = await file.arrayBuffer();
        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      downloadBytes(pdfBytes, "images.pdf");
      trackExport(images[0]?.file.name || "images.pdf", "Image to PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to convert images to PDF.");
    }
    setProcessing(false);
  }, [images]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
    }, [usage, upsell, runConvert])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Image to PDF - Free Online Converter"
        description="Combine JPEG and PNG images into a PDF, with one image per page, entirely in your browser."
        url="https://allaboutpdfediting.xyz/image-to-pdf"
      />
      <HowToJsonLd name="Convert Image to PDF" description="Combine JPEG and PNG images into a PDF document" steps={[{name:"Upload images",text:"Select one or more JPEG or PNG images"},{name:"Arrange order",text:"Use the arrow controls to set the PDF page order"},{name:"Download PDF",text:"Download your images combined into one PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Image to PDF", item: "https://allaboutpdfediting.xyz/image-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Image to PDF" summary="Combine JPEG and PNG images into a PDF with one page per image" category="Graphics" inputType="JPEG or PNG" outputType="PDF" processing="client-side" price="free" features={["JPEG and PNG conversion","Multi-image support","Order controls","Original pixel dimensions","Client-side only"]} limits="Each image up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Image to PDF</h1>
        <p className="text-[var(--muted)]">Combine JPEG and PNG images into a single PDF.</p>
      </div>

      <ToolInfo
        name="Image to PDF"
        description="Your images never leave your device. Conversion happens entirely in your browser — no uploads, no servers. Select images, preview them, and download your PDF in seconds."
      />


      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => addImages(e.target.files)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🖼️</span>
            <span className="text-indigo-500 font-medium hover:underline">
              Click to select images or drag & drop
            </span>
            <span className="text-xs text-[var(--muted)]">Supports JPG and PNG</span>
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={images.reduce((s, i) => s + i.file.size, 0)} label="Converting images to PDF..." />

        {images.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--muted)]">{images.length} image{images.length > 1 ? "s" : ""}</span>
              <button onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.preview)); setImages([]); }} className="text-red-500 hover:text-red-600 text-xs">Clear all</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-24 object-cover rounded-lg border border-[var(--card-border)]" />
                  <button onClick={() => removeImage(i)} aria-label={`Remove ${img.file.name}`} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition flex items-center justify-center">
                    x
                  </button>
                  <p className="text-[10px] text-[var(--muted)] truncate mt-1">{img.file.name}</p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button type="button" aria-label={`Move ${img.file.name} earlier`} disabled={i === 0} onClick={() => moveImage(i, -1)} className="text-[10px] border border-[var(--card-border)] rounded disabled:opacity-30">←</button>
                    <button type="button" aria-label={`Move ${img.file.name} later`} disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} className="text-[10px] border border-[var(--card-border)] rounded disabled:opacity-30">→</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={convert}
          disabled={images.length === 0 || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Converting...
            </span>
          ) : `Convert ${images.length} image${images.length !== 1 ? "s" : ""} to PDF`}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF created!" />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Image to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Combine JPEG photos and PNG screenshots into one PDF in a chosen order. Each supported image becomes a separate page using its original pixel dimensions; JPEG bytes are embedded directly and PNG transparency is handled by pdf-lib. Unsupported formats are rejected instead of being misread as JPEG. Everything runs locally in your browser with no server upload.</p>
        </div>
      </div>
      <RelatedContent slug="image-to-pdf" />

      <UseCaseLinks toolSlug="image-to-pdf" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
