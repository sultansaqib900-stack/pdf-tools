import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/add-watermark-to-pdf",
  title: "How to Add Watermark to PDF Online Free — Text & Image Watermarks",
  description: "Add watermarks to PDF documents online for free. Apply text or image watermarks to protect your documents — no uploads, no signup.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
