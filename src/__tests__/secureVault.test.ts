// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";
import { indexedDB } from "fake-indexeddb";
import {
  addSecureVaultItem,
  clearSecureVault,
  hasSecureVault,
  openOrCreateSecureVault,
  removeSecureVaultItem,
} from "@/lib/secureVault";

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  Object.defineProperty(globalThis, "indexedDB", { value: indexedDB, configurable: true });
});

beforeEach(async () => {
  await clearSecureVault();
});

describe("secure browser vault", () => {
  it("creates a password-derived vault and rejects a wrong password", async () => {
    const created = await openOrCreateSecureVault("correct horse battery staple");
    expect(created.created).toBe(true);
    expect(await hasSecureVault()).toBe(true);
    await expect(openOrCreateSecureVault("incorrect password")).rejects.toThrow(/incorrect/i);
  });

  it("encrypts, persists, decrypts, and removes PDF data", async () => {
    const password = "a strong vault password";
    const created = await openOrCreateSecureVault(password);
    const source = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55, 10, 115, 101, 99, 114, 101, 116]);
    const stored = await addSecureVaultItem(created.key, source, "private.pdf");
    source.fill(0);

    const reopened = await openOrCreateSecureVault(password);
    expect(reopened.created).toBe(false);
    expect(reopened.items).toHaveLength(1);
    expect(reopened.items[0].name).toBe("private.pdf");
    expect(Array.from(reopened.items[0].data.slice(0, 5))).toEqual([37, 80, 68, 70, 45]);

    await removeSecureVaultItem(stored.id);
    expect((await openOrCreateSecureVault(password)).items).toHaveLength(0);
  });
});
