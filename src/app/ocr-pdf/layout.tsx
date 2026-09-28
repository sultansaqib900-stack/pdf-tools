import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/ocr-pdf",
  title: "OCR PDF Online Free — Extract Text from Scanned PDF",
  description: "Run OCR on scanned PDFs and images to extract selectable text online for free. Recognizes printed text in your browser — no uploads and no signup required.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
