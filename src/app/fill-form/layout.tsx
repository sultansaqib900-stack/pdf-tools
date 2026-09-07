import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fill PDF Forms Free — Complete Forms Instantly",
  description: "Fill PDF forms online free. Complete text fields, checkboxes and dropdowns, then download the finished PDF. Private, no uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
