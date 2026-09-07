/**
 * Real client-side encryption for the document vault.
 *
 * The previous implementation advertised an "encrypted vault" but stored the
 * documents as plain JSON under a localStorage key that embedded the password
 * (`pdftools_vault_<password>`). That is not encryption: the bytes were
 * readable by anything with storage access, and the key name leaked the
 * password itself.
 *
 * This module does what the page claims:
 *   - PBKDF2-SHA256 (600k iterations) derives a key from the password.
 *     600k is the OWASP 2023 recommendation for PBKDF2-HMAC-SHA256.
 *   - AES-GCM 256 encrypts the payload and authenticates it, so a wrong
 *     password fails to decrypt rather than returning garbage.
 *   - A random 16-byte salt and 12-byte IV are generated per save and stored
 *     alongside the ciphertext (both are public values by design).
 *
 * Everything runs in the browser via WebCrypto — no dependency, no upload.
 *
 * Threat model, stated honestly: this protects vault contents against someone
 * reading localStorage (another site cannot, but local software, a browser
 * extension with storage permission, or someone at your unlocked machine
 * could). It does NOT protect against malicious code running on this page,
 * which could read the password as you type it. It is not a substitute for
 * full-disk encryption or a real password manager.
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export const VAULT_STORAGE_KEY = "pdftools_vault_v2";
/** Legacy plaintext keys, removed on migration. */
export const LEGACY_INDEX_KEY = "pdftools_vault_index";
export const LEGACY_PREFIX = "pdftools_vault_";

export interface VaultRecord {
  id: string;
  name: string;
  size: number;
  storedAt: number;
  /** Base64 of the file bytes. */
  data: string;
}

interface EncryptedBlob {
  v: 2;
  salt: string;
  iv: string;
  ct: string;
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function bytesToBase64(buf: ArrayBuffer): string {
  return toBase64(new Uint8Array(buf));
}

export function base64ToBytes(b64: string): ArrayBuffer {
  const u8 = fromBase64(b64);
  // Return a standalone ArrayBuffer, not a view into a shared one.
  return u8.slice().buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypt the vault contents under `password` and return a storable string. */
export async function encryptVault(records: VaultRecord[], password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(records));

  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    plaintext as unknown as BufferSource
  );

  const blob: EncryptedBlob = {
    v: 2,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(new Uint8Array(ct)),
  };
  return JSON.stringify(blob);
}

/**
 * Decrypt a stored vault. Throws when the password is wrong — AES-GCM
 * authentication fails rather than yielding garbage, which is what lets the UI
 * report "wrong password" honestly.
 */
export async function decryptVault(stored: string, password: string): Promise<VaultRecord[]> {
  const blob = JSON.parse(stored) as EncryptedBlob;
  if (blob?.v !== 2) throw new Error("Unrecognised vault format");

  const key = await deriveKey(password, fromBase64(blob.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(blob.iv) as unknown as BufferSource },
    key,
    fromBase64(blob.ct) as unknown as BufferSource
  );
  return JSON.parse(new TextDecoder().decode(plain)) as VaultRecord[];
}

/** True when an encrypted vault already exists on this device. */
export function vaultExists(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(VAULT_STORAGE_KEY) !== null;
}

/**
 * Delete anything written by the old plaintext implementation.
 *
 * Those entries cannot be migrated automatically: re-encrypting them would
 * need the password at a moment we do not have it, and silently carrying
 * plaintext forward would keep the original problem. They are removed, and the
 * UI tells the user why.
 */
export function purgeLegacyVault(): number {
  if (typeof window === "undefined") return 0;
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k === LEGACY_INDEX_KEY) doomed.push(k);
    else if (k.startsWith(LEGACY_PREFIX) && k !== VAULT_STORAGE_KEY) doomed.push(k);
  }
  doomed.forEach((k) => localStorage.removeItem(k));
  return doomed.length;
}
