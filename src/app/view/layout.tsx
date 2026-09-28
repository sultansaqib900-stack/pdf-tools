import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/view",
  title: "PDF Viewer",
  description: "View PDF files in your browser with the PDFTools viewer. Tool UI only — not indexed.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
