import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/organize-pdf-pages",
  title: "How to Reorder and Organize PDF Pages Online Free",
  description: "Learn how to reorder and rearrange pages in a PDF document online for free. Drag and drop to organize your PDF pages. No uploads, no signup, all in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
