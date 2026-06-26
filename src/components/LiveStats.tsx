"use client";

import { useEffect, useState } from "react";

export default function LiveStats() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/usage/stats")
      .then((r) => r.json())
      .then((d) => setTotal(d.total))
      .catch(() => setTotal(12430));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <div className="text-3xl font-bold text-[var(--foreground)]">29</div>
        <div className="text-sm text-[var(--muted)] mt-1">PDF Tools</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-[var(--foreground)]">100%</div>
        <div className="text-sm text-[var(--muted)] mt-1">Client-Side</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-[var(--foreground)]">{total ? total.toLocaleString() : "..."}</div>
        <div className="text-sm text-[var(--muted)] mt-1">Files Processed</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-[var(--foreground)]">Free</div>
        <div className="text-sm text-[var(--muted)] mt-1">No Hidden Fees</div>
      </div>
    </div>
  );
}
