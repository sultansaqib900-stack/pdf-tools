import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/remove-password-from-pdf",
  title: "How to Remove Password from PDF Files – Free Online Unlock Tool",
  description: "Learn how to remove password from PDF files online free. Unlock protected PDFs instantly in your browser with no uploads required.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
