import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to PDF/A — Convert for Archiving Free Online",
  description: "Convert PDFs to PDF/A format for long-term archiving and compliance. Free, browser-based, ISO-standard output with no uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
