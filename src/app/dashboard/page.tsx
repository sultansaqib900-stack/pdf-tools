"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { listFiles, deleteFile, type StoredFile } from "@/lib/fileStore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    listFiles().then(setFiles);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><p className="text-[var(--muted)]">Loading...</p></div>;
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-[var(--muted)]">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-[var(--card-border)] rounded-xl text-sm text-[var(--muted)] hover:text-red-500 transition"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="border border-[var(--card-border)] rounded-xl p-5 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">{files.length}</p>
          <p className="text-sm text-[var(--muted)]">Saved Files</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">{user.premium ? "Premium" : "Free"}</p>
          <p className="text-sm text-[var(--muted)]">Plan</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5 bg-[var(--card)]">
          <p className="text-2xl font-bold text-[var(--foreground)]">42</p>
          <p className="text-sm text-[var(--muted)]">Tools Available</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Your Files</h2>
        {files.length === 0 ? (
          <div className="border border-dashed border-[var(--card-border)] rounded-xl p-10 text-center">
            <p className="text-[var(--muted)] mb-3">No files saved yet</p>
            <Link
              href="/tools"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              Browse Tools
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between border border-[var(--card-border)] rounded-xl px-4 py-3 bg-[var(--card)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {(file.size / 1024).toFixed(1)} KB — {new Date(file.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="ml-3 text-sm text-red-500 hover:text-red-600 shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
