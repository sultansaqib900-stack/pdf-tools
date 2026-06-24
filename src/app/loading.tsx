export default function RootLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 text-[var(--muted)]">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span className="text-sm">Loading PDFTools...</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 w-full max-w-lg">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[var(--card)] border border-[var(--card-border)] rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
