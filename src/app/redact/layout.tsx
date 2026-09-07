import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Redact PDF Free — Permanently Remove Sensitive Text",
  description: "Redact PDF documents online for free. Permanently remove sensitive text, images, and information from PDFs — all in your browser, no uploads.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
