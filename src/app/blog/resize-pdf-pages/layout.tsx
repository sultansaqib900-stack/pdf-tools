import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/resize-pdf-pages",
  title: "How to Resize PDF Pages Online Free — Change to A4, Letter & More",
  description: "Learn how to resize PDF pages online for free. Change page size to A4, Letter, Legal, or custom dimensions. No uploads, no signup, all in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
