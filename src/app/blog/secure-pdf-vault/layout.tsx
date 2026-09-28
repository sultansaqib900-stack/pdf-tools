import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/secure-pdf-vault",
  title: "How to Store PDFs Securely Online Free — Encrypted Document Vault",
  description: "Store your PDF documents securely in an encrypted browser vault with password protection. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
