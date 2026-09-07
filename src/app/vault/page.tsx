"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolShell from "@/components/ui/ToolShell";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  encryptVault,
  decryptVault,
  vaultExists,
  purgeLegacyVault,
  bytesToBase64,
  base64ToBytes,
  VAULT_STORAGE_KEY,
  type VaultRecord,
} from "@/lib/vault-crypto";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

type VaultMeta = Omit<VaultRecord, "data">;

export default function VaultPage() {
  usePageMeta(
    "Encrypted PDF Vault — Local Document Storage | PDFTools Premium",
    "Store PDFs in an AES-256 encrypted vault in your own browser. Password protected, never uploaded. Premium."
  );

  const [items, setItems] = useState<VaultMeta[]>([]);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [legacyPurged, setLegacyPurged] = useState(0);
  const vaultRef = useRef<VaultRecord[]>([]);

  useEffect(() => {
    // Remove anything the old plaintext implementation left behind. Those
    // entries stored documents unencrypted, so they are deleted rather than
    // migrated — see the note rendered below.
    const removed = purgeLegacyVault();
    if (removed > 0) setLegacyPurged(removed);
    setHasVault(vaultExists());
  }, []);

  const persist = useCallback(async (records: VaultRecord[], password: string) => {
    const blob = await encryptVault(records, password);
    localStorage.setItem(VAULT_STORAGE_KEY, blob);
    setHasVault(true);
  }, []);

  const unlockVault = async () => {
    if (!vaultPassword.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        // AES-GCM authenticates the ciphertext, so a wrong password throws
        // here rather than silently producing junk.
        vaultRef.current = await decryptVault(stored, vaultPassword);
      } else {
        vaultRef.current = [];
        await persist([], vaultPassword);
      }
      setItems(vaultRef.current.map(({ data: _data, ...rest }) => rest));
      setVaultUnlocked(true);
    } catch {
      setError(
        "Wrong password. The vault could not be decrypted — without the correct password the contents cannot be recovered, by us or by anyone else."
      );
    }
    setBusy(false);
  };

  const addToVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await f.arrayBuffer();
      vaultRef.current.push({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        storedAt: Date.now(),
        data: bytesToBase64(bytes),
      });
      await persist(vaultRef.current, vaultPassword);
      setItems(vaultRef.current.map(({ data: _data, ...rest }) => rest));
      setSuccess(`Encrypted and stored "${f.name}"`);
    } catch {
      setError("Failed to add the file. Browser storage may be full.");
    }
    setProcessing(false);
    e.target.value = "";
  };

  const downloadFromVault = (id: string) => {
    const item = vaultRef.current.find((i) => i.id === id);
    if (!item) return;
    const blob = new Blob([base64ToBytes(item.data)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFromVault = async (id: string) => {
    vaultRef.current = vaultRef.current.filter((i) => i.id !== id);
    await persist(vaultRef.current, vaultPassword);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSuccess("File removed from the vault");
  };

  const lockVault = () => {
    vaultRef.current = [];
    setItems([]);
    setVaultPassword("");
    setVaultUnlocked(false);
    setSuccess("");
    setError(null);
  };

  const clearVault = () => {
    if (!confirm("Permanently delete every file in this vault? This cannot be undone.")) return;
    vaultRef.current = [];
    localStorage.removeItem(VAULT_STORAGE_KEY);
    setItems([]);
    setVaultUnlocked(false);
    setVaultPassword("");
    setHasVault(false);
    setSuccess("Vault deleted");
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const jsonLd = (
    <>
      <SoftwareAppJsonLd
        name="Encrypted PDF Vault"
        description="Store PDFs in an AES-256 encrypted vault inside your own browser. Nothing is uploaded."
        url="https://allaboutpdfediting.xyz/vault"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "Encrypted Vault", item: "https://allaboutpdfediting.xyz/vault" },
        ]}
      />
    </>
  );

  if (typeof window !== "undefined" && !isPremium()) {
    return (
      <ToolShell
        icon="vault"
        title="Encrypted PDF Vault"
        lead="Keep sensitive PDFs in an AES-256 encrypted vault that never leaves this device."
        premium
      >
        {jsonLd}
        <div className="surface-card p-6 text-center space-y-4">
          <p className="text-[0.9375rem] font-medium text-[var(--foreground)]">Premium feature</p>
          <p className="text-[0.875rem] text-[var(--muted-strong)] max-w-md mx-auto">
            The vault is included with a premium subscription.
          </p>
          <a href="/premium" className="btn btn-primary">Upgrade to Premium</a>
        </div>
        <ToolGuide slug="vault" />
      </ToolShell>
    );
  }

  if (!vaultUnlocked) {
    return (
      <ToolShell
        icon="vault"
        title="Encrypted PDF Vault"
        lead={
          hasVault
            ? "Enter your password to decrypt the vault stored in this browser."
            : "Choose a password to create an encrypted vault in this browser."
        }
        premium
      >
        {jsonLd}

        {legacyPurged > 0 && (
          <div className="mb-5 p-4 rounded-[var(--r-lg)] bg-[var(--premium-subtle)] border border-[var(--premium-border)] text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
            <strong className="font-medium text-[var(--foreground)]">
              A previous version of this vault stored files without encryption.
            </strong>{" "}
            Those {legacyPurged === 1 ? "entries have" : "entries have"} been deleted rather than
            carried over, because re-encrypting them would have meant keeping the unprotected copy
            around. Any documents you had saved before will need adding again — the originals on your
            computer are untouched.
          </div>
        )}

        <div className="surface-card p-6 space-y-4">
          <div className="flex justify-center">
            <Icon name="lock" size={30} className="text-[var(--muted)]" />
          </div>
          <p className="text-[0.875rem] leading-relaxed text-[var(--muted-strong)] text-center max-w-md mx-auto">
            Files are encrypted with AES-256 using a key derived from your password, then stored in
            this browser on this device. Nothing is uploaded, and the password is never saved
            anywhere — so if you forget it, the contents cannot be recovered by us or by anyone else.
          </p>
          <input
            type="password"
            value={vaultPassword}
            onChange={(e) => setVaultPassword(e.target.value)}
            placeholder={hasVault ? "Vault password" : "Choose a strong password"}
            autoComplete={hasVault ? "current-password" : "new-password"}
            className="input max-w-xs mx-auto block text-center"
            onKeyDown={(e) => e.key === "Enter" && unlockVault()}
          />
          <button
            onClick={unlockVault}
            disabled={!vaultPassword.trim() || busy}
            className="btn btn-primary w-full max-w-xs mx-auto"
          >
            {busy ? "Deriving key…" : hasVault ? "Unlock vault" : "Create vault"}
          </button>
          <p className="text-[0.75rem] text-[var(--muted)] text-center">
            Key derivation runs 600,000 PBKDF2 iterations, so unlocking takes a moment by design.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] text-sm">
            {error}
          </div>
        )}

        <ToolGuide slug="vault" />
      </ToolShell>
    );
  }

  return (
    <ToolShell
      icon="vault"
      title="Encrypted PDF Vault"
      lead={`${items.length} ${items.length === 1 ? "file" : "files"} stored, encrypted on this device.`}
      premium
      footer={
        <div className="text-center mt-8">
          <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">
            Explore all Premium features →
          </a>
        </div>
      }
    >
      {jsonLd}
      <HowToJsonLd
        name="Encrypted PDF Vault"
        description="Store and manage PDFs in an AES-256 encrypted browser vault"
        steps={[
          { name: "Set a password", text: "Choose a password used to derive the encryption key" },
          { name: "Add PDFs", text: "Each file is encrypted with AES-256 before being stored" },
          { name: "Unlock anytime", text: "Re-enter the password to decrypt and download your files" },
        ]}
      />
      <AiSummaryJsonLd
        name="Encrypted PDF Vault"
        summary="Store PDFs in an AES-256-GCM encrypted vault in the browser, with PBKDF2 key derivation and no server upload"
        category="SecurityApplications"
        inputType="PDF"
        outputType="Storage"
        processing="client-side"
        price="premium"
        features={["AES-256-GCM encryption", "PBKDF2 key derivation", "Password protection", "No server storage", "Local to one device"]}
        limits="Premium subscribers"
      />

      <div className="flex items-center justify-end gap-3 mb-5">
        <button onClick={lockVault} className="btn btn-secondary text-[0.75rem] py-1.5 px-3">
          <Icon name="lock" size={13} />
          Lock
        </button>
        <button onClick={clearVault} className="text-xs text-[var(--danger)] hover:underline">
          Delete vault
        </button>
      </div>

      <div className="surface-card p-6 mb-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Add a PDF to your vault
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={addToVault}
          className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium w-full"
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <div className="flex justify-center mb-3">
            <Icon name="archive" size={30} className="text-[var(--muted)]" />
          </div>
          <p className="text-sm">Your vault is empty. Add a PDF to store it encrypted.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-4 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--border)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[var(--foreground)]">{item.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {formatSize(item.size)} · {new Date(item.storedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFromVault(item.id)}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded-lg hover:bg-[var(--accent-hover)] transition"
                >
                  Download
                </button>
                <button
                  onClick={() => removeFromVault(item.id)}
                  className="px-3 py-1.5 bg-[var(--danger)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {processing && (
        <p className="text-center text-sm text-[var(--muted)] mt-4">Encrypting and storing…</p>
      )}
      {success && (
        <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center text-sm text-[var(--success)]">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <ToolGuide slug="vault" />
    </ToolShell>
  );
}
