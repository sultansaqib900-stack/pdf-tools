import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/contact",
  title: "Contact PDFTools Support",
  description: "Get in touch with the PDFTools team. Send questions, report a problem with a tool, or request a feature — we read every message and reply by email.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
