import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PDFTools — Private, Browser-Based PDF Tools",
  description: "Learn who builds PDFTools and why every tool runs entirely in your browser. No uploads, no accounts, no tracking of your documents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
