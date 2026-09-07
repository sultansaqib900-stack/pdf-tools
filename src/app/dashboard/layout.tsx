import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Dashboard — Usage & Premium Status | PDFTools",
  description: "View your PDFTools usage, recent tools and Premium subscription status. Manage your plan and check remaining limits in one place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
