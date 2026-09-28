import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/metadata",
  title: "PDF Metadata Editor Online Free — Edit Title, Author & Keywords",
  description: "Edit PDF metadata online for free. Update title, author, subject, and keywords of any PDF document. No uploads, 100% free, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
