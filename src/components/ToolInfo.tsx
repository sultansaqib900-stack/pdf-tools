import Icon from "@/components/ui/Icon";

interface ToolInfoProps {
  name: string;
  description: string;
}

const ASSURANCES = [
  "Your files stay on your device",
  "No account needed",
  "Instant processing",
  "No file storage",
];

export default function ToolInfo({ description }: ToolInfoProps) {
  return (
    <div className="mb-6 p-5 surface-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="shield" size={17} className="text-[var(--accent)]" />
        <span className="text-[0.875rem] font-medium text-[var(--foreground)]">
          Private by design — nothing is uploaded
        </span>
      </div>
      <p className="text-[0.875rem] leading-relaxed text-[var(--muted-strong)] mb-3">
        {description}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {ASSURANCES.map((a) => (
          <li
            key={a}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-md)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[0.75rem] font-medium text-[var(--muted-strong)]"
          >
            <Icon name="check" size={12} strokeWidth={2.5} className="text-[var(--success)]" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
