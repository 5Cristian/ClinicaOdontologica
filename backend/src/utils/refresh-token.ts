import crypto from "crypto";

import { hashPassword } from "@/utils/password";

// Genera un token aleatorio para usarlo como refresh token del navegador.
export function generateTokenRefrescoValue() {
  return crypto.randomBytes(48).toString("hex");
}

// Reutiliza hashing fuerte para no persistir refresh tokens en texto plano.
export function hashTokenRefresco(token: string) {
  return hashPassword(token);
}
