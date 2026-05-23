import { prisma } from "@/config/prisma";
import { recordRegistroAuditoria } from "@/services/audit-log.service";
import { AppError } from "@/utils/app-error";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TratamientoInput = {
  name: string;
  description: string;
  precioEstimado?: number | null;
  duracionAproximada?: number | null;
  activo?: boolean;
};

function mapTratamiento(tratamiento: {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precioEstimado: unknown;
  duracionAproximada: number | null;
  activo: boolean;
  creadoPor: string | null;
  actualizadoPor: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}) {
  return {
    id: tratamiento.id,
    name: tratamiento.nombre,
    slug: tratamiento.slug,
    descripcion: tratamiento.descripcion,
    precioEstimado: tratamiento.precioEstimado,
    duracionAproximada: tratamiento.duracionAproximada,
    activo: tratamiento.activo,
    creadoPor: tratamiento.creadoPor,
    actualizadoPor: tratamiento.actualizadoPor,
    creadoEn: tratamiento.creadoEn,
    actualizadoEn: tratamiento.actualizadoEn
  };
}

export async function listTratamientos() {
  const tratamientos = await prisma.tratamiento.findMany({
    orderBy: { nombre: "asc" }
  });
  return tratamientos.map(mapTratamiento);
}

export async function createTratamiento(input: TratamientoInput, usuarioId?: string) {
  const tratamiento = await prisma.tratamiento.create({
    data: {
      nombre: input.name,
      descripcion: input.description,
      slug: slugify(input.name),
      precioEstimado: input.precioEstimado ?? null,
      duracionAproximada: input.duracionAproximada ?? null,
      activo: input.activo ?? true,
      creadoPor: usuarioId,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "TREATMENT_CREATE",
    tipoEntidad: "TREATMENT",
    entidadId: tratamiento.id,
    descripcion: `Tratamiento creado: ${tratamiento.nombre}.`,
    metadatos: { slug: tratamiento.slug, activo: tratamiento.activo }
  });

  return mapTratamiento(tratamiento);
}

export async function updateTratamiento(id: string, input: TratamientoInput, usuarioId?: string) {
  const tratamiento = await prisma.tratamiento.findUnique({ where: { id } });
  if (!tratamiento) {
    throw new AppError("Tratamiento no encontrado.", 404);
  }

  const actualizado = await prisma.tratamiento.update({
    where: { id },
    data: {
      nombre: input.name,
      descripcion: input.description,
      slug: slugify(input.name),
      precioEstimado: input.precioEstimado ?? null,
      duracionAproximada: input.duracionAproximada ?? null,
      activo: input.activo ?? tratamiento.activo,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "TREATMENT_UPDATE",
    tipoEntidad: "TREATMENT",
    entidadId: actualizado.id,
    descripcion: `Tratamiento actualizado: ${actualizado.nombre}.`,
    metadatos: { slug: actualizado.slug, activo: actualizado.activo }
  });

  return mapTratamiento(actualizado);
}

export async function deleteTratamiento(id: string, usuarioId?: string) {
  const tratamiento = await prisma.tratamiento.findUnique({ where: { id } });
  if (!tratamiento) {
    throw new AppError("Tratamiento no encontrado.", 404);
  }

  await prisma.tratamiento.delete({ where: { id } });
  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "TREATMENT_DELETE",
    tipoEntidad: "TREATMENT",
    entidadId: tratamiento.id,
    descripcion: `Tratamiento eliminado: ${tratamiento.nombre}.`,
    metadatos: { slug: tratamiento.slug }
  });
}
