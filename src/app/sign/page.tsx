"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

export default function SignPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { trackToolVisit("sign"); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
  }, []);

  const runSign = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const sigDataUrl = canvas.toDataURL("image/png");
      const sigBytes = await fetch(sigDataUrl).then((r) => r.arrayBuffer());

      const pdfBytes = await file.arrayBuffer();
      originalBytes.current = pdfBytes;
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();
      lastPage.drawImage(sigImage, {
        x: width / 2 - 75,
        y: 50,
        width: 150,
        height: 50,
      });

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-${file.name}`;
      a.click();
      trackExport(file.name, "Sign PDF", pdfBytes.byteLength);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to add signature.");
    }
    setProcessing(false);
  }, [file]);

  const sign = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runSign();
  }, [runSign]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Sign PDF - Free Online e-Sign Tool"
        description="Sign PDF documents online for free. Draw your signature and add it to any PDF in your browser."
        url="https://allaboutpdfediting.xyz/sign"
      />
      <HowToJsonLd name="Sign PDF Online" description="Add electronic signatures to PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF document to sign"},{name:"Draw signature",text:"Draw type or upload your signature"},{name:"Place and download",text:"Position your signature and download the signed PDF"}]} />
      <AiSummaryJsonLd name="Sign PDF" summary="Add electronic signatures to PDF documents by drawing typing or uploading" category="BusinessApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Draw signature","Type signature","Upload signature","Position placement","Free e-sign tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">e-Sign PDF</h1>
        <p className="text-[var(--muted)]">Draw your signature and place it on your PDF document.</p>
      </div>

      <ToolInfo
        name="e-Sign PDF"
        description="Your files stay private. Drawing and signing happens entirely in your browser — no uploads, no servers. Draw your signature, select a PDF, and download the signed document."
      />

      <AdBanner className="mb-8" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Draw your signature</label>
          <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full border border-[var(--card-border)] rounded-xl cursor-crosshair touch-none"
            style={{ background: "#fff" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <button onClick={clearCanvas} className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium">
            Clear signature
          </button>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <span className="text-indigo-500 font-medium text-sm hover:underline">
              {file ? file.name : "Click to select a PDF"}
            </span>
            {file && <span className="text-xs text-[var(--muted)]">Signature will be placed on the last page</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Signing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSign(); }} />}

        {file && (
          <>
            <button
              onClick={sign}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing PDF...
                </span>
              ) : "Sign PDF"}
            </button>

            {!isPremium() && (
              <p className="text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runSign} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF signed!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About e-Sign PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add your signature to PDF documents digitally with our e-sign tool, designed for quick and secure document signing without printing or scanning. Draw your signature using your mouse or touchscreen, upload a PDF, and your signature is placed neatly on the last page. To sign PDF online free, simply draw in the signature pad, select your document, and download the signed file immediately. Everything runs entirely in your browser — drawing, embedding, and downloading — so your data never reaches a server. This is ideal for contracts, rental agreements, consent forms, approval workflows, and any document that requires a personal touch. Our e-sign PDF document tool gives you a simple, private way to sign.</p>
        </div>
      </div>
      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
