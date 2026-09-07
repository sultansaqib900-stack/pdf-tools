import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Metadata Editor — Edit Title, Author & Keywords",
  description: "Edit PDF metadata online for free. Update title, author, subject, and keywords of any PDF document. No uploads, 100% free, all in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
