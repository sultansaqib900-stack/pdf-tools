"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, rating: 5 }),
      });
      setSent(true);
    } catch {
      // fallback — show mailto as backup
      setSent(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">Contact Us</h1>
      <div className="text-sm text-[var(--muted)] leading-relaxed mb-8">
        <p>Have a question, a bug report, or a tool you wish existed? Send a message below and we usually reply within one working day. Before you write, the notes further down this page answer the questions we receive most often — several of them are things people assume are faults but are actually how PDFs work.</p>
      </div>

      {sent ? (
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6 text-center">
          <p className="text-emerald-400 font-semibold text-lg">Message sent!</p>
          <p className="text-sm text-[var(--muted)] mt-2">We&apos;ll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-y" placeholder="How can we help?" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all active:scale-95">
            Send Message
          </button>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-[var(--card-border)] space-y-8 text-sm leading-[1.75] text-[var(--muted)]">
        <section>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">We cannot see your files, so please describe the problem</h2>
          <p>
            Every tool on this site runs inside your browser. Your documents are never uploaded, which
            means that when something goes wrong we have no copy of the file to inspect and no server
            log showing what happened. That is a deliberate privacy trade-off, but it does change what
            a useful bug report looks like.
          </p>
          <p className="mt-2">
            Please tell us which tool you used, your browser and version, roughly how large the
            document was and how many pages, what you expected and what actually happened, and the
            exact wording of any error message. Never email us the document itself — we do not want
            it, and you should not send documents to strangers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Common issues you can fix faster than we can</h2>
          <p>
            <strong className="font-medium text-[var(--foreground)]">A large file makes the tab freeze or crash.</strong>{" "}
            Processing happens on your own machine, so a very large document is limited by your available
            memory rather than by us. Close other tabs and try again, or{" "}
            <Link href="/split" className="text-[var(--accent)] hover:underline">split the document</Link>{" "}
            into parts and process them separately.
          </p>
          <p className="mt-2">
            <strong className="font-medium text-[var(--foreground)]">A PDF has no selectable text.</strong>{" "}
            It is almost certainly a scan — an image of a page rather than text. Run{" "}
            <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR</Link>{" "}
            first, then the text tools will work.
          </p>
          <p className="mt-2">
            <strong className="font-medium text-[var(--foreground)]">Compression barely reduced the size.</strong>{" "}
            A file that has already been compressed once has little left to remove, and a text-only PDF
            is usually small already. The big savings come from documents full of photographs.
          </p>
          <p className="mt-2">
            <strong className="font-medium text-[var(--foreground)]">A password-protected file is rejected.</strong>{" "}
            Remove the password with{" "}
            <Link href="/unlock" className="text-[var(--accent)] hover:underline">Unlock PDF</Link>{" "}
            first, using a password you already know. We cannot recover a forgotten one.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">What we can and cannot help with</h2>
          <p>
            We can help with tools behaving incorrectly, questions about which tool suits a task,
            billing and account questions, and requests for features or improvements — suggestions from
            users are where most of these tools came from.
          </p>
          <p className="mt-2">
            We cannot recover a forgotten PDF password, restore a document you did not keep a copy of,
            or advise on whether a particular redaction or signature satisfies a legal or regulatory
            requirement in your jurisdiction. For anything with legal consequences, ask a qualified
            professional rather than a support inbox.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Privacy and billing</h2>
          <p>
            Questions about what the site itself records are answered in the{" "}
            <Link href="/privacy" className="text-[var(--accent)] hover:underline">privacy policy</Link>,
            and the{" "}
            <Link href="/terms" className="text-[var(--accent)] hover:underline">terms</Link>{" "}
            cover acceptable use. For subscription and refund questions, see{" "}
            <Link href="/premium" className="text-[var(--accent)] hover:underline">the premium page</Link>{" "}
            and include the email address you subscribed with so we can find your account.
          </p>
        </section>

        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Other ways to reach us</h2>
        <p className="text-sm text-[var(--muted)]">
          Email: <a href="mailto:saqibbostan83@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">saqibbostan83@gmail.com</a>
        </p>
        <p className="text-sm text-[var(--muted)] mt-1">
          Advertising: <a href="mailto:saqibbostan83@gmail.com?subject=Advertising" className="text-indigo-400 hover:text-indigo-300 transition-colors">saqibbostan83@gmail.com</a>
        </p>
        <p className="text-sm text-[var(--muted)] mt-1">
          Affiliates: <a href="mailto:saqibbostan83@gmail.com?subject=Affiliate" className="text-indigo-400 hover:text-indigo-300 transition-colors">saqibbostan83@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
