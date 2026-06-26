import { kv } from "@/lib/kv";
import { randomBytes } from "crypto";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  premium: boolean;
}

const SESSION_PREFIX = "pdftools:session:";
const USER_PREFIX = "pdftools:user:";

export function userKey(email: string): string {
  return `${USER_PREFIX}${email.toLowerCase()}`;
}

export function sessionKey(token: string): string {
  return `${SESSION_PREFIX}${token}`;
}

export async function createUser(email: string, hash: string, salt: string): Promise<User | null> {
  const key = userKey(email);
  const existing = await kv.get(key);
  if (existing) return null;
  const user: User = {
    id: randomBytes(12).toString("hex"),
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    premium: false,
  };
  await kv.set(key, { ...user, hash, salt }, { ex: 365 * 24 * 60 * 60 });
  return user;
}

export async function getUserByEmail(email: string): Promise<(User & { hash: string; salt: string }) | null> {
  const data = await kv.get<any>(userKey(email));
  if (!data) return null;
  return data;
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

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 48; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}
