import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PII Guardian - 1-Click PDF Auto-Redaction Tool | PDFTools",
  description: "Automatically detect and redact Social Security Numbers, credit cards, bank accounts, emails, and phone numbers in PDF files with 100% client-side privacy.",
  openGraph: {
    title: "PII Guardian - 1-Click PDF Auto-Redaction Tool",
    description: "Scan and blackout sensitive data in PDF documents client-side.",
  },
};

export default function PiiGuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
