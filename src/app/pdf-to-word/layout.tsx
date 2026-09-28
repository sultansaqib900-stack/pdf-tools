import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-to-word",
  title: "PDF to Word Converter Online Free — Editable DOCX",
  description: "Convert PDF to Word (DOCX) online for free. Extract text and rebuild editable documents in your browser — no uploads, no signup, and no watermarks.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
