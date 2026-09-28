import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/html-to-pdf",
  title: "HTML to PDF Online Free — Convert HTML to PDF",
  description: "Convert HTML markup to PDF online for free. Paste your HTML code and generate a printable PDF document. No uploads, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
