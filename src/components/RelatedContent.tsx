import Link from "next/link";
import { getRelatedContent, type ToolRelatedContent } from "@/lib/related-content";

interface Props {
  slug: string;
}

function FlagshipWorkflowBanner() {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-[var(--card)] to-purple-950/30 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <h4 className="text-base font-extrabold text-[var(--foreground)]">
              Need Multi-Step Processing?
            </h4>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Combine delete pages, e-sign, PII auto-redaction, watermarks, and compression in one continuous session.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/studio"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20"
          >
            Launch Studio →
          </Link>
          <Link
            href="/recipes"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500 text-xs font-bold rounded-xl transition text-[var(--foreground)]"
          >
            1-Click Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}

function RelatedToolsSection({ data }: { data: ToolRelatedContent }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-[var(--foreground)]">Related PDF Tools</h3>
        <Link href="/tools" className="text-xs font-bold text-indigo-400 hover:underline">
          View All 40+ Tools →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {data.relatedTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-xl transition-all duration-200 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
                {tool.title}
              </p>
              <p className="text-[11px] text-[var(--muted)] line-clamp-1">{tool.description}</p>
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-[var(--foreground)]">Tutorials &amp; PDF Guides</h3>
        <Link href="/blog" className="text-xs font-bold text-amber-500 hover:underline">
          All Guides →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.relatedBlogs.map((blog) => (
          <Link
            key={blog.href}
            href={blog.href}
            className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] hover:border-amber-500/40 hover:shadow-lg transition-all duration-200 group"
          >
            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-400 transition-colors">
              {blog.title}
            </p>
            <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2">{blog.description}</p>
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
      <h3 className="text-xl font-extrabold text-[var(--foreground)] mb-4">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {data.faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer text-xs sm:text-sm font-bold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors list-none">
              {faq.question}
              <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
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
    <div className="max-w-4xl mx-auto mt-14 pt-8 border-t border-[var(--card-border)] space-y-10">
      <FlagshipWorkflowBanner />
      {data.relatedTools.length > 0 && <RelatedToolsSection data={data} />}
      {data.relatedBlogs.length > 0 && <RelatedBlogsSection data={data} />}
      <FaqSection data={data} />
    </div>
  );
}
