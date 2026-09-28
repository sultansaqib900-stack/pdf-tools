import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-to-pdfa",
  title: "Convert PDF to PDF/A Online Free — Archive-Ready Format",
  description: "Convert PDF files to PDF/A for long-term archiving, free in your browser. Preserves fonts and layout for compliance-ready documents — no uploads required.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
