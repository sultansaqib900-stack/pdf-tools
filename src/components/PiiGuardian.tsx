"use client";

import { useState, useCallback, useEffect } from "react";
import { scanPdfForPii, redactSelectedPii, type PiiMatch, type PiiType } from "@/lib/piiScanner";
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";

interface PiiGuardianProps {
  initialFile?: File | null;
  onRedactionComplete?: (newBytes: Uint8Array, fileName: string) => void;
}

export default function PiiGuardian({ initialFile, onRedactionComplete }: PiiGuardianProps) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [scanning, setScanning] = useState(false);
  const [redacting, setRedacting] = useState(false);
  const [matches, setMatches] = useState<PiiMatch[]>([]);
  const [scanned, setScanned] = useState(false);
  const [customKeywords, setCustomKeywords] = useState("");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialFile) {
      (async () => {
        const pipelineDoc = await getPipelineDocument();
        if (pipelineDoc && pipelineDoc.bytes) {
          const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
          setFile(f);
        }
      })();
    }
  }, [initialFile]);

  const handleScan = useCallback(async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setScanned(false);
    setMatches([]);
    setSuccessMessage(null);

    try {
      const bytes = await file.arrayBuffer();
      const customTermsList = customKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const activeTypes: PiiType[] = ["ssn", "creditCard", "email", "phone", "currency", "iban", "ipAddress"];
      const result = await scanPdfForPii(bytes, activeTypes, customTermsList);

      setMatches(result.matches);
      setScanned(true);
    } catch {
      setError("Failed to scan document. The PDF might be password protected or damaged.");
    } finally {
      setScanning(false);
    }
  }, [file, customKeywords]);

  const toggleMatch = (id: string) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)));
  };

  const toggleSelectAll = (select: boolean) => {
    setMatches((prev) => prev.map((m) => ({ ...m, selected: select })));
  };

  const handleRedact = async () => {
    if (!file || matches.length === 0) return;
    const selected = matches.filter((m) => m.selected);
    if (selected.length === 0) {
      setError("No items selected for redaction.");
      return;
    }

    setRedacting(true);
    setError(null);

    try {
      const bytes = await file.arrayBuffer();
      const outputBytes = await redactSelectedPii(bytes, selected);
      setResultBytes(outputBytes);

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const outName = `pii-redacted-${file.name}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = outName;
      a.click();

      setSuccessMessage(`Successfully redacted ${selected.length} sensitive items permanently.`);
      onRedactionComplete?.(outputBytes, outName);
    } catch {
      setError("Failed to apply redactions to the PDF.");
    } finally {
      setRedacting(false);
    }
  };

  const selectedCount = matches.filter((m) => m.selected).length;

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-[var(--card-border)] rounded-3xl p-8 bg-[var(--card)]/50 backdrop-blur-sm text-center">
        <input
          type="file"
          accept=".pdf"
          id="piiFileInput"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              setScanned(false);
              setMatches([]);
              setResultBytes(null);
            }
          }}
        />
        <label htmlFor="piiFileInput" className="cursor-pointer flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center text-3xl shadow-inner">
            🛡️
          </div>
          <div>
            <span className="text-base font-bold text-indigo-400 hover:text-indigo-300 transition">
              {file ? file.name : "Choose a PDF or drag & drop"}
            </span>
            <p className="text-xs text-[var(--muted)] mt-1">
              {file
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · 100% Client-Side Privacy`
                : "Automatic detection for SSNs, Credit Cards, IBANs, Emails, and Phone Numbers"}
            </p>
          </div>
        </label>
      </div>

      {/* Custom Keyword Scanner Input */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>🔍</span> Optional Custom Keywords to Target
          </label>
          <span className="text-[10px] text-[var(--muted)]">Comma separated</span>
        </div>
        <input
          type="text"
          value={customKeywords}
          onChange={(e) => setCustomKeywords(e.target.value)}
          placeholder="e.g. John Doe, Project Falcon, Internal Confidential, Salary"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Action Button */}
      {file && !scanned && (
        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-base active:scale-[0.99]"
        >
          {scanning ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Deep Scanning Document for PII &amp; Secrets...
            </>
          ) : (
            <>⚡ 1-Click Scan for PII (Zero Server Upload)</>
          )}
        </button>
      )}

      {/* Scan Results Panel */}
      {scanned && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-lg font-extrabold text-[var(--foreground)]">
                  Found {matches.length} Sensitive {matches.length === 1 ? "Item" : "Items"}
                </h3>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Review below and select which items to permanently black out.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSelectAll(true)}
                className="px-3 py-1.5 rounded-xl border border-[var(--card-border)] text-xs font-semibold hover:bg-[var(--background)] transition text-[var(--foreground)]"
              >
                Select All
              </button>
              <button
                onClick={() => toggleSelectAll(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--card-border)] text-xs font-semibold hover:bg-[var(--background)] transition text-[var(--muted)]"
              >
                Deselect All
              </button>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted)]">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-base font-bold text-emerald-400">No PII Found!</p>
              <p className="text-xs mt-1">This document does not appear to contain standard SSNs, credit cards, or emails.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => toggleMatch(match.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    match.selected
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-[var(--card-border)] bg-[var(--background)] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={match.selected}
                      onChange={() => toggleMatch(match.id)}
                      className="w-4 h-4 rounded accent-red-600 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--foreground)] font-mono">
                          {match.maskedValue}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {match.typeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Page {match.pageIndex + 1}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-red-400">
                    {match.selected ? "Will Redact ⬛" : "Keep"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {matches.length > 0 && (
            <button
              onClick={handleRedact}
              disabled={redacting || selectedCount === 0}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all shadow-xl shadow-red-500/25 text-base flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {redacting ? (
                <>Burning Blackout Rectangles into PDF Stream...</>
              ) : (
                <>⬛ Burn Permanent Blackouts ({selectedCount} Selected)</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Success Notification & Pipeline Action Bar */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
          <p className="text-sm font-bold text-emerald-400">✅ {successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center text-xs text-red-400">
          {error}
        </div>
      )}

      {resultBytes && (
        <PipelineActionBar
          pdfBytes={resultBytes}
          filename={`pii-redacted-${file?.name || "document.pdf"}`}
          downloadUrl={downloadUrl}
          currentToolName="PII Guardian"
        />
      )}
    </div>
  );
}
