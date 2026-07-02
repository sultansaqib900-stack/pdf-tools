import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Free PDF Tools for Teachers — Worksheets, Certificates, Grading & More | PDFTools",
  description: "12 free PDF tools for teachers. Create worksheets, merge student submissions, compress files for email, generate certificates, and more. 100% browser-based, no uploads, no signup.",
  openGraph: {
    title: "Free PDF Tools for Teachers — Save Hours on Document Busywork",
    description: "Create worksheets, merge assignments, generate certificates, and compress files — all free, all in your browser.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-teachers",
  },
};

const teacherTools = [
  {
    category: "📝 Worksheets & Handouts",
    items: [
      { href: "/word-to-pdf", label: "Word to PDF", desc: "Convert lesson plans & worksheets to PDF" },
      { href: "/image-to-pdf", label: "Image to PDF", desc: "Turn photos of handwritten work into PDF" },
      { href: "/html-to-pdf", label: "HTML to PDF", desc: "Save web resources as printable PDFs" },
      { href: "/text-to-pdf", label: "Text to PDF", desc: "Create simple PDFs from plain text" },
    ],
  },
  {
    category: "📚 Grading & Student Work",
    items: [
      { href: "/merge", label: "Merge Student Submissions", desc: "Combine multiple assignments into one file", link: "/for/merge-pdf-teachers" },
      { href: "/compress", label: "Compress for Email", desc: "Shrink large portfolios before emailing", link: "/for/compress-pdf-teachers" },
      { href: "/split", label: "Split by Student", desc: "Separate a bulk scan into individual files", link: "/for/split-pdf-teachers" },
      { href: "/organize", label: "Reorder Pages", desc: "Rearrange pages after scanning" },
    ],
  },
  {
    category: "✍️ Classroom Communication",
    items: [
      { href: "/sign", label: "Sign Permission Forms", desc: "Add your signature to permission slips" },
      { href: "/protect", label: "Protect PDFs", desc: "Password-protect confidential reports" },
      { href: "/edit-pdf", label: "Edit PDF", desc: "Add feedback, highlight, annotate student work" },
      { href: "/redact", label: "Redact Student Names", desc: "Remove personal info before sharing samples" },
    ],
  },
];

export default function PDFToolsForTeachersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Tools for Teachers", item: "https://allaboutpdfediting.xyz/pdf-tools-for-teachers" },
        ]}
      />
      <FaqPageJsonLd
        questions={[
          { question: "Are your PDF tools really free for teachers?", answer: "Yes, completely free. No teacher email required, no trial, no credit card. All basic tools are free to use daily." },
          { question: "Can I create worksheets with your tools?", answer: "Yes. Use Word to PDF to convert lesson plans, or Image to PDF to turn hand-drawn worksheets into clean PDFs for distribution." },
          { question: "How do I merge student assignments?", answer: "Use our Merge PDF tool. Upload all student submissions, drag to reorder, and merge into a single file for easy grading." },
          { question: "Can I generate certificates for my students?", answer: "Yes, with our premium Certificate Generator. Upload a template PDF and a CSV of student names to bulk-generate personalized certificates." },
          { question: "Is student data safe?", answer: "All processing happens in your browser. Files never reach our servers. You can safely process sensitive student records." },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-semibold mb-4">
            🍎 100% Free for Teachers
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            Free PDF Tools for<br />
            <span className="text-green-500">Teachers & Educators</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Stop wrestling with document formats. Create worksheets, merge student submissions, compress
            files for email, and generate certificates — all in your browser, all free.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--muted)]">
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Signup</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Browser-Based</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Student Data Stays Local</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Student Email Needed</span>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { number: "12", label: "Free Tools", desc: "Worksheets, merge, compress, edit & more" },
            { number: "0", label: "Uploads", desc: "Processing happens in your browser" },
            { number: "⭐", label: "Certificate Generator", desc: "Premium — bulk-generate from CSV" },
            { number: "5/min", label: "Merge Speed", desc: "Combine 10+ files in seconds" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-center">
              <div className="text-2xl font-bold text-green-500">{s.number}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{s.label}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </section>

        {/* Tools by Category */}
        {teacherTools.map((cat) => (
          <section key={cat.category} className="mb-12">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">{cat.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.items.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-green-400/30 hover:shadow-md transition group"
                >
                  <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-green-500 transition-colors mb-1">{tool.label}</h3>
                  <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <AdBanner className="mb-12" />

        {/* Premium Spotlight: Certificate Generator */}
        <section className="mb-12 p-6 rounded-xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-950/10 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Certificate Generator</h2>
              <p className="text-xs text-amber-500 font-semibold">Premium Feature</p>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Upload a certificate template PDF and a CSV with student names, dates, and custom fields.
            Our tool generates personalized certificates for every student in seconds.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
              <span className="font-semibold text-[var(--foreground)]">1.</span> Upload your template
            </div>
            <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
              <span className="font-semibold text-[var(--foreground)]">2.</span> Upload student CSV
            </div>
            <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
              <span className="font-semibold text-[var(--foreground)]">3.</span> Map fields to template
            </div>
            <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
              <span className="font-semibold text-[var(--foreground)]">4.</span> Download all certificates
            </div>
          </div>
          <Link href="/certificate-generator" className="inline-block px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition text-sm">
            Try Certificate Generator →
          </Link>
        </section>

        {/* By Teaching Role */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">By Teaching Level</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Elementary School", desc: "Create worksheets, merge art projects, compress newsletters for parents", link: "/for/compress-pdf-teachers" },
              { title: "Middle & High School", desc: "Grade essays in merged PDFs, split test papers, protect student records", link: "/for/merge-pdf-teachers" },
              { title: "College & University", desc: "Compress lecture notes, merge research papers, generate certificates", link: "/for/compress-pdf-professors" },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="font-bold text-[var(--foreground)] mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] mb-3">{item.desc}</p>
                <Link href={item.link} className="text-xs text-green-500 font-medium hover:underline">See all {item.title.toLowerCase()} tools →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Teachers Choose PDFTools */}
        <section className="mb-12 p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why Teachers Use PDFTools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: "🔒", title: "FERPA Safe", desc: "Student data never leaves your computer. 100% local processing — no servers involved." },
              { emoji: "⚡", title: "No IT Approval Needed", desc: "Works in any browser. Nothing to install, nothing to request from IT." },
              { emoji: "🆓", title: "Always Free", desc: "No teacher email required, no trial, no hidden fees. Just free tools." },
              { emoji: "📱", title: "Works on School iPads", desc: "All tools work on any device — Chromebooks, iPads, Windows laptops." },
              { emoji: "⏱️", title: "Save Hours", desc: "Merge 30 student submissions in one click. Compress portfolios in seconds." },
              { emoji: "🎯", title: "Built for Educators", desc: "Every tool solves a real classroom problem, from worksheets to certificates." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{item.title}</h3>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Common Questions</h2>
          <div className="space-y-2">
            {[
              { q: "Is this FERPA compliant?", a: "Yes. All processing happens locally in your browser. No student data ever reaches our servers. You can confidently process grades, IEPs, and other confidential records." },
              { q: "Can I use this on a school Chromebook?", a: "Absolutely. All tools work in Chrome on any device. No installation required." },
              { q: "How many student files can I merge at once?", a: "Free tier supports up to 5 files. Premium supports unlimited files and larger uploads." },
              { q: "Can I generate report card comments?", a: "Use our Word to PDF tool to convert your report card comments into PDF format, or Chat with PDF to draft comments from student work samples." },
              { q: "Do you offer classroom/volume pricing?", a: "Our Premium plan covers unlimited usage. Contact us if you need school-wide or district-wide licensing." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm">
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-green-600 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Free for Teachers, Forever</h2>
          <p className="text-green-200 mb-6 max-w-lg mx-auto">No school email required. No trial. No hidden charges. Just free PDF tools that respect your students&apos; privacy.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition shadow-lg">
            Browse All PDF Tools →
          </Link>
        </section>
      </div>
    </>
  );
}
