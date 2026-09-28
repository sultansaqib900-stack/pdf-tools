import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/batch",
  title: "Batch Process PDFs Online — Compress, Rotate, Protect & Watermark",
  description: "Process multiple PDFs at once. Compress, rotate, password protect, or add watermarks to PDF files in bulk. Premium feature. All in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
