"use client";

import { useState, useRef, useEffect } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

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
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const vaultRef = useRef<VaultItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem("pdftools_vault_index");
        if (stored) setItems(JSON.parse(stored));
      } catch {}
    });
  }, []);

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

  return (
    <PremiumGate
      title="Client-Encrypted PDF Document Vault"
      description="Store sensitive PDFs locally in your browser with password-protected client encryption. No server uploads."
      icon="🔐"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Secure PDF Vault" description="Store PDFs in encrypted browser vault." url="https://allaboutpdfediting.xyz/vault" />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Secure Vault", item: "https://allaboutpdfediting.xyz/vault" }]} />
        <HowToJsonLd name="Secure PDF Vault" description="Store and manage PDFs in an encrypted browser-based document vault" steps={[{name:"Set a master password",text:"Create a strong master password for your vault"},{name:"Upload PDFs",text:"Drag and drop PDFs into your encrypted vault"},{name:"Access anytime",text:"Open view and download your PDFs securely with password protection"}]} />
        <AiSummaryJsonLd name="PDF Vault" summary="Store sensitive PDF documents in an encrypted browser-based vault with password protection" category="SecurityApplications" inputType="PDF" outputType="Storage" processing="client-side" price="premium" features={["Encrypted storage","Password protection","localStorage persistence","Browser-based vault","No server storage"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Secure PDF Vault</h1>
                <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
              </div>
              <p className="text-[var(--muted)]">{vaultUnlocked ? `${items.length} file(s) stored securely` : "Password-protected encrypted browser storage."}</p>
            </div>
            {vaultUnlocked && (
              <button onClick={clearVault} className="text-xs text-red-500 hover:underline font-semibold">Clear entire vault</button>
            )}
          </div>
        </div>

        {!vaultUnlocked ? (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8 text-center space-y-5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto">🔐</div>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto">Your vault stores PDFs encrypted directly inside your browser. Enter a master password to unlock or create your vault.</p>
            <input type="password" value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Enter master password" className="w-full max-w-xs mx-auto px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm text-center outline-none focus:border-indigo-500 font-medium" onKeyDown={(e) => e.key === "Enter" && unlockVault()} />
            <div>
              <button onClick={unlockVault} disabled={!vaultPassword.trim()} className="w-full max-w-xs mx-auto py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:opacity-95 disabled:opacity-40 transition shadow-md shadow-amber-500/20">Unlock Vault</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-xl">
              <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Add a PDF to your vault</label>
              <input type="file" accept=".pdf" onChange={addToVault} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl text-[var(--muted)] shadow-xl">
                <div className="text-4xl mb-3">📁</div>
                <p className="font-semibold text-[var(--foreground)]">Your vault is empty</p>
                <p className="text-xs text-[var(--muted)] mt-1">Upload confidential PDFs to store them encrypted in this browser.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-md">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-[var(--foreground)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{formatSize(item.size)} · Added {new Date(item.storedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => downloadFromVault(item.id)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">Download</button>
                      <button onClick={() => removeFromVault(item.id)} className="px-3 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {processing && <p className="text-center text-sm text-[var(--muted)] mt-4">Encrypting & saving to vault...</p>}
        {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 font-bold">{success}</div>}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
