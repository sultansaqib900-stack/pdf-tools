import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/compress-pdf-without-losing-quality",
  title: "How to Compress a PDF Without Losing Quality (100% Free)",
  description: "Learn how to compress PDF files without losing quality. Free online tool, no uploads, no signup required. Reduce PDF size for email and web uploads.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
