import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/how-to-merge-pdf",
  title: "How to Merge PDFs Online Free — Combine Multiple PDFs Into One",
  description: "Learn how to merge PDF files online free. Combine multiple PDFs into one document in seconds. No signup, no uploads to servers.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
