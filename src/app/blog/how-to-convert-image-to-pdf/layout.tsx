import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/how-to-convert-image-to-pdf",
  title: "How to Convert Images to PDF — JPG, PNG to PDF Online Free",
  description: "Learn how to convert images to PDF online free. Convert JPG, PNG, WebP images to PDF documents. No signup, no uploads. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
