import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/add-qr-code-to-pdf",
  title: "How to Add QR Code to PDF Pages Online Free",
  description: "Add QR codes to every page of your PDF for document tracking and linking. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
