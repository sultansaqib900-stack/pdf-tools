import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Guides & Tutorials — How to Edit PDFs | PDFTools",
  description: "Practical guides on compressing, merging, splitting, signing and converting PDFs. Step-by-step tutorials using free browser-based tools.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
