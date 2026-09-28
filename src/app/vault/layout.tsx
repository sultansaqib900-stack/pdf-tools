import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/vault",
  title: "Secure PDF Vault - Encrypted Document Storage",
  description: "Store PDFs securely in your browser with AES-encrypted vault. Password-protected local document storage.",
  // Private storage area — also Disallowed in robots.txt; noindex is belt and
  // braces for crawlers that ignore robots.txt.
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
