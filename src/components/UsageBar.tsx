"use client";

interface UsageBarProps {
  used?: number;
  remaining: number | null;
  limit?: number;
  unlimited?: boolean;
}

export default function UsageBar({ remaining, limit = 5, unlimited: isUnlimited }: UsageBarProps) {
  if (remaining === null && !isUnlimited) return null;

  if (isUnlimited) {
    return (
      <div className="text-sm text-[var(--success)] dark:text-[var(--success)]">
        <div className="flex items-center justify-between mb-1">
          <span>Daily usage</span>
          <span className="font-medium">Unlimited</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[var(--success)]" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  const used = limit - (remaining ?? limit);
  const pct = Math.round((used / limit) * 100);

  return (
    <div className="text-sm text-[var(--muted)]">
      <div className="flex items-center justify-between mb-1">
        <span>Daily usage</span>
        <span className={remaining === 0 ? "text-[var(--danger)] font-semibold" : ""}>
          {used}/{limit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            remaining === 0
              ? "bg-[var(--danger)]"
              : remaining! <= 2
                ? "bg-[var(--premium)]"
                : "bg-[var(--accent)]"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="mt-2 text-xs text-[var(--danger)]">
          Daily limit reached.{' '}
          <a href="/premium" className="underline font-medium">
            Upgrade to Premium
          </a>{' '}
          for unlimited usage.
        </p>
      )}
    </div>
  );
}
