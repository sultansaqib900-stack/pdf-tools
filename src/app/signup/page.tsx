"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setBusy(true);
    const err = await signup(email, password, name || undefined);
    setBusy(false);
    if (err) setError(err);
    else router.push("/dashboard");
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Name (optional)" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
        />
        <input
          type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
        />
        <input
          type="password" placeholder="Password (min 6 chars)" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
        />
        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] transition disabled:opacity-50"
        >
          {busy ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already have an account? <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
      </p>
    </main>
  );
}
