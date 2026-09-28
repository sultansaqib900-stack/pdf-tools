import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/convert-pdf-to-excel",
  title: "How to Convert PDF to Excel Online Free — Extract Tables",
  description: "Convert PDF to Excel online for free. Extract tables and data from PDF files into editable Excel spreadsheets instantly in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
