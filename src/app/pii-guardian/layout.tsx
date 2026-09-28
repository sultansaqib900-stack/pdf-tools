import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/pii-guardian",
  title: "PII Guardian - 1-Click PDF Auto-Redaction Tool",
  description: "Automatically detect and redact Social Security Numbers, credit cards, bank accounts, emails, and phone numbers in PDF files with 100% client-side privacy.",
});
export default function PiiGuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
