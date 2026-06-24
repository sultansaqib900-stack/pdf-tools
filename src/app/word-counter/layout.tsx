import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Word Counter - Free Online Tool",
  description: "Count words, characters, and pages in any PDF file. Free online PDF word counter with reading time estimation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
