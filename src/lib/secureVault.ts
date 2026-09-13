import { copyPdfBytes } from "./pdfBytes";

const DB_NAME = "pdftools_secure_vault";
const DB_VERSION = 1;
const CONFIG_STORE = "config";
const ITEM_STORE = "items";
const CONFIG_ID = "primary";
const VERIFIER_TEXT = "PDFTools secure vault version 1";
const PBKDF2_ITERATIONS = 250_000;

interface VaultConfigRecord {
  id: string;
  version: 1;
  salt: ArrayBuffer;
  iv: ArrayBuffer;
  verifier: ArrayBuffer;
}

interface VaultItemRecord {
  id: string;
  iv: ArrayBuffer;
  ciphertext: ArrayBuffer;
}

export interface SecureVaultItem {
  id: string;
  name: string;
  size: number;
  storedAt: number;
  data: Uint8Array;
}

export interface SecureVaultSession {
  key: CryptoKey;
  items: SecureVaultItem[];
  created: boolean;
}

function requireBrowserCrypto(): Crypto {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure browser cryptography is unavailable in this browser.");
  }
  return globalThis.crypto;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return copyPdfBytes(bytes).buffer as ArrayBuffer;
}

function openVaultDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Encrypted browser storage is unavailable."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CONFIG_STORE)) database.createObjectStore(CONFIG_STORE, { keyPath: "id" });
      if (!database.objectStoreNames.contains(ITEM_STORE)) database.createObjectStore(ITEM_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open encrypted browser storage."));
  });
}

async function getRecord<T>(storeName: string, id: IDBValidKey): Promise<T | undefined> {
  const database = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const database = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function putRecord(storeName: string, record: VaultConfigRecord | VaultItemRecord): Promise<void> {
  const database = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(record);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Encrypted storage write was aborted.")); };
  });
}

async function deleteRecord(storeName: string, id: IDBValidKey): Promise<void> {
  const database = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function deriveVaultKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const browserCrypto = requireBrowserCrypto();
  const passwordMaterial = await browserCrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return browserCrypto.subtle.deriveKey(
    { name: "PBKDF2", salt: asArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    passwordMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptWithKey(key: CryptoKey, plaintext: Uint8Array, additionalData: string): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const browserCrypto = requireBrowserCrypto();
  const iv = browserCrypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await browserCrypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(additionalData) },
    key,
    asArrayBuffer(plaintext),
  );
  return { iv, ciphertext: new Uint8Array(ciphertext) };
}

async function decryptWithKey(key: CryptoKey, iv: ArrayBuffer, ciphertext: ArrayBuffer, additionalData: string): Promise<Uint8Array> {
  const plaintext = await requireBrowserCrypto().subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(additionalData) },
    key,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}

function encodeItem(item: Omit<SecureVaultItem, "data">, data: Uint8Array): Uint8Array {
  const metadata = new TextEncoder().encode(JSON.stringify(item));
  const packet = new Uint8Array(4 + metadata.byteLength + data.byteLength);
  new DataView(packet.buffer).setUint32(0, metadata.byteLength, false);
  packet.set(metadata, 4);
  packet.set(data, 4 + metadata.byteLength);
  return packet;
}

function decodeItem(id: string, packet: Uint8Array): SecureVaultItem {
  if (packet.byteLength < 5) throw new Error("A vault item is corrupted.");
  const metadataLength = new DataView(packet.buffer, packet.byteOffset, packet.byteLength).getUint32(0, false);
  if (metadataLength <= 0 || 4 + metadataLength >= packet.byteLength) throw new Error("A vault item is corrupted.");
  const metadata = JSON.parse(new TextDecoder().decode(packet.subarray(4, 4 + metadataLength))) as Omit<SecureVaultItem, "data">;
  const data = copyPdfBytes(packet.subarray(4 + metadataLength));
  if (metadata.id !== id || !metadata.name || data.byteLength === 0) throw new Error("A vault item is corrupted.");
  return { ...metadata, data };
}

export async function hasSecureVault(): Promise<boolean> {
  return Boolean(await getRecord<VaultConfigRecord>(CONFIG_STORE, CONFIG_ID));
}

export async function openOrCreateSecureVault(password: string): Promise<SecureVaultSession> {
  if (password.length < 8) throw new Error("Use a master password with at least 8 characters.");
  const existing = await getRecord<VaultConfigRecord>(CONFIG_STORE, CONFIG_ID);

  if (!existing) {
    const salt = requireBrowserCrypto().getRandomValues(new Uint8Array(16));
    const key = await deriveVaultKey(password, salt);
    const encryptedVerifier = await encryptWithKey(key, new TextEncoder().encode(VERIFIER_TEXT), `vault:${CONFIG_ID}`);
    await putRecord(CONFIG_STORE, {
      id: CONFIG_ID,
      version: 1,
      salt: asArrayBuffer(salt),
      iv: asArrayBuffer(encryptedVerifier.iv),
      verifier: asArrayBuffer(encryptedVerifier.ciphertext),
    });
    return { key, items: [], created: true };
  }

  const key = await deriveVaultKey(password, new Uint8Array(existing.salt));
  try {
    const verifier = await decryptWithKey(key, existing.iv, existing.verifier, `vault:${CONFIG_ID}`);
    if (new TextDecoder().decode(verifier) !== VERIFIER_TEXT) throw new Error("Verifier mismatch");
  } catch {
    throw new Error("Incorrect master password.");
  }

  const records = await getAllRecords<VaultItemRecord>(ITEM_STORE);
  const items: SecureVaultItem[] = [];
  for (const record of records) {
    try {
      const packet = await decryptWithKey(key, record.iv, record.ciphertext, `item:${record.id}`);
      items.push(decodeItem(record.id, packet));
    } catch {
      throw new Error("The vault opened, but one or more stored files are corrupted.");
    }
  }
  items.sort((left, right) => right.storedAt - left.storedAt);
  return { key, items, created: false };
}

export async function addSecureVaultItem(key: CryptoKey, input: Uint8Array, name: string): Promise<SecureVaultItem> {
  const data = copyPdfBytes(input);
  if (data.byteLength === 0) throw new Error("Cannot store an empty file.");
  const item: SecureVaultItem = {
    id: requireBrowserCrypto().randomUUID(),
    name,
    size: data.byteLength,
    storedAt: Date.now(),
    data,
  };
  const packet = encodeItem({ id: item.id, name: item.name, size: item.size, storedAt: item.storedAt }, data);
  const encrypted = await encryptWithKey(key, packet, `item:${item.id}`);
  await putRecord(ITEM_STORE, {
    id: item.id,
    iv: asArrayBuffer(encrypted.iv),
    ciphertext: asArrayBuffer(encrypted.ciphertext),
  });
  return { ...item, data: copyPdfBytes(item.data) };
}

export async function removeSecureVaultItem(id: string): Promise<void> {
  await deleteRecord(ITEM_STORE, id);
}

export async function clearSecureVault(): Promise<void> {
  const database = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONFIG_STORE, ITEM_STORE], "readwrite");
    transaction.objectStore(CONFIG_STORE).clear();
    transaction.objectStore(ITEM_STORE).clear();
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}
