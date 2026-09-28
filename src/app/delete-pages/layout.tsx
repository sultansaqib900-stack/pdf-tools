import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/delete-pages",
  title: "Delete Pages from PDF Online Free",
  description: "Remove unwanted pages from PDF files online for free. Select which pages to keep and delete the rest. No uploads, 100% free, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
