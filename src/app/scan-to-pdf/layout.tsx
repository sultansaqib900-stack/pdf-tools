import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/scan-to-pdf",
  title: "Scan to PDF Online Free — Camera Document Scanner",
  description: "Scan documents with your camera and turn them into clean PDF files online for free. Capture, crop, and combine pages in your browser — files never leave your device.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
