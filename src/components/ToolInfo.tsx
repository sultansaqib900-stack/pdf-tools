import Link from "next/link";

interface ToolInfoProps {
  name: string;
  description: string;
  acceptedTypes?: string;
  maxSize?: string;
  isAiTool?: boolean;
}

export default function ToolInfo({
  name,
  description,
  acceptedTypes = "PDF (.pdf)",
  maxSize = "10MB Free · 100MB Premium",
  isAiTool,
}: ToolInfoProps) {
  const isAi = isAiTool || name.toLowerCase().includes("chat") || name.toLowerCase().includes("ocr");

  return (
    <div className="mb-6 p-4 sm:p-5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <h2 className="font-bold text-xs sm:text-sm text-[var(--foreground)] uppercase tracking-wider">
            {isAi ? "AI Analysis Notice" : "Local Browser Processing"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="px-2 py-0.5 rounded bg-[var(--card-border)]/60 font-medium">Limits: {maxSize}</span>
          <span className="px-2 py-0.5 rounded bg-[var(--card-border)]/60 font-medium">{acceptedTypes}</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-3">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
        {isAi ? (
          <>
            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
              Uses Google Gemini AI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--card-border)]/60 text-[var(--muted)] font-medium">
              Document text processed for Q&amp;A
            </span>
            <Link href="/privacy" className="text-[var(--accent)] hover:underline font-semibold ml-auto">
              Privacy Disclosures →
            </Link>
          </>
        ) : (
          <>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Processed in your browser
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--card-border)]/60 text-[var(--foreground)] font-medium">
              Zero server file uploads
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--card-border)]/60 text-[var(--foreground)] font-medium">
              No signup required
            </span>
            <Link href="/privacy" className="text-[var(--accent)] hover:underline font-semibold ml-auto">
              Privacy details →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
