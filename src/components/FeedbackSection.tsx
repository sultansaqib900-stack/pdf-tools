"use client";

import { useEffect, useState } from "react";
import FeedbackForm from "./FeedbackForm";

interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  date: string;
}

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch {
      setFeedback([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">What Users Say</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-indigo-500 hover:underline font-medium"
        >
          {showForm ? "Close form" : "Leave feedback"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-5 border border-[var(--card-border)] rounded-xl bg-[var(--background)]">
          <FeedbackForm onSubmitted={() => { setShowForm(false); fetchFeedback(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-[var(--muted)] text-sm">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Loading feedback...
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-10 text-[var(--muted)]">
          <p className="text-lg mb-2">No feedback yet</p>
          <p className="text-sm">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedback.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--background)]">
              <div className="flex mb-2 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < item.rating ? "" : "opacity-20"}>&#9733;</span>
                ))}
              </div>
              <p className="text-sm text-[var(--muted)] mb-3 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
              <div>
                <div className="font-semibold text-sm text-[var(--foreground)]">{item.name}</div>
                {item.role && <div className="text-xs text-[var(--muted)]">{item.role}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
