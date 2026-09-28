import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/convert-image-to-pdf",
  title: "How to Convert Images to PDF Online Free — JPG, PNG to PDF",
  description: "Convert images to PDF online for free. Turn JPG, PNG, BMP and other image formats into PDF documents instantly in your browser. No uploads.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
