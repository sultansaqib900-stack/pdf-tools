"use client";

import { useEffect, useRef } from "react";

/** Compatibility hook for tool flows that once imposed an artificial wait. */
export default function FreeWaitTimer({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    doneRef.current();
  }, []);

  return null;
}
