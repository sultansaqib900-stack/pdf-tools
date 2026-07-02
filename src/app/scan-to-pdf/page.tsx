"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("scan-to-pdf");

export default function ScanToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [flash, setFlash] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("scan-to-pdf"); }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCaptured((prev) => [...prev, dataUrl]);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  }, []);

  const removeCapture = useCallback((index: number) => {
    setCaptured((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const runConvert = useCallback(async () => {
    if (captured.length === 0) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      for (const dataUrl of captured) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const imgBytes = await blob.arrayBuffer();
        if (!originalBytes.current) originalBytes.current = imgBytes;
        const image = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scanned-document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport("scanned-document.pdf", "Scan to PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to create PDF.");
    }
    setProcessing(false);
  }, [captured]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
    }, [usage, upsell, runConvert])

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "original-scanned-document.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Scan to PDF - Free Online Scanner"
        description="Scan documents using your camera and convert to PDF instantly."
        url="https://allaboutpdfediting.xyz/scan-to-pdf"
      />
      <HowToJsonLd name="Scan to PDF" description="Scan documents with camera and convert to PDF" steps={[{name:"Open camera",text:"Allow camera access to start scanning"},{name:"Capture pages",text:"Take photos of each page you want to scan"},{name:"Download PDF",text:"Download all captured pages as a single PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Scan to PDF", item: "https://allaboutpdfediting.xyz/scan-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Scan to PDF" summary="Use your device camera to scan documents and convert them to PDF instantly" category="Scanner" inputType="Camera" outputType="PDF" processing="client-side" price="free" features={["Camera scanning","Multi-page capture","Instant PDF conversion","Free online tool","Client-side only"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Scan to PDF</h1>
        <p className="text-[var(--muted)]">Use your camera to scan documents and convert them to PDF instantly.</p>
      </div>

      <ToolInfo
        name="Scan to PDF"
        description="Your documents never leave your device. Scanning happens entirely in your browser — no uploads, no servers. Capture pages with your camera and download your PDF in seconds."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {!cameraActive ? (
          <div className="text-center py-10">
            <span className="text-5xl block mb-4">📷</span>
            <p className="text-[var(--muted)] mb-4">Open your camera to start scanning documents</p>
            <button
              onClick={startCamera}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              Open Camera
            </button>
          </div>
        ) : (
          <div className={`relative rounded-xl overflow-hidden bg-black ${flash ? "opacity-90" : ""}`}>
            <video ref={videoRef} autoPlay playsInline className="w-full max-h-96 object-contain" />
            <div className="absolute inset-0 border-2 border-dashed border-white/30 m-4 rounded-lg pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={capture}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
              >
                <div className="w-10 h-10 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {captured.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--muted)]">{captured.length} page{captured.length > 1 ? "s" : ""} captured</span>
              <button onClick={() => setCaptured([])} className="text-red-500 hover:text-red-600 text-xs">Clear all</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {captured.map((dataUrl, i) => (
                <div key={i} className="relative group">
                  <img src={dataUrl} alt="" className="w-full h-24 object-cover rounded-lg border border-[var(--card-border)]" />
                  <button onClick={() => removeCapture(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    x
                  </button>
                  <p className="text-[10px] text-[var(--muted)] text-center mt-1">Page {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <ProgressBar processing={processing} fileSize={0} label="Creating PDF from captured pages..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={convert}
          disabled={captured.length === 0 || processing || showTimer}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Creating PDF...
            </span>
          ) : `Convert ${captured.length} page${captured.length !== 1 ? "s" : ""} to PDF`}
        </button>

        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users limited to 10 pages.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for unlimited pages, batch & no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF created!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Scan to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Turn your device camera into a portable document scanner with Scan to PDF. Capture receipts, contracts, handwritten notes, whiteboards, or any physical document and convert them instantly to PDF — all within your browser with zero uploads.</p>
          <p>Each capture becomes a separate PDF page. Position your document within the on-screen guide, tap capture, and repeat for multi-page documents. Perfect for digitizing paperwork on the go — no scanner hardware or mobile app needed.</p>
        </div>
      </div>
      <RelatedContent slug="scan-to-pdf" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
