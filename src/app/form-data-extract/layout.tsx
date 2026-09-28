import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/form-data-extract",
  title: "Extract PDF Form Data to CSV - Form Field Extractor",
  description: "Extract filled form field data from PDF documents to CSV. Batch export PDF form data to Excel. Premium.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
