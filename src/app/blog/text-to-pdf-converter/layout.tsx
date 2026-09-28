import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/text-to-pdf-converter",
  title: "How to Convert Text to PDF Online Free",
  description: "Learn how to convert plain text to PDF documents online for free. No signup, no uploads. Create professional PDFs from text in seconds with our free tool.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
