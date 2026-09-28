import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/generate-pdf-certificates",
  title: "How to Generate PDF Certificates in Bulk Online Free",
  description: "Create professional PDF certificates in bulk from a customizable template and CSV data. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
