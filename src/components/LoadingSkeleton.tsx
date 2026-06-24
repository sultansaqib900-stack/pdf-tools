export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Drop zone skeleton */}
      <div className="border-2 border-dashed border-[var(--card-border)] rounded-xl p-10 flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-[var(--card-border)] rounded-full" />
        <div className="h-4 w-48 bg-[var(--card-border)] rounded" />
        <div className="h-3 w-32 bg-[var(--card-border)] rounded" />
      </div>
      {/* Controls skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-[var(--card-border)] rounded-xl" />
        <div className="h-10 w-32 bg-[var(--card-border)] rounded-xl" />
      </div>
      {/* Output skeleton */}
      <div className="border border-[var(--card-border)] rounded-xl p-4">
        <div className="h-4 w-40 bg-[var(--card-border)] rounded mb-3" />
        <div className="h-16 bg-[var(--card-border)] rounded" />
      </div>
    </div>
  );
}
