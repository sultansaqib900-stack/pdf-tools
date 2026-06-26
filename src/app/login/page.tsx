"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const err = await login(email, password);
    setBusy(false);
    if (err) setError(err);
    else router.push("/dashboard");
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-indigo-500"
        />
        <input
          type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-indigo-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        No account? <Link href="/signup" className="text-indigo-500 hover:underline">Create one</Link>
      </p>
    </main>
  );
}
