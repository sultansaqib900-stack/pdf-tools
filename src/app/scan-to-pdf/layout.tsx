import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan to PDF Free — Photos to PDF Documents Online",
  description: "Turn phone photos and scans into clean multi-page PDFs. Free, private and browser-based with automatic page sizing. No uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
