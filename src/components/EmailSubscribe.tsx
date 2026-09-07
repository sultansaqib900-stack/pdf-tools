"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        setError(data.error || "Failed to subscribe");
      }
    } catch {
      const existing = JSON.parse(localStorage.getItem("pdftools_subscribers") || "[]");
      existing.push({ email: email.trim(), date: new Date().toISOString() });
      localStorage.setItem("pdftools_subscribers", JSON.stringify(existing));
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="surface-card p-7 text-center">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Get new tools and updates</h3>
      <p className="mt-1.5 text-[0.875rem] text-[var(--muted)] max-w-md mx-auto">
        We&apos;ll email you when we ship a new PDF tool. No spam, unsubscribe anytime.
      </p>
      {subscribed ? (
        <p className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--success)]">
          <Icon name="check" size={15} />
          You&apos;re subscribed
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-label="Email address"
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary shrink-0">Subscribe</button>
        </form>
      )}
      {error && <p className="mt-2 text-[0.8125rem] text-[var(--danger)]">{error}</p>}
    </div>
  );
}
