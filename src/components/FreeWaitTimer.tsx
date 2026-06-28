"use client";

import { useEffect, useRef } from "react";

export default function FreeWaitTimer({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const id = setTimeout(() => doneRef.current(), 2000);
    return () => clearTimeout(id);
  }, []);

  return null;
}
