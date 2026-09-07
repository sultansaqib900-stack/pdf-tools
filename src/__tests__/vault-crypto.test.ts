import { describe, it, expect, beforeEach } from "vitest";
import { webcrypto } from "node:crypto";
import {
  encryptVault,
  decryptVault,
  bytesToBase64,
  base64ToBytes,
  purgeLegacyVault,
  vaultExists,
  VAULT_STORAGE_KEY,
  LEGACY_INDEX_KEY,
  type VaultRecord,
} from "@/lib/vault-crypto";

// jsdom/node test env: provide the browser globals the module expects.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}
if (typeof globalThis.btoa === "undefined") {
  globalThis.btoa = (s: string) => Buffer.from(s, "binary").toString("base64");
  globalThis.atob = (s: string) => Buffer.from(s, "base64").toString("binary");
}

const record = (name: string, bytes: number[]): VaultRecord => ({
  id: name,
  name,
  size: bytes.length,
  storedAt: 1_700_000_000_000,
  data: bytesToBase64(new Uint8Array(bytes).buffer),
});

describe("vault encryption", () => {
  it("round-trips records through encrypt/decrypt", async () => {
    const records = [record("a.pdf", [1, 2, 3, 4, 250]), record("b.pdf", [0, 255])];
    const blob = await encryptVault(records, "correct horse battery staple");
    const out = await decryptVault(blob, "correct horse battery staple");

    expect(out).toHaveLength(2);
    expect(out[0].name).toBe("a.pdf");
    expect(new Uint8Array(base64ToBytes(out[0].data))).toEqual(new Uint8Array([1, 2, 3, 4, 250]));
    expect(new Uint8Array(base64ToBytes(out[1].data))).toEqual(new Uint8Array([0, 255]));
  });

  it("does not store the plaintext anywhere in the blob", async () => {
    const secret = "Patient-Name-Jane-Doe";
    const bytes = Array.from(new TextEncoder().encode(secret));
    const blob = await encryptVault([record("medical.pdf", bytes)], "pw");

    // Neither the raw secret nor its base64 encoding may appear.
    expect(blob).not.toContain(secret);
    expect(blob).not.toContain(bytesToBase64(new Uint8Array(bytes).buffer));
    // The filename is inside the encrypted payload too.
    expect(blob).not.toContain("medical.pdf");
  });

  it("rejects a wrong password rather than returning garbage", async () => {
    const blob = await encryptVault([record("a.pdf", [1, 2, 3])], "right-password");
    await expect(decryptVault(blob, "wrong-password")).rejects.toThrow();
  });

  it("uses a fresh salt and IV per save, so identical input differs", async () => {
    const records = [record("a.pdf", [9, 9, 9])];
    const one = await encryptVault(records, "pw");
    const two = await encryptVault(records, "pw");

    expect(one).not.toEqual(two);
    expect(JSON.parse(one).salt).not.toEqual(JSON.parse(two).salt);
    expect(JSON.parse(one).iv).not.toEqual(JSON.parse(two).iv);
    // Both must still decrypt.
    expect(await decryptVault(two, "pw")).toHaveLength(1);
  });

  it("refuses an unrecognised vault format", async () => {
    await expect(decryptVault(JSON.stringify({ v: 1, data: "x" }), "pw")).rejects.toThrow();
  });
});

describe("legacy plaintext vault cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes the old unencrypted keys and reports how many", () => {
    // The old scheme keyed storage by the password itself.
    localStorage.setItem("pdftools_vault_hunter2", JSON.stringify([{ name: "secret.pdf" }]));
    localStorage.setItem(LEGACY_INDEX_KEY, JSON.stringify([{ name: "secret.pdf" }]));
    localStorage.setItem("unrelated", "keep me");

    const removed = purgeLegacyVault();

    expect(removed).toBe(2);
    expect(localStorage.getItem("pdftools_vault_hunter2")).toBeNull();
    expect(localStorage.getItem(LEGACY_INDEX_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep me");
  });

  it("never deletes the current encrypted vault", () => {
    localStorage.setItem(VAULT_STORAGE_KEY, "encrypted-blob");
    const removed = purgeLegacyVault();

    expect(removed).toBe(0);
    expect(localStorage.getItem(VAULT_STORAGE_KEY)).toBe("encrypted-blob");
    expect(vaultExists()).toBe(true);
  });
});
