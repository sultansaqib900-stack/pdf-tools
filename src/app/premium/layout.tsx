import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFTools Premium — Unlimited PDFs & 13 Pro Tools",
  description: "Upgrade for 100MB files, unlimited processing, batch mode, no ads and 13 exclusive tools. Monthly or yearly plans, cancel any time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
