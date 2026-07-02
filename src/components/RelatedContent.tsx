import Link from "next/link";
import { getRelatedContent, type ToolRelatedContent } from "@/lib/related-content";

interface Props {
  slug: string;
}

function RelatedToolsSection({ data }: { data: ToolRelatedContent }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Related Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.relatedTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/30 hover:shadow-md transition-all duration-200 group"
          >
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-indigo-500 transition-colors">
                {tool.title}
              </p>
              <p className="text-xs text-[var(--muted)]">{tool.description}</p>
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
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Related Articles</h3>
      <div className="space-y-3">
        {data.relatedBlogs.map((blog) => (
          <Link
            key={blog.href}
            href={blog.href}
            className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-amber-500/30 hover:shadow-md transition-all duration-200 group"
          >
            <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-amber-500 transition-colors">
              {blog.title}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">{blog.description}</p>
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
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {data.faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)] transition-colors list-none">
              {faq.question}
              <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 text-sm text-[var(--muted)] leading-relaxed">
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
    <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)] space-y-10">
      {data.relatedTools.length > 0 && <RelatedToolsSection data={data} />}
      {data.relatedBlogs.length > 0 && <RelatedBlogsSection data={data} />}
      <FaqSection data={data} />
    </div>
  );
}
