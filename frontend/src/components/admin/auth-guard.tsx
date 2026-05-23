"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-slate-600 shadow-soft">Validando sesión...</div>;
  }

  return <>{children}</>;
}
