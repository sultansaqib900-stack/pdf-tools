import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/merge-multiple-pdfs-into-one",
  title: "How to Merge Multiple PDFs Into One Document Online Free",
  description: "Learn how to combine multiple PDF files into a single document online for free. No uploads, no signup, no software installation required.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
