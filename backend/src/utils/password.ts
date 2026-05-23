import bcrypt from "bcryptjs";

import { env } from "@/config/env";

export function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export function comparePassword(password: string, hashContrasena: string) {
  return bcrypt.compare(password, hashContrasena);
}
