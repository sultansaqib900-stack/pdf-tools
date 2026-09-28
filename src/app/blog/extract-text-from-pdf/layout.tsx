import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/extract-text-from-pdf",
  title: "How to Extract Text from PDF Online Free — Copy Text Instantly",
  description: "Extract text from PDF files online for free. Copy text from scanned or digital PDFs instantly in your browser — no uploads, no signup.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
