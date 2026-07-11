"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

function Detector({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  if (searchParams?.get("embed") === "1") return null;
  return <>{children}</>;
}

export default function EmbedModeDetector({ children }: { children: ReactNode }) {
  return <Suspense fallback={<>{children}</>}><Detector>{children}</Detector></Suspense>;
}
