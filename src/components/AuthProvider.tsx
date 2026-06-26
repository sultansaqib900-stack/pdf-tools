"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  premium: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, name?: string) => Promise<string | null>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pdftools_token");
    if (!raw || raw === "undefined" || raw === "null") return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("pdftools_token", JSON.stringify(t));
    else localStorage.removeItem("pdftools_token");
  };

  useEffect(() => {
    const t = getStoredToken();
    if (!t) { setLoading(false); return; }
    setTokenState(t);
    fetch("/api/auth/me", { headers: { authorization: `Bearer ${t}` } })
      .then((r) => r.json().then((d) => { if (d.user) setUser(d.user); }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) return d.error || "Login failed";
    setToken(d.token);
    setUser(d.user);
    return null;
  };

  const signup = async (email: string, password: string, name?: string): Promise<string | null> => {
    const r = await fetch("/api/auth/signup", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const d = await r.json();
    if (!r.ok) return d.error || "Signup failed";
    setToken(d.token);
    setUser(d.user);
    return null;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
