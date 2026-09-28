import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/unlock",
  title: "Unlock PDF Online Free — Remove Password Protection",
  description: "Remove password protection from PDF files online for free. Decrypt PDF documents with the correct password. No uploads, 100% free, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
