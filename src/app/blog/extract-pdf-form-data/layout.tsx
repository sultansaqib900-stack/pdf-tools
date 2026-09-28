import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/extract-pdf-form-data",
  title: "How to Extract PDF Form Data to CSV Online Free",
  description: "Extract form field data from PDF forms and export to CSV. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
