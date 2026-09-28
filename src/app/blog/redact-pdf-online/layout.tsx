import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/redact-pdf-online",
  title: "How to Redact PDF Online Free — Permanently Remove Sensitive Content",
  description: "Redact PDF documents online for free. Permanently remove sensitive text, images, and information from PDFs — all in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
