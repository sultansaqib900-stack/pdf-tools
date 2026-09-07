import Link from "next/link";
import { getRelatedContent, type ToolRelatedContent } from "@/lib/related-content";
import Icon from "@/components/ui/Icon";

interface Props {
  slug: string;
}

function RelatedToolsSection({ data }: { data: ToolRelatedContent }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Related tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {data.relatedTools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="card-interactive group flex items-center gap-3 p-3.5">
            <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--r-md)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--muted-strong)] group-hover:bg-[var(--accent-subtle)] group-hover:border-[var(--accent-border)] group-hover:text-[var(--accent)] transition-colors">
              <Icon name={tool.icon} size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                {tool.title}
              </p>
              <p className="text-[0.75rem] text-[var(--muted)] truncate">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RelatedBlogsSection({ data }: { data: ToolRelatedContent }) {
  if (data.relatedBlogs.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Related articles</h3>
      <div className="space-y-2">
        {data.relatedBlogs.map((blog) => (
          <Link
            key={blog.href}
            href={blog.href}
            className="card-interactive group block p-3.5"
          >
            <p className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
              {blog.title}
            </p>
            <p className="mt-0.5 text-[0.75rem] text-[var(--muted)]">{blog.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ data }: { data: ToolRelatedContent }) {
  if (data.faqs.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Frequently asked questions</h3>
      <div className="space-y-1.5">
        {data.faqs.map((faq, i) => (
          <details
            key={i}
            className="group surface-card overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none text-[0.875rem] font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
              {faq.question}
              <Icon name="chevronDown" size={15} className="shrink-0 text-[var(--muted)] group-open:rotate-180 transition-transform duration-150" />
            </summary>
            <div className="px-4 pb-3.5 pt-0.5 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function RelatedContent({ slug }: Props) {
  const data = getRelatedContent(slug);
  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--border)] space-y-10">
      {data.relatedTools.length > 0 && <RelatedToolsSection data={data} />}
      {data.relatedBlogs.length > 0 && <RelatedBlogsSection data={data} />}
      <FaqSection data={data} />
    </div>
  );
}
