import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/edit-pdf",
  title: "Edit PDF Online Free — Add Text, Images & Annotations",
  description: "Edit PDF files online for free. Add text, images, highlights, and annotations right in your browser — no uploads, no signup, and no watermarks added.",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
