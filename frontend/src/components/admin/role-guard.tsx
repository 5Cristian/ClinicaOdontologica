"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { canAccessRole } from "@/lib/roles";
import { RolUsuario } from "@/types/api";

export function RoleGuard({
  roles,
  children
}: {
  roles: RolUsuario[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-slate-600 shadow-soft">Validando permisos...</div>;
  }

  if (!canAccessRole(user?.role, roles)) {
    return (
      <div className="rounded-3xl bg-white p-8 text-sm text-red-700 shadow-soft">
        No tiene permisos para acceder a este módulo.
      </div>
    );
  }

  return <>{children}</>;
}
