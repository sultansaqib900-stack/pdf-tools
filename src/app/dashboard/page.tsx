"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useToolHistory } from "@/hooks/useToolHistory";
import { listFiles, deleteFile, type StoredFile } from "@/lib/fileStore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const { exportHistory, clearHistory } = useToolHistory();
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    listFiles().then(setFiles);
    const stored = localStorage.getItem("dailyUsage");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUsageCount(typeof data.count === "number" ? data.count : 0);
      } catch { setUsageCount(0); }
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("dailyUsage");
      if (stored) {
        try { setUsageCount(JSON.parse(stored).count || 0); } catch { setUsageCount(0); }
      }
    };
    window.addEventListener("usageUpdate", handler);
    return () => window.removeEventListener("usageUpdate", handler);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><p className="text-[var(--muted)]">Loading...</p></div>;
  if (!user) return null;

  const isPremium = user.premium === true;
  const remaining = 5 - usageCount;

  const quickActions = [
    { href: "/compress", label: "Compress PDF" },
    { href: "/merge", label: "Merge PDFs" },
    { href: "/split", label: "Split PDF" },
    { href: "/image-to-pdf", label: "Image to PDF" },
    { href: "/protect", label: "Protect PDF" },
    { href: "/chat-pdf", label: "Chat with PDF" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <Link href="/premium" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl text-sm hover:from-amber-600 hover:to-orange-700 transition">Upgrade to Premium</Link>
          )}
          <button onClick={logout} className="px-4 py-2 border border-[var(--card-border)] rounded-xl text-sm text-[var(--muted)] hover:text-red-500 transition">Sign Out</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="border border-[var(--card-border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">{files.length}</p>
          <p className="text-xs text-[var(--muted)]">Saved Files</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-4 bg-[var(--card)]">
          <p className={`text-2xl font-bold ${isPremium ? "text-amber-500" : "text-[var(--foreground)]"}`}>{isPremium ? "Premium" : "Free"}</p>
          <p className="text-xs text-[var(--muted)]">Plan</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">48</p>
          <p className="text-xs text-[var(--muted)]">Tools Available</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">{exportHistory.length}</p>
          <p className="text-xs text-[var(--muted)]">Exports Today</p>
        </div>
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Free Plan — {remaining} of 5 uses remaining today</p>
            <p className="text-xs text-[var(--muted)]">Upgrade to Premium for unlimited processing, 100MB files, and 13 exclusive tools.</p>
          </div>
          <Link href="/premium" className="shrink-0 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl text-sm hover:from-amber-600 hover:to-orange-700 transition">Upgrade</Link>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="px-4 py-2 border border-[var(--card-border)] rounded-xl text-sm text-[var(--muted)] hover:text-indigo-500 hover:border-indigo-500/30 transition">{a.label}</Link>
          ))}
          <Link href="/tools" className="px-4 py-2 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">View All →</Link>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Recent Exports</h2>
          {exportHistory.length === 0 ? (
            <div className="border border-dashed border-[var(--card-border)] rounded-xl p-8 text-center">
              <p className="text-xs text-[var(--muted)]">No exports yet today. Process a PDF to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {exportHistory.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3 border border-[var(--card-border)] rounded-xl px-4 py-2.5 bg-[var(--card)]">
                  <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{e.fileName}</p>
                    <p className="text-xs text-[var(--muted)]">{e.tool}</p>
                  </div>
                </div>
              ))}
              {exportHistory.length > 5 && (
                <button onClick={clearHistory} className="text-xs text-red-500 hover:underline mt-2">Clear history</button>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Saved Files</h2>
          {files.length === 0 ? (
            <div className="border border-dashed border-[var(--card-border)] rounded-xl p-8 text-center">
              <p className="text-xs text-[var(--muted)] mb-2">No files saved yet</p>
              <Link href="/tools" className="text-sm text-indigo-500 hover:underline">Browse Tools</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between border border-[var(--card-border)] rounded-xl px-4 py-2.5 bg-[var(--card)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => handleDelete(file.id)} className="ml-3 text-xs text-red-500 hover:text-red-600 shrink-0">Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
