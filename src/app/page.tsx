import ToolGrid from "@/components/ToolGrid";
import LiveStats from "@/components/LiveStats";
import EmailSubscribe from "@/components/EmailSubscribe";
import FeedbackSection from "@/components/FeedbackSection";
import RecentTools from "@/components/RecentTools";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-hero text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: "2s"}} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Free — No Signup Needed
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Free Online PDF Tools
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Compress, merge, split, convert, and edit PDFs instantly in your browser.
            No uploads — everything stays on your device. 100% private.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {["🔒 No Uploads Ever", "⚡ Instant Processing", "🌐 No Install", "💯 Free", "🖥️ 25+ Tools"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Your files never leave your device. 100% private, always.
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-6 mb-12">
        <ToolGrid />
      </section>

      <RecentTools />

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Why PDFTools?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "100% Free",
                desc: "No hidden fees or credit card required. All basic tools are completely free.",
                icon: "🎯",
              },
              {
                title: "Private & Secure",
                desc: "Files process in your browser. Never uploaded to any server. Zero data leaves your device.",
                icon: "🔒",
              },
              {
                title: "Fast Processing",
                desc: "Powered by WebAssembly. Large files process in seconds, not minutes.",
                icon: "⚡",
              },
              {
                title: "Works Everywhere",
                desc: "Compatible with Chrome, Firefox, Safari, and Edge on desktop and mobile.",
                icon: "🌍",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="border border-[var(--card-border)] rounded-xl p-8 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Privacy Matters</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">How It Works</h3>
              <ol className="space-y-3 text-sm text-[var(--muted)]">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                  <span>Select your PDF file from your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                  <span>Processing happens instantly in your browser using WebAssembly &mdash; no server involved</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                  <span>Download the result. Your original file is never stored or transmitted</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Why Trust Us</h3>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> No file uploads &mdash; everything runs client-side</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> No account or signup required</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Files never leave your device</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> No data collection or tracking of your documents</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Open-source libraries with audited security</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> No cookies required for PDF processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="border border-[var(--card-border)] rounded-xl p-8 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10 dark:to-transparent">
          <LiveStats />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <FeedbackSection />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Are my files uploaded to a server?",
                a: "No. All PDF processing happens entirely in your browser using WebAssembly. Your files never leave your device. We cannot access, store, or see your documents.",
              },
              {
                q: "Do I need to create an account?",
                a: "No account or signup required. All tools are free and work instantly without registration.",
              },
              {
                q: "What is the maximum file size?",
                a: "Free users can process files up to 10MB. Premium users get up to 100MB file support with faster processing.",
              },
              {
                q: "Is there a limit on how many files I can process?",
                a: "Free users can process one file at a time. Premium subscribers get batch processing with up to 20 files simultaneously.",
              },
              {
                q: "Which browsers are supported?",
                a: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
              },
              {
                q: "How is PDFTools free?",
                a: "We display non-intrusive ads to cover costs. Premium subscriptions remove ads and unlock advanced features for users who want an ad-free experience.",
              },
            ].map((faq) => (
              <details key={faq.q} className="group border border-[var(--card-border)] rounded-xl overflow-hidden">
                <summary className="px-5 py-3.5 font-medium text-sm text-[var(--foreground)] cursor-pointer hover:bg-[var(--background)] transition list-none flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--card-border)] pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Are my files uploaded to a server?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. All PDF processing happens entirely in your browser using WebAssembly. Your files never leave your device.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do I need to create an account?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No account or signup required. All tools are free and work instantly without registration.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the maximum file size?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Free users can process files up to 10MB. Premium users get up to 100MB file support with faster processing.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is there a limit on how many files I can process?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Free users can process one file at a time. Premium subscribers get batch processing with up to 20 files simultaneously.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Which browsers are supported?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is PDFTools free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We display non-intrusive ads to cover costs. Premium subscriptions remove ads and unlock advanced features.",
                  },
                },
              ],
            }),
          }}
        />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <EmailSubscribe />
      </section>
    </div>
  );
}
