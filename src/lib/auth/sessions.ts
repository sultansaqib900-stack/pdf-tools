import { kv } from "@/lib/kv";
import { randomBytes } from "crypto";
import { generateToken } from "@/lib/auth/crypto";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  premium: boolean;
}

type StoredUser = User & { hash: string; salt: string };

const SESSION_PREFIX = "pdftools:session:";
const USER_PREFIX = "pdftools:user:";
const USER_TTL_SECONDS = 365 * 24 * 60 * 60;

export function userKey(email: string): string {
  return `${USER_PREFIX}${email.toLowerCase()}`;
}

export function sessionKey(token: string): string {
  return `${SESSION_PREFIX}${token}`;
}

export async function createUser(
  email: string,
  hash: string,
  salt: string,
  name?: string,
): Promise<User | null> {
  const user: User = {
    id: randomBytes(12).toString("hex"),
    email: email.toLowerCase(),
    ...(name ? { name } : {}),
    createdAt: new Date().toISOString(),
    premium: false,
  };
  const created = await kv.set(
    userKey(email),
    { ...user, hash, salt },
    { ex: USER_TTL_SECONDS, nx: true },
  );
  return created ? user : null;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  return kv.get<StoredUser>(userKey(email));
}

export async function updateUserPassword(email: string, hash: string, salt: string): Promise<void> {
  const existing = await getUserByEmail(email);
  if (!existing) return;
  await kv.set(userKey(email), { ...existing, hash, salt }, { ex: USER_TTL_SECONDS });
}

export async function createSession(user: User): Promise<string> {
  const token = generateToken();
  await kv.set(sessionKey(token), { userId: user.id, email: user.email }, { ex: 7 * 24 * 60 * 60 });
  return token;
}

export async function getSession(token: string): Promise<{ userId: string; email: string } | null> {
  return kv.get(sessionKey(token));
}

export async function deleteSession(token: string): Promise<void> {
  await kv.del(sessionKey(token));
}
