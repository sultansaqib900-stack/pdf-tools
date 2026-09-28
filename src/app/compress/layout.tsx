import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/compress",
  title: "Compress PDF Online Free — Reduce PDF File Size",
  description: "Compress PDF files online for free. Reduce PDF file size without losing quality. 100% free, no uploads, all processing happens in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
