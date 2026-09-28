import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/extract-text",
  title: "Extract Text from PDF Online Free",
  description: "Extract text from PDF files online for free. Copy or download all text content as a TXT file. No uploads, no signup, 100% free.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
