"use client";
import { useState, useRef, useEffect } from "react";
import { success, error } from "@/components/Toast";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), text: text.trim(), role: "user", rating }),
      });
      const data = await res.json();
      if (data.ok) {
        success("Thanks for your feedback!");
        setName("");
        setText("");
        setRating(5);
        setOpen(false);
      } else {
        error(data.error || "Failed to submit");
      }
    } catch {
      error("Failed to submit feedback");
    } finally {
      setSending(false);
    }
  }

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-[var(--card)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-2xl p-4 w-72 animate-scaleIn origin-bottom-right">
          <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Send Feedback</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
            />
            <textarea
              placeholder="Tell us what you think..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              required
            />
            <div className="flex gap-1">
              {stars.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`text-lg transition-all duration-150 ${
                    (hoverRating || rating) >= s
                      ? "text-amber-400 scale-110"
                      : "text-[var(--muted)] hover:text-amber-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-110 transition-all active:scale-90 flex items-center justify-center text-lg animate-glowPulse"
          title="Send feedback"
        >
          💬
        </button>
      )}
    </div>
  );
}
