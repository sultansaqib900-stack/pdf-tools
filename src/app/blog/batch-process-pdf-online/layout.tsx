import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/batch-process-pdf-online",
  title: "How to Batch Process PDF Files Online Free — Edit Multiple PDFs at Once",
  description: "Batch process multiple PDF files online for free. Apply the same operation to many PDFs at once — compress, merge, convert or split in bulk.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
