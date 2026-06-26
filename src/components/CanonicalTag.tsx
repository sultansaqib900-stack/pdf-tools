"use client";

import { usePathname } from "next/navigation";

export default function CanonicalTag() {
  const pathname = usePathname();
  const url = `https://allaboutpdfediting.xyz${pathname === "/" ? "" : pathname}`;
  return <link rel="canonical" href={url} />;
}