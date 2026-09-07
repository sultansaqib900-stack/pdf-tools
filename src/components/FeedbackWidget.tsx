"use client";
import { useState, useRef, useEffect } from "react";
import { success, error } from "@/components/Toast";
import Icon from "@/components/ui/Icon";

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
        <div className="bg-[var(--surface)]/95 backdrop-blur-lg border border-[var(--border)] rounded-[var(--r-lg)] shadow-2xl p-4 w-72 animate-scaleIn origin-bottom-right">
          <h3 className="font-semibold text-sm text-[var(--foreground)] mb-3">Send Feedback</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent)] transition-all"
              required
            />
            <textarea
              placeholder="Tell us what you think..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent)] transition-all resize-none"
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
                      ? "text-[var(--premium)] scale-110"
                      : "text-[var(--muted)] hover:text-[var(--premium)]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all active:scale-95"
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-lg)] hover:bg-[var(--accent-hover)] transition-colors"
          title="Send feedback"
        >
          <Icon name="annotate" size={18} />
        </button>
      )}
    </div>
  );
}
