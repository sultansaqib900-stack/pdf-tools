interface ToolInfoProps {
  description: string;
}

export default function ToolInfo({ description }: ToolInfoProps) {
  return (
    <div className="mb-6 p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🔒</span>
        <span className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">
          100% Private — No Server Uploads
        </span>
      </div>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">Your files stay on your device</span>
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">No account needed</span>
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">Instant processing</span>
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">No file storage</span>
      </div>
    </div>
  );
}
