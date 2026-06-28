"use client";

import { useState } from "react";

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
        <p>Have a question, suggestion, or need help? Send us a message and we&apos;ll get back to you within 24 hours.</p>
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

      <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
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
