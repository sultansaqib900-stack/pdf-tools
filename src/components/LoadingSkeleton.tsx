export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Drop zone skeleton */}
      <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--r-lg)] p-10 flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-[var(--border)] rounded-full" />
        <div className="h-4 w-48 bg-[var(--border)] rounded" />
        <div className="h-3 w-32 bg-[var(--border)] rounded" />
      </div>
      {/* Controls skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-[var(--border)] rounded-[var(--r-lg)]" />
        <div className="h-10 w-32 bg-[var(--border)] rounded-[var(--r-lg)]" />
      </div>
      {/* Output skeleton */}
      <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-4">
        <div className="h-4 w-40 bg-[var(--border)] rounded mb-3" />
        <div className="h-16 bg-[var(--border)] rounded" />
      </div>
    </div>
  );
}
