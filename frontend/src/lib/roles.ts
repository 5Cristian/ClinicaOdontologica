import { RolUsuario } from "@/types/api";

// Centraliza reglas de acceso para renderizar UI según el rol autenticado.
export function canAccessRole(userRole: RolUsuario | undefined, allowedRoles: RolUsuario[]) {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
