import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Vault — Encrypted Local Document Storage",
  description: "Store sensitive PDFs in an encrypted vault on your own device. Nothing is uploaded to any server. Free with PDFTools Premium.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
