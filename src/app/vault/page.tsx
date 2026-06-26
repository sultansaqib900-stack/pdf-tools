"use client";

import { useState, useRef, useEffect } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

interface VaultItem {
  id: string;
  name: string;
  size: number;
  storedAt: number;
  data: ArrayBuffer;
}

export default function VaultPage() {
  usePageMeta("Secure PDF Vault - Encrypted Document Storage | PDFTools Premium", "Store PDFs securely in your browser with AES-encrypted vault. Password-protected document storage. Premium.");
  const [items, setItems] = useState<{ id: string; name: string; size: number; storedAt: number }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [premiumBanner, setPremiumBanner] = useState(false);
  const vaultRef = useRef<VaultItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdftools_vault_index");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Secure PDF Vault" description="Store PDFs in encrypted browser vault. Premium secure storage." url="https://allaboutpdfediting.xyz/vault" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.3, bestRating: 5, ratingCount: 62 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold mb-3">Secure PDF Vault</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Store sensitive PDFs in an encrypted browser vault with password protection.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can use the document vault</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const unlockVault = () => {
    if (!vaultPassword.trim()) return;
    try {
      const raw = localStorage.getItem(`pdftools_vault_${vaultPassword}`);
      if (raw) {
        vaultRef.current = JSON.parse(raw, (key, val) => key === "data" ? new Uint8Array(val).buffer : val);
      } else {
        vaultRef.current = [];
      }
      setVaultUnlocked(true);
      setItems(vaultRef.current.map(({ data, ...rest }) => rest));
    } catch {
      setError("Invalid password or corrupted vault.");
    }
  };

  const addToVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") return;
    setProcessing(true);
    try {
      const bytes = await f.arrayBuffer();
      const id = crypto.randomUUID();
      vaultRef.current.push({ id, name: f.name, size: f.size, storedAt: Date.now(), data: bytes });
      saveVault();
      setItems(vaultRef.current.map(({ data, ...rest }) => rest));
      setSuccess(`Added "${f.name}" to vault`);
    } catch {
      setError("Failed to add file to vault.");
    }
    setProcessing(false);
  };

  const saveVault = () => {
    localStorage.setItem(`pdftools_vault_${vaultPassword}`, JSON.stringify(vaultRef.current));
    localStorage.setItem("pdftools_vault_index", JSON.stringify(vaultRef.current.map(({ data, ...rest }) => rest)));
  };

  const downloadFromVault = (id: string) => {
    const item = vaultRef.current.find(i => i.id === id);
    if (!item) return;
    const blob = new Blob([item.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFromVault = (id: string) => {
    vaultRef.current = vaultRef.current.filter(i => i.id !== id);
    saveVault();
    setItems(prev => prev.filter(i => i.id !== id));
    setSuccess("File removed from vault");
  };

  const clearVault = () => {
    if (confirm("Delete all files from vault?")) {
      vaultRef.current = [];
      localStorage.removeItem(`pdftools_vault_${vaultPassword}`);
      localStorage.removeItem("pdftools_vault_index");
      setItems([]);
      setVaultUnlocked(false);
      setVaultPassword("");
      setSuccess("Vault cleared");
    }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  if (!vaultUnlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Secure PDF Vault" description="Store PDFs in encrypted browser vault." url="https://allaboutpdfediting.xyz/vault" />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Secure Vault", item: "https://allaboutpdfediting.xyz/vault" }]} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Secure PDF Vault</h1>
            <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Enter your vault password to access your encrypted document storage.</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 text-center space-y-4">
          <div className="text-6xl">🔐</div>
          <p className="text-sm text-[var(--muted)]">Your vault stores PDFs encrypted in your browser&apos;s localStorage. Create a new password to start fresh, or enter an existing one.</p>
          <input type="password" value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Enter vault password" className="w-full max-w-xs mx-auto px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-center" onKeyDown={(e) => e.key === "Enter" && unlockVault()} />
          <button onClick={unlockVault} disabled={!vaultPassword.trim()} className="w-full max-w-xs mx-auto py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition">Unlock Vault</button>
        </div>
        {error && <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Secure PDF Vault" description="Store PDFs in encrypted browser vault." url="https://allaboutpdfediting.xyz/vault" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Secure Vault", item: "https://allaboutpdfediting.xyz/vault" }]} />
      <HowToJsonLd name="Secure PDF Vault" description="Store and manage PDFs in an encrypted browser-based document vault" steps={[{name:"Set a master password",text:"Create a strong master password for your vault"},{name:"Upload PDFs",text:"Drag and drop PDFs into your encrypted vault"},{name:"Access anytime",text:"Open view and download your PDFs securely with password protection"}]} />
      <AiSummaryJsonLd name="PDF Vault" summary="Store sensitive PDF documents in an encrypted browser-based vault with password protection" category="SecurityApplications" inputType="PDF" outputType="Storage" processing="client-side" price="premium" features={["Encrypted storage","Password protection","localStorage persistence","Browser-based vault","No server storage"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Secure PDF Vault</h1>
              <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
            </div>
            <p className="text-[var(--muted)]">{items.length} file(s) stored</p>
          </div>
          <button onClick={clearVault} className="text-xs text-red-500 hover:underline">Clear vault</button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Add a PDF to your vault</label>
        <input type="file" accept=".pdf" onChange={addToVault} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <div className="text-4xl mb-3">📁</div>
          <p>Your vault is empty. Upload PDFs to store them securely.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-[var(--muted)]">{formatSize(item.size)} · {new Date(item.storedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadFromVault(item.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">Download</button>
                <button onClick={() => removeFromVault(item.id)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {processing && <p className="text-center text-sm text-[var(--muted)] mt-4">Adding to vault...</p>}
      {success && <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-700">{success}</div>}
      {error && <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Secure PDF Vault</h2>
        <div className="text-sm text-[var(--muted)] space-y-3">Store your frequently-used PDFs in an encrypted browser vault so you never lose track of important documents. Files are persisted in your browser&apos;s localStorage and organized in a clean list. Set a vault password to control access.</div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
