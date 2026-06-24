import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to PDF Converter Online Free | PDFTools",
  description: "Convert plain text to PDF documents online for free. Type or paste text, add a title, and download a formatted PDF. No uploads, 100% free, all in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
