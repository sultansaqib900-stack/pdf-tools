"use client";

import { useRouter } from "next/navigation";
import { setPipelineDocument } from "@/lib/pdfPipeline";
import { useState } from "react";

interface PipelineActionBarProps {
  pdfBytes?: Uint8Array | ArrayBuffer | Blob | null;
  filename?: string;
  downloadUrl?: string | null;
  currentToolName?: string;
}

export default function PipelineActionBar({
  pdfBytes,
  filename = "document.pdf",
  downloadUrl,
  currentToolName = "Tool",
}: PipelineActionBarProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleSendToTool = async (targetRoute: string) => {
    if (!pdfBytes) return;
    setNavigating(true);
    try {
      let bytesToSave: Uint8Array;
      if (pdfBytes instanceof Blob) {
        const ab = await pdfBytes.arrayBuffer();
        bytesToSave = new Uint8Array(ab);
      } else if (pdfBytes instanceof Uint8Array) {
        bytesToSave = pdfBytes;
      } else {
        bytesToSave = new Uint8Array(pdfBytes);
      }
      await setPipelineDocument(bytesToSave, filename);
      router.push(`${targetRoute}?fromPipeline=1`);
    } catch {
      router.push(targetRoute);
    } finally {
      setNavigating(false);
    }
  };

  if (!downloadUrl && !pdfBytes) return null;

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-indigo-950/40 via-[var(--card)] to-purple-950/30 border border-indigo-500/30 rounded-3xl shadow-2xl backdrop-blur-xl animate-scaleIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--card-border)]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">{currentToolName} Completed!</h3>
            <p className="text-xs text-[var(--muted)]">Ready to download or chain into your next PDF operation</p>
          </div>
        </div>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={filename}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:opacity-95 transition-all text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </a>
        )}
      </div>

      <div className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Chain Pipeline (No Re-Upload Needed)
          </p>
          <button
            onClick={() => handleSendToTool("/studio")}
            disabled={navigating}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 transition flex items-center gap-1"
          >
            ⚡ Open Full Studio →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSendToTool("/sign")}
            disabled={navigating}
            className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500 hover:bg-indigo-500/10 text-left transition-all group"
          >
            <span className="text-lg block mb-1">✍️</span>
            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition">Add Signature</p>
            <p className="text-[10px] text-[var(--muted)]">e-Sign current doc</p>
          </button>

          <button
            onClick={() => handleSendToTool("/compress")}
            disabled={navigating}
            className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500 hover:bg-indigo-500/10 text-left transition-all group"
          >
            <span className="text-lg block mb-1">🗜️</span>
            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition">Compress PDF</p>
            <p className="text-[10px] text-[var(--muted)]">Shrink file size</p>
          </button>

          <button
            onClick={() => handleSendToTool("/watermark")}
            disabled={navigating}
            className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500 hover:bg-indigo-500/10 text-left transition-all group"
          >
            <span className="text-lg block mb-1">💧</span>
            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition">Watermark</p>
            <p className="text-[10px] text-[var(--muted)]">Stamp copyright</p>
          </button>

          <button
            onClick={() => handleSendToTool("/protect")}
            disabled={navigating}
            className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500 hover:bg-indigo-500/10 text-left transition-all group"
          >
            <span className="text-lg block mb-1">🔒</span>
            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition">Protect PDF</p>
            <p className="text-[10px] text-[var(--muted)]">Encrypt with pass</p>
          </button>
        </div>
      </div>
    </div>
  );
}
