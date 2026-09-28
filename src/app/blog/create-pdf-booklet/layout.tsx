import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/create-pdf-booklet",
  title: "How to Create a PDF Booklet for Printing Online Free",
  description: "Convert any PDF into a printable booklet with side-by-side pages. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
