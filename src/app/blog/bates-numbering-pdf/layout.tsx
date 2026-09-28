import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/bates-numbering-pdf",
  title: "How to Add Bates Numbering to PDF Documents — Sequential Page Labels",
  description: "Learn how to add Bates numbering, sequential page numbers, and custom labels to every page of a PDF. Perfect for legal documents and discovery.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
