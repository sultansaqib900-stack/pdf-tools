import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/word-to-pdf",
  title: "Word to PDF Converter Online Free — DOCX to PDF",
  description: "Convert Word documents (DOCX) to PDF online for free. Preserves formatting and layout in your browser — no uploads, no signup, and no watermarks added.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
