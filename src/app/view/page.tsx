"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer/PdfViewer"), { ssr: false });

export default function ViewPage() {
  const [file, setFile] = useState<File | null>(null);

  if (file) {
    return <PdfViewer file={file} onClose={() => setFile(null)} />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--r-xl)] p-12 bg-[var(--surface)]">
        <div className="flex justify-center mb-4"><Icon name="fileText" size={36} className="text-[var(--muted)]" /></div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">PDF Viewer</h1>
        <p className="text-[var(--muted)] mb-6">
          View, navigate, and annotate PDFs. Highlight text, add sticky notes, and draw freehand.
        </p>
        <label className="inline-block px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] transition cursor-pointer">
          Select PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
        </label>
      </div>
    </main>
  );
}
