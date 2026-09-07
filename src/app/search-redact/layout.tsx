import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search & Redact PDF — Auto-Remove Words Free",
  description: "Find every occurrence of a word or phrase across a PDF and redact it permanently. True content removal, not black boxes. Private.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
