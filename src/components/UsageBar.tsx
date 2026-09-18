"use client";

interface UsageBarProps {
  used?: number;
  remaining: number | null;
  limit?: number;
  unlimited?: boolean;
  tier?: "basic" | "professional";
}

/**
 * Trial indicator for professional tools. Basic tools are unlimited and this
 * component simply states that; it is never rendered as a limiter for them.
 */
export default function UsageBar({
  remaining,
  limit = 5,
  unlimited: isUnlimited,
  tier = "professional",
}: UsageBarProps) {
  if (remaining === null && !isUnlimited) return null;

  if (isUnlimited) {
    return (
      <div className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
        <div className="flex items-center justify-between mb-1">
          <span>{tier === "basic" ? "Basic tools" : "Premium"}</span>
          <span className="font-medium">Unlimited</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  const used = limit - (remaining ?? limit);
  const pct = Math.round((used / limit) * 100);

  return (
    <div className="text-sm text-[var(--muted)]">
      <div className="flex items-center justify-between mb-1">
        <span>Free trial files (lifetime, shared)</span>
        <span className={remaining === 0 ? "text-red-500 font-semibold" : ""}>
          {used}/{limit}
        </span>
      </div>
      <div
        className="w-full h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.max(0, used)}
        aria-label="Free trial files used"
      >
        <div
          className={`h-full rounded-full transition-all ${
            remaining === 0
              ? "bg-red-500"
              : remaining! <= 2
                ? "bg-amber-500"
                : "bg-indigo-500"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs">
        Basic tools are free and unlimited. This allowance applies only to professional tools.
      </p>
      {remaining === 0 && (
        <p className="mt-2 text-xs text-red-500">
          Lifetime trial used up.{' '}
          <a href="/premium" className="underline font-medium">
            Upgrade to Premium
          </a>{' '}
          for unlimited professional tools.
        </p>
      )}
    </div>
  );
}
