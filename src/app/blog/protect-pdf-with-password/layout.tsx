import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/protect-pdf-with-password",
  title: "How to Password Protect a PDF Online Free — Secure Your Documents",
  description: "Password protect PDF files online for free. Encrypt your PDF documents with a strong password to prevent unauthorized access — no uploads.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
