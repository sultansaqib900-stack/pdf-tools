"use client";

import { useState } from "react";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setSubmitting(true);

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
      setError("Newsletter signup is temporarily unavailable. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
      <h3 className="text-xl font-bold mb-2">Get New Tools & Updates</h3>
      <p className="text-sm text-white/80 mb-5 max-w-md mx-auto">
        Subscribe to know when we add new PDF tools. No spam, unsubscribe anytime.
      </p>
      {subscribed ? (
        <p className="text-emerald-200 font-medium">&#10003; Thanks! Check your inbox if confirmation is required.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-2.5 rounded-lg text-[var(--foreground)] text-sm outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg text-sm hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-200 mt-2">{error}</p>}
      <p className="text-xs text-white/50 mt-3">Newsletter delivery by Buttondown</p>
    </div>
  );
}
