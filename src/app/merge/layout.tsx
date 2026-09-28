import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/merge",
  title: "Merge PDF Online Free — Combine PDF Files",
  description: "Merge multiple PDF files into one document online for free. Drag, reorder, and combine PDFs instantly in your browser. No uploads required.",
  image: "https://allaboutpdfediting.xyz/merge/opengraph-image",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
