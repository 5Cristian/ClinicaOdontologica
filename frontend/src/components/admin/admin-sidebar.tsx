"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  CalendarDays,
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  Shield,
  Users,
  BarChart3,
  ScrollText
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { canAccessRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { RolUsuario } from "@/types/api";

const navItems: Array<{
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: RolUsuario[];
}> = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"] },
  { href: "/admin/citas", label: "Citas", icon: CalendarDays, roles: ["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"] },
  { href: "/admin/pacientes", label: "Pacientes", icon: Users, roles: ["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"] },
  { href: "/admin/tratamientos", label: "Tratamientos", icon: Stethoscope, roles: ["ADMINISTRADOR", "RECEPCION"] },
  { href: "/admin/historial", label: "Historial", icon: ClipboardPlus, roles: ["ADMINISTRADOR", "ODONTOLOGO"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: Shield, roles: ["ADMINISTRADOR"] },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMINISTRADOR"] },
  { href: "/admin/auditoria", label: "Auditoría", icon: ScrollText, roles: ["ADMINISTRADOR"] },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, roles: ["ADMINISTRADOR"] }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <aside className="rounded-[30px] bg-slate-950 p-6 text-white">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Clínica</p>
        <h2 className="mt-3 font-heading text-2xl font-bold">Panel administrativo</h2>
        <p className="mt-3 text-sm text-slate-300">{user?.name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role}</p>
      </div>

      <nav className="space-y-2">
        {navItems
          .filter((item) => canAccessRole(user?.role, item.roles))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white",
                pathname === item.href && "bg-white/10 text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
      </nav>

      <button
        type="button"
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
        className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </aside>
  );
}
