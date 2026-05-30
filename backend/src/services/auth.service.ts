import { RolNombre } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/config/prisma";
import { env } from "@/config/env";
import { recordRegistroAuditoria } from "@/services/audit-log.service";
import { AppError } from "@/utils/app-error";
import { signAccessToken, signTokenRefresco, verifyTokenRefresco } from "@/utils/jwt";
import { comparePassword, hashPassword } from "@/utils/password";
import { generateTokenRefrescoValue, hashTokenRefresco } from "@/utils/refresh-token";

type UsuarioSesion = {
  id: string;
  nombre: string;
  correo: string;
  rol: RolNombre;
};

function buildSafeUser(usuario: UsuarioSesion) {
  return {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol
  };
}

async function persistTokenRefresco(usuarioId: string, rawTokenRefresco: string) {
  const hashToken = await hashTokenRefresco(rawTokenRefresco);
  const expiraEn = new Date(Date.now() + parseRefreshExpiryMs());

  await prisma.tokenRefresco.create({
    data: {
      usuarioId,
      hashToken,
      expiraEn
    }
  });
}

function parseRefreshExpiryMs() {
  const raw = env.JWT_REFRESH_EXPIRES_IN.trim();
  const amount = Number(raw.slice(0, -1));
  const unit = raw.slice(-1);

  if (Number.isNaN(amount)) return 7 * 24 * 60 * 60 * 1000;
  if (unit === "d") return amount * 24 * 60 * 60 * 1000;
  if (unit === "h") return amount * 60 * 60 * 1000;
  if (unit === "m") return amount * 60 * 1000;
  return amount * 1000;
}

async function generateSessionTokens(usuario: UsuarioSesion) {
  const accessToken = signAccessToken({
    id: usuario.id,
    email: usuario.correo,
    role: usuario.rol
  });

  const refreshTokenValue = generateTokenRefrescoValue();
  const refreshToken = signTokenRefresco({
    id: usuario.id,
    email: usuario.correo,
    role: usuario.rol
  });
  const combinedTokenRefresco = `${refreshToken}.${refreshTokenValue}`;

  await persistTokenRefresco(usuario.id, combinedTokenRefresco);

  return {
    accessToken,
    refreshToken: combinedTokenRefresco,
    user: buildSafeUser(usuario)
  };
}

export async function login(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { correo: email } });

  if (!usuario || !usuario.activo) {
    throw new AppError("Credenciales invalidas.", 401);
  }

  const passwordMatches = await comparePassword(password, usuario.hashContrasena);
  if (!passwordMatches) {
    throw new AppError("Credenciales invalidas.", 401);
  }

  await recordRegistroAuditoria({
    usuarioActorId: usuario.id,
    accion: "AUTH_LOGIN",
    tipoEntidad: "AUTH",
    entidadId: usuario.id,
    descripcion: `Inicio de sesion exitoso para ${usuario.correo}.`,
    metadatos: { correo: usuario.correo, rol: usuario.rol }
  });

  return generateSessionTokens(usuario);
}

export async function refreshSession(combinedTokenRefresco: string) {
  const parts = combinedTokenRefresco.split(".");
  if (parts.length < 3) {
    throw new AppError("Refresh token invalido.", 401);
  }

  const payload = verifyTokenRefresco(parts.slice(0, 3).join("."));
  const storedTokens = await prisma.tokenRefresco.findMany({
    where: {
      usuarioId: payload.id,
      revocadoEn: null,
      expiraEn: { gt: new Date() }
    }
  });

  let matchedTokenId: string | null = null;
  for (const token of storedTokens) {
    const matches = await bcrypt.compare(combinedTokenRefresco, token.hashToken);
    if (matches) {
      matchedTokenId = token.id;
      break;
    }
  }

  if (!matchedTokenId) {
    throw new AppError("Refresh token invalido.", 401);
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } });
  if (!usuario || !usuario.activo) {
    throw new AppError("Usuario no autorizado para renovar sesion.", 401);
  }

  await prisma.tokenRefresco.update({
    where: { id: matchedTokenId },
    data: { revocadoEn: new Date() }
  });

  return generateSessionTokens(usuario);
}

export async function logout(combinedTokenRefresco?: string) {
  if (!combinedTokenRefresco) return;

  const candidateTokens = await prisma.tokenRefresco.findMany({
    where: { revocadoEn: null }
  });

  for (const token of candidateTokens) {
    const matches = await bcrypt.compare(combinedTokenRefresco, token.hashToken);
    if (!matches) continue;

    await prisma.tokenRefresco.update({
      where: { id: token.id },
      data: { revocadoEn: new Date() }
    });

    await recordRegistroAuditoria({
      usuarioActorId: token.usuarioId,
      accion: "AUTH_LOGOUT",
      tipoEntidad: "AUTH",
      entidadId: token.usuarioId,
      descripcion: "Cierre de sesion registrado correctamente."
    });
    break;
  }
}

export async function registerUser(
  input: {
    name: string;
    email: string;
    password: string;
    role: RolNombre;
  },
  usuarioActorId?: string
) {
  const existing = await prisma.usuario.findUnique({ where: { correo: input.email } });
  if (existing) {
    throw new AppError("Ya existe un usuario con ese correo.", 409);
  }

  const hashContrasena = await hashPassword(input.password);
  const usuario = await prisma.usuario.create({
    data: {
      nombre: input.name,
      correo: input.email,
      hashContrasena,
      rol: input.role
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId,
    accion: "AUTH_REGISTER",
    tipoEntidad: "USER",
    entidadId: usuario.id,
    descripcion: `Usuario registrado: ${usuario.correo}.`,
    metadatos: { correo: usuario.correo, rol: usuario.rol }
  });

  return buildSafeUser(usuario);
}

export async function getCurrentUser(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      creadoEn: true
    }
  });

  if (!usuario) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  return {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol,
    activo: usuario.activo,
    creadoEn: usuario.creadoEn
  };
}
