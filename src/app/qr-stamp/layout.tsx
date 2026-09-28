import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/qr-stamp",
  title: "Add QR Code to PDF - QR Code Stamping Tool",
  description: "Add QR codes and barcodes to any PDF page. Choose position, size, and data. Free browser-based stamping tool.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
