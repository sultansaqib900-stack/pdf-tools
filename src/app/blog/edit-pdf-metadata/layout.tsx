import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/edit-pdf-metadata",
  title: "How to Edit PDF Metadata Online Free — Title, Author & Keywords",
  description: "Learn how to edit PDF metadata like title, author, subject, and keywords online for free. Update document properties without uploading files anywhere.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
