"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("sign");

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
  const [hasSignature, setHasSignature] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackToolVisit("sign");
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
        setFile(f);
      }
    })();
  }, [trackToolVisit]);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    setHasSignature(true);
  };

  const stopDraw = () => setDrawing(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(rect.width, 1);
    const scaleY = canvas.height / Math.max(rect.height, 1);
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, [upsell]);

  const runSign = useCallback(async () => {
    if (!file) return;
    if (!hasSignature) {
      setError("Draw a signature before stamping the PDF.");
      return;
    }
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
      const { width } = lastPage.getSize();
      lastPage.drawImage(sigImage, {
        x: width / 2 - 75,
        y: 50,
        width: 150,
        height: 50,
      });

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      setResultBytes(outBytes);
      const blob = new Blob([outBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-${file.name}`;
      a.click();
      trackExport(file.name, "Sign PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to add signature.");
    }
    setProcessing(false);
  }, [file, hasSignature, usage, upsell, trackExport]);

  const sign = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSign();
  }, [usage, upsell, runSign]);

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
      <HowToJsonLd name="Sign PDF Online" description="Draw and stamp a signature at the bottom of the last PDF page" steps={[{name:"Draw signature",text:"Draw your signature with a mouse or touchscreen"},{name:"Upload PDF",text:"Select the PDF document to stamp"},{name:"Stamp and download",text:"Add the signature at the bottom center of the last page and download"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Sign PDF", item: "https://allaboutpdfediting.xyz/sign" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Sign PDF" summary="Draw a signature and stamp it at the bottom center of the PDF's last page" category="BusinessApplications" inputType="PDF plus drawn signature" outputType="PDF" processing="client-side" price="free" features={["Mouse drawing","Touchscreen drawing","Transparent PNG stamp","Last-page placement","Client-side processing"]} limits="Files up to 10MB" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">e-Sign PDF</h1>
        <p className="text-[var(--muted)]">Draw your signature and stamp it at the bottom center of the last page.</p>
      </div>

      <ToolInfo
        name="e-Sign PDF"
        description="Your files stay private. Drawing and signing happens entirely in your browser — no uploads, no servers. Draw your signature, select a PDF, and download the signed document."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Draw your signature</label>
          <div className="border border-[var(--card-border)] rounded-2xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              className="w-full h-auto cursor-crosshair touch-none block"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
          <button onClick={clearCanvas} className="mt-2 text-xs text-red-500 hover:text-red-600 font-bold">
            Clear signature
          </button>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
            <span className="text-4xl">📄</span>
            <span className="text-indigo-500 font-bold text-sm hover:underline">
              {file ? file.name : "Click to select a PDF"}
            </span>
            {file && <span className="text-xs text-emerald-600 font-semibold">✓ Ready to stamp signature on last page</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Supports any PDF up to 10MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Signing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSign(); }} />}

        {file && (
          <>
            <button
              onClick={sign}
              disabled={!hasSignature || processing || showTimer}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/20 active:scale-[0.99]"
            >
              {processing ? "Signing PDF..." : "⚡ Stamp Signature & Save PDF"}
            </button>

            {!isPremium() && (
              <p className="text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runSign} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF signed successfully!" onRestore={restoreOriginal} />

        {success && (
          <PipelineActionBar
            pdfBytes={resultBytes}
            filename={`signed-${file?.name || "document.pdf"}`}
            downloadUrl={downloadUrl}
            currentToolName="Sign PDF"
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About e-Sign PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add your signature to PDF documents digitally with our e-sign tool, designed for quick and secure document signing without printing or scanning. Draw your signature using your mouse or touchscreen, upload a PDF, and your signature is placed neatly on the last page. To sign PDF online free, simply draw in the signature pad, select your document, and download the signed file immediately. Everything runs entirely in your browser — drawing, embedding, and downloading — so your data never reaches a server. This is ideal for contracts, rental agreements, consent forms, approval workflows, and any document that requires a personal touch. Our e-sign PDF document tool gives you a simple, private way to sign.</p>
        </div>
      </div>
      <RelatedContent slug="sign" />

      <UseCaseLinks toolSlug="sign" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
