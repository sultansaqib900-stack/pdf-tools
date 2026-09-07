import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PDF to Excel — Extract Tables from PDF Free",
  description: "Convert PDF to Excel online for free. Extract tables and data from PDF files into editable .xlsx spreadsheets instantly in your browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
