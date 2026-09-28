import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/crop-pdf-margins",
  title: "How to Crop PDF Margins Online Free",
  description: "Learn how to remove unwanted margins and whitespace from PDF pages online for free. No uploads, no signup, all in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
