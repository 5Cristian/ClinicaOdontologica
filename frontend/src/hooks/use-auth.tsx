"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { registerRefreshHandler } from "@/lib/api";
import { getMe, loginRequest, logoutRequest, refreshRequest } from "@/services/auth.service";
import { UsuarioAutenticado } from "@/types/api";

type AuthContextValue = {
  token: string | null;
  user: UsuarioAutenticado | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "clinica_token";
const USER_KEY = "clinica_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);
  const [loading, setLoading] = useState(true);

  function persistSession(nextToken: string, nextUser: UsuarioAutenticado) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  async function refreshSession() {
    try {
      // Pide un nuevo access token usando la cookie HttpOnly del refresh token.
      const data = await refreshRequest();
      persistSession(data.accessToken, data.user);
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }

  useEffect(() => {
    registerRefreshHandler(refreshSession);
    return () => registerRefreshHandler(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as UsuarioAutenticado);
    }

    // Intenta restaurar una sesión válida aunque el access token ya haya expirado.
    refreshSession()
      .then(async (nextToken) => {
        if (!nextToken) return;
        const profile = await getMe(nextToken);
        const safeUser: UsuarioAutenticado = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role
        };
        persistSession(nextToken, safeUser);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await loginRequest(email, password);
    persistSession(data.accessToken, data.user);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      refreshSession
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
