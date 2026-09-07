import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Generator — Bulk PDF Certificates Free",
  description: "Generate hundreds of personalised PDF certificates from a template and CSV. Perfect for courses, events and training. Browser-based.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
