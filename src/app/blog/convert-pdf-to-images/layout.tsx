import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/convert-pdf-to-images",
  title: "How to Convert PDF to Images Online Free — PDF to JPG/PNG",
  description: "Convert PDF pages to high-quality images online for free. Turn each PDF page into JPG or PNG images instantly in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
