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
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

interface FieldEntry {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "list" | "radio" | "signature" | "button" | "unknown";
  options?: string[];
  value: string;
}

export default function FillFormPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FieldEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("fill-form"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setFields([]);

    setDetecting(true);
    try {
      const bytes = await f.arrayBuffer();
      pdfBytesRef.current = bytes;
      originalBytes.current = bytes;
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      if (!form) { setFields([]); setDetecting(false); return; }
      const rawFields = form.getFields();
      const detected: FieldEntry[] = [];
      for (const fld of rawFields) {
        let type: FieldEntry["type"] = "unknown";
        let options: string[] | undefined;
        if (fld instanceof PDFTextField) type = "text";
        else if (fld instanceof PDFCheckBox) type = "checkbox";
        else if (fld instanceof PDFDropdown) { type = "dropdown"; options = fld.getOptions(); }
        else if (fld instanceof PDFOptionList) { type = "list"; options = fld.getOptions(); }
        else if (fld instanceof PDFRadioGroup) { type = "radio"; options = fld.getOptions(); }
        else continue;
        detected.push({ name: fld.getName(), type, options, value: "" });
      }
      setFields(detected);
    } catch {
      setFields([]);
    }
    setDetecting(false);
  }, []);

  const updateField = useCallback((index: number, value: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  }, []);

  const runFill = useCallback(async () => {
    if (!file || !pdfBytesRef.current) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytesRef.current);
      const form = pdfDoc.getForm();
      if (!form) { setError("No form fields found in this PDF."); setProcessing(false); return; }
      const rawFields = form.getFields();
      for (const fld of rawFields) {
        const entry = fields.find((f) => f.name === fld.getName());
        if (!entry || !entry.value) continue;
        if (fld instanceof PDFTextField) {
          fld.setText(entry.value);
        } else if (fld instanceof PDFCheckBox) {
          if (entry.value === "checked") fld.check(); else fld.uncheck();
        } else if (fld instanceof PDFDropdown) {
          fld.select(entry.value);
        } else if (fld instanceof PDFOptionList) {
          fld.select([entry.value]);
        } else if (fld instanceof PDFRadioGroup) {
          fld.select(entry.value);
        }
      }
      form.flatten();
      const filledBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([filledBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filled-${file.name}`;
      a.click();
      trackExport(file.name, "Fill PDF Form", filledBytes.length);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to fill the form. The PDF may not contain fillable form fields.");
    }
    setProcessing(false);
  }, [file, fields]);

  const fill = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runFill();
  }, [runFill]);

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
        name="Fill PDF Form - Free Online Tool"
        description="Fill PDF forms online for free. Complete text fields checkboxes and dropdowns in your browser."
        url="https://allaboutpdfediting.xyz/fill-form"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Fill PDF Form</h1>
        <p className="text-[var(--muted)]">Detect and fill PDF form fields, then download the completed form.</p>
      </div>

      <ToolInfo
        name="Fill PDF Form"
        description="Your file stays private. All processing happens locally in your browser using pdf-lib — no uploads, no servers. We detect form fields automatically, let you fill them, and flatten the result."
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
            <span className="text-5xl">📋</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">PDF with fillable form fields</span>}
          </label>
        </div>

        {detecting && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Detecting form fields...
          </div>
        )}

        {fields.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-[var(--foreground)]">Form Fields</h3>
            {fields.map((field, i) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5 capitalize">
                  {field.name.replace(/_/g, " ")}
                  <span className="text-xs text-[var(--muted)] ml-2">({field.type})</span>
                </label>
                {field.type === "text" && (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(i, e.target.value)}
                    placeholder={`Enter ${field.name}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
                  />
                )}
                {field.type === "checkbox" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value === "checked"}
                      onChange={(e) => updateField(i, e.target.checked ? "checked" : "")}
                      className="w-5 h-5 rounded border-[var(--card-border)] text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-[var(--muted)]">{field.value === "checked" ? "Checked" : "Unchecked"}</span>
                  </label>
                )}
                {(field.type === "dropdown" || field.type === "list") && field.options && (
                  <select
                    value={field.value}
                    onChange={(e) => updateField(i, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">-- Select --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === "radio" && field.options && (
                  <div className="flex flex-wrap gap-4">
                    {field.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`radio-${field.name}`}
                          checked={field.value === opt}
                          onChange={() => updateField(i, opt)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-[var(--muted)]">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!detecting && fields.length === 0 && file && (
          <p className="mt-4 text-sm text-[var(--muted)] text-center">No fillable form fields detected in this PDF.</p>
        )}

        <ProgressBar processing={processing} fileSize={file?.size} label="Filling PDF form..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runFill(); }} />}

        {file && !detecting && (
          <>
            <button
              onClick={fill}
              disabled={processing || showTimer || fields.length === 0}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Filling Form...
                </span>
              ) : "Fill & Download"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runFill} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Form filled successfully!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Fill PDF Form</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Fill PDF forms online for free. This tool detects all form fields in your PDF — including text fields, checkboxes, dropdown menus, list boxes, and radio buttons — and displays them in an easy-to-use interface. Fill in the values, click submit, and download the completed form with fields permanently flattened.</p>
          <p>All processing happens in your browser using pdf-lib — no uploads, no servers, complete privacy. Your data never leaves your device.</p>
          <p>Keywords: fill PDF form online free, complete PDF forms, PDF form filler, fillable PDF, submit PDF form, flatten PDF form fields.</p>
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
