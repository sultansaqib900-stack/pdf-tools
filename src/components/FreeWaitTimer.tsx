"use client";

import { useState, useEffect } from "react";

export default function FreeWaitTimer({ onDone }: { onDone: () => void }) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(onDone, 100);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, onDone]);

  if (seconds <= 0) return null;

  return (
    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
      <p className="text-amber-800 dark:text-amber-300 font-semibold text-lg">{seconds}s</p>
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
        Free users wait {seconds}s before processing.{ " " }
        <a href="/premium" className="underline font-medium">Upgrade to skip the wait</a>
      </p>
    </div>
  );
}
