import { randomUUID } from "node:crypto";

import { prisma } from "@/config/prisma";

type AuditInput = {
  usuarioActorId?: string | null;
  accion: string;
  tipoEntidad: string;
  entidadId?: string | null;
  descripcion: string;
  metadatos?: unknown;
};

export async function recordRegistroAuditoria(input: AuditInput) {
  try {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "RegistroAuditoria" ("id", "usuarioActorId", "accion", "tipoEntidad", "entidadId", "descripcion", "metadatos", "creadoEn")
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
      `,
      randomUUID(),
      input.usuarioActorId ?? null,
      input.accion,
      input.tipoEntidad,
      input.entidadId ?? null,
      input.descripcion,
      JSON.stringify(input.metadatos ?? null)
    );
  } catch (error) {
    console.error("No se pudo registrar el evento de auditoria.", error);
  }
}

type RegistroAuditoriaRow = {
  id: string;
  accion: string;
  tipoEntidad: string;
  entidadId: string | null;
  descripcion: string;
  metadatos: unknown;
  creadoEn: Date;
  usuarioActorId: string | null;
  usuarioActorNombre: string | null;
  usuarioActorCorreo: string | null;
  usuarioActorRol: string | null;
};

export async function listRegistroAuditorias(filters: {
  accion?: string;
  tipoEntidad?: string;
  usuarioActorId?: string;
  limit?: number;
}) {
  const rows = await prisma.$queryRawUnsafe<RegistroAuditoriaRow[]>(
    `
      SELECT
        a."id",
        a."accion",
        a."tipoEntidad",
        a."entidadId",
        a."descripcion",
        a."metadatos",
        a."creadoEn",
        u."id" AS "usuarioActorId",
        u."nombre" AS "usuarioActorNombre",
        u."correo" AS "usuarioActorCorreo",
        u."rol" AS "usuarioActorRol"
      FROM "RegistroAuditoria" a
      LEFT JOIN "Usuario" u ON u."id" = a."usuarioActorId"
      WHERE ($1::text IS NULL OR a."accion" = $1)
        AND ($2::text IS NULL OR a."tipoEntidad" = $2)
        AND ($3::text IS NULL OR a."usuarioActorId" = $3)
      ORDER BY a."creadoEn" DESC
      LIMIT $4
    `,
    filters.accion ?? null,
    filters.tipoEntidad ?? null,
    filters.usuarioActorId ?? null,
    filters.limit ?? 100
  );

  return rows.map((row) => ({
    id: row.id,
    accion: row.accion,
    tipoEntidad: row.tipoEntidad,
    entidadId: row.entidadId,
    descripcion: row.descripcion,
    metadatos: row.metadatos as Record<string, unknown> | null,
    creadoEn: row.creadoEn,
    usuarioActor: row.usuarioActorId
      ? {
          id: row.usuarioActorId,
          name: row.usuarioActorNombre ?? "",
          email: row.usuarioActorCorreo ?? "",
          role: row.usuarioActorRol ?? ""
        }
      : null
  }));
}
