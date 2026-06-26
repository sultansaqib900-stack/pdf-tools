import { Skeleton } from "@/components/Skeleton";

export default function BlogLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <Skeleton className="h-10 w-72 mx-auto mb-4" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--card-border)] p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
