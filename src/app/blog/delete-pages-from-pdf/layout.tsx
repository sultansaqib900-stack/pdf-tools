import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/delete-pages-from-pdf",
  title: "How to Delete Pages from a PDF Online Free (No Signup)",
  description: "Learn how to delete unwanted pages from a PDF document online for free. No signup, no uploads, all in your browser. Remove blank pages, covers, or sections in seconds.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
