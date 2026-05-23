import { RolNombre } from "@prisma/client";

import { prisma } from "../config/prisma";
import { recordRegistroAuditoria } from "./audit-log.service";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/password";

function mapUsuario(usuario: {
  id: string;
  nombre: string;
  correo: string;
  rol: RolNombre;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}) {
  return {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol,
    activo: usuario.activo,
    creadoEn: usuario.creadoEn,
    actualizadoEn: usuario.actualizadoEn
  };
}

export async function listUsers() {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      creadoEn: true,
      actualizadoEn: true
    },
    orderBy: { creadoEn: "desc" }
  });

  return usuarios.map(mapUsuario);
}

export async function getUserById(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      creadoEn: true,
      actualizadoEn: true
    }
  });

  if (!usuario) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  return mapUsuario(usuario);
}

export async function createUser(
  input: {
    name: string;
    email: string;
    password: string;
    role: RolNombre;
    activo?: boolean;
  },
  usuarioActorId?: string
) {
  const existing = await prisma.usuario.findUnique({
    where: { correo: input.email }
  });

  if (existing) {
    throw new AppError("Ya existe un usuario con ese correo.", 409);
  }

  const hashContrasena = await hashPassword(input.password);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: input.name,
      correo: input.email,
      hashContrasena,
      rol: input.role,
      activo: input.activo ?? true
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      creadoEn: true,
      actualizadoEn: true
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId,
    accion: "USER_CREATE",
    tipoEntidad: "USER",
    entidadId: usuario.id,
    descripcion: `Usuario creado: ${usuario.correo}.`,
    metadatos: { correo: usuario.correo, rol: usuario.rol, activo: usuario.activo }
  });

  return mapUsuario(usuario);
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    email: string;
    role: RolNombre;
    activo: boolean;
    password?: string;
  },
  currentUserId: string
) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const correoOwner = await prisma.usuario.findFirst({
    where: {
      correo: input.email,
      id: { not: id }
    }
  });

  if (correoOwner) {
    throw new AppError("Ya existe un usuario con ese correo.", 409);
  }

  if (id === currentUserId && !input.activo) {
    throw new AppError("No puede desactivar su propio usuario.", 400);
  }

  const hashContrasena = input.password ? await hashPassword(input.password) : undefined;

  const actualizado = await prisma.usuario.update({
    where: { id },
    data: {
      nombre: input.name,
      correo: input.email,
      rol: input.role,
      activo: input.activo,
      hashContrasena
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      creadoEn: true,
      actualizadoEn: true
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: currentUserId,
    accion: "USER_UPDATE",
    tipoEntidad: "USER",
    entidadId: actualizado.id,
    descripcion: `Usuario actualizado: ${actualizado.correo}.`,
    metadatos: { correo: actualizado.correo, rol: actualizado.rol, activo: actualizado.activo }
  });

  return mapUsuario(actualizado);
}

export async function deleteUser(id: string, currentUserId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  if (id === currentUserId) {
    throw new AppError("No puede eliminar su propio usuario.", 400);
  }

  await prisma.usuario.delete({ where: { id } });

  await recordRegistroAuditoria({
    usuarioActorId: currentUserId,
    accion: "USER_DELETE",
    tipoEntidad: "USER",
    entidadId: usuario.id,
    descripcion: `Usuario eliminado: ${usuario.correo}.`,
    metadatos: { correo: usuario.correo, rol: usuario.rol }
  });
}
