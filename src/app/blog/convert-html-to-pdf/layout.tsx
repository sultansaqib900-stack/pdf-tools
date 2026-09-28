import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/convert-html-to-pdf",
  title: "How to Convert HTML to PDF Online Free — Webpage to PDF Converter",
  description: "Convert HTML to PDF online for free. Turn web pages, HTML code, or entire websites into PDF documents instantly in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
