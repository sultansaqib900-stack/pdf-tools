"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

export default function ProtectPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => { trackToolVisit("protect"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, []);

  const runProtect = useCallback(async () => {
    if (!file || !password) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const protectedBytes = await pdfDoc.save({
        userPassword: password,
        ownerPassword: password,
      } as never);
      const blob = new Blob([protectedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `protected-${file.name}`;
      a.click();
      trackExport(file.name, "Password Protect", bytes.byteLength);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to protect PDF. The file may be corrupted.");
    }
    setProcessing(false);
  }, [file, password]);

  const protect = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runProtect();
  }, [runProtect]);

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
        name="Protect PDF - Free Online Tool"
        description="Password protect PDF files online for free. Encrypt your PDF documents with a secure password."
        url="https://allaboutpdfediting.xyz/protect"
      />
      <HowToJsonLd name="Password Protect PDF" description="Add password protection to encrypt PDF files" steps={[{name:"Upload PDF",text:"Select the PDF file to protect"},{name:"Set password",text:"Enter a strong password for encryption"},{name:"Download protected PDF",text:"Download your password-encrypted PDF document"}]} />
      <AiSummaryJsonLd name="Password Protect PDF" summary="Encrypt PDF files with password protection to prevent unauthorized access" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Password encryption","AES security","User password","Owner password","Client-side only"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Password Protect PDF</h1>
        <p className="text-[var(--muted)]">Encrypt your PDF with a password to prevent unauthorized access.</p>
      </div>

      <ToolInfo
        name="Password Protect"
        description="Your file stays private. Password encryption is applied locally in your browser using pdf-lib — no uploads, no servers. Set a password and download your protected PDF instantly."
      />

      <AdBanner className="mb-8" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🔒</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">PDF format only</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Protecting PDF..." />

        {file && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Enter Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to protect the PDF"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
            />
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runProtect(); }} />}

        {file && (
          <>
            <button
              onClick={protect}
              disabled={!password || processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Protecting PDF...
                </span>
              ) : "Protect PDF"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runProtect} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Password added!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Password Protect</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Secure your sensitive documents by adding a password with our protect tool, keeping your files safe from unauthorized access. To password protect PDF online free, upload your file, enter a strong password, and download the encrypted version instantly. The encryption is applied entirely in your browser using pdf-lib, so your document never leaves your device and no data is transmitted over the network. This is essential for protecting confidential business reports, personal financial documents, legal contracts, or any PDF that contains sensitive information. Once protected, the password must be entered to open the file, giving you full control over who can view it. Encrypt PDF file securely with our fully client-side tool — no data transmission, no server storage, complete privacy guaranteed.</p>
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
