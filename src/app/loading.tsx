export default function RootLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center gap-6">
      <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>
  );
}
