import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/add-page-numbers-to-pdf",
  title: "How to Add Page Numbers to PDF Files Online Free (No Upload)",
  description: "Add page numbers to PDF documents online for free. Number pages from any starting position with custom formatting — all in your browser, no uploads.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
