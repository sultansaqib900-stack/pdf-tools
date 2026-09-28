import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/insert-blank-pages-pdf",
  title: "How to Insert Blank Pages into a PDF Online Free",
  description: "Add blank pages to PDF documents online for free. Insert empty pages at any position in your PDF — all in your browser, no signup.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
