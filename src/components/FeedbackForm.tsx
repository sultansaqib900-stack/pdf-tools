"use client";

import { useState, useId } from "react";

export default function FeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const nameId = useId();
  const roleId = useId();
  const textId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), text: text.trim(), rating }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        onSubmitted();
      } else {
        setError(data.error || "Failed to submit.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <span className="text-4xl block mb-3">&#10003;</span>
        <p className="font-semibold text-[var(--foreground)]">Thank you for your feedback!</p>
        <p className="text-sm text-[var(--muted)]">It helps others trust the platform.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Your Name *
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ahmad"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label htmlFor={roleId} className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Your Role (optional)
          </label>
          <input
            id={roleId}
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Student, Freelancer"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>
      <div>
        <label htmlFor={textId} className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Your Feedback *
        </label>
        <textarea
          id={textId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience using PDFTools..."
          rows={3}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition resize-none"
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Rating</span>
        <div className="flex gap-1" role="group" aria-label="Rating selection">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={star === rating}
              onClick={() => setRating(star)}
              className={`text-2xl transition p-1 ${star <= rating ? "text-amber-400" : "text-[var(--card-border)]"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !name.trim() || !text.trim()}
        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
