import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bates Numbering PDF — Legal Page Numbering Online",
  description: "Add sequential Bates numbers to PDFs for legal discovery and exhibits. Custom prefixes, padding and placement, all in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
