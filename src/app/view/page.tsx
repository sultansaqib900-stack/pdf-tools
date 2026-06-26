"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer/PdfViewer"), { ssr: false });

export default function ViewPage() {
  const [file, setFile] = useState<File | null>(null);

  if (file) {
    return <PdfViewer file={file} onClose={() => setFile(null)} />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="border-2 border-dashed border-[var(--card-border)] rounded-2xl p-12 bg-[var(--card)]">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">PDF Viewer</h1>
        <p className="text-[var(--muted)] mb-6">
          View, navigate, and annotate PDFs. Highlight text, add sticky notes, and draw freehand.
        </p>
        <label className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition cursor-pointer">
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
