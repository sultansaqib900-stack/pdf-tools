import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/how-to-compress-pdf",
  title: "How to Compress a PDF — Reduce PDF File Size Online Free",
  description: "Learn how to compress PDF files online free. Reduce PDF size from 20MB to under 5MB with no quality loss. No signup, no uploads.",
  image: "https://allaboutpdfediting.xyz/blog/how-to-compress-pdf/opengraph-image",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
