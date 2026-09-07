import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF Online Free — Scanned PDF to Searchable Text",
  description: "Turn scanned PDFs into searchable, selectable text with free browser-based OCR. Extract text from images and scans without uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
