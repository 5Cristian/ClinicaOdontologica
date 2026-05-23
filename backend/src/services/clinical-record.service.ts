import { prisma } from "@/config/prisma";
import { recordRegistroAuditoria } from "@/services/audit-log.service";
import { AppError } from "@/utils/app-error";

type RegistroClinicoInput = {
  pacienteId: string;
  tratamientoId?: string | null;
  diagnosis: string;
  piezaDental?: string | null;
  medicamentos?: string | null;
  notas?: string | null;
  nextRecommendedCita?: string | null;
};

function mapRegistroClinico(record: {
  id: string;
  pacienteId: string;
  tratamientoId: string | null;
  diagnostico: string;
  piezaDental: string | null;
  medicamentos: string | null;
  notas: string | null;
  proximaCitaRecomendada: Date | null;
  atendidoEn: Date;
  creadoEn: Date;
  actualizadoEn: Date;
  paciente?: unknown;
  tratamiento?: unknown;
}) {
  return {
    ...record,
    diagnosis: record.diagnostico,
    nextRecommendedCita: record.proximaCitaRecomendada,
    patient: record.paciente,
    treatment: record.tratamiento
  };
}

export async function createRegistroClinico(input: RegistroClinicoInput, usuarioId?: string) {
  const record = await prisma.registroClinico.create({
    data: {
      pacienteId: input.pacienteId,
      tratamientoId: input.tratamientoId ?? null,
      diagnostico: input.diagnosis,
      piezaDental: input.piezaDental ?? null,
      medicamentos: input.medicamentos ?? null,
      notas: input.notas ?? null,
      proximaCitaRecomendada: input.nextRecommendedCita ? new Date(input.nextRecommendedCita) : null,
      creadoPor: usuarioId,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "CLINICAL_RECORD_CREATE",
    tipoEntidad: "CLINICAL_RECORD",
    entidadId: record.id,
    descripcion: `Registro clÃ­nico creado para paciente ${record.pacienteId}.`,
    metadatos: { pacienteId: record.pacienteId, tratamientoId: record.tratamientoId }
  });

  return mapRegistroClinico(record);
}

export async function listRegistroClinicos(pacienteId?: string) {
  const records = await prisma.registroClinico.findMany({
    where: pacienteId ? { pacienteId } : undefined,
    include: {
      paciente: true,
      tratamiento: true
    },
    orderBy: { atendidoEn: "desc" }
  });

  return records.map(mapRegistroClinico);
}

export async function getRegistroClinicoById(id: string) {
  const record = await prisma.registroClinico.findUnique({
    where: { id },
    include: {
      paciente: true,
      tratamiento: true
    }
  });

  if (!record) {
    throw new AppError("Registro clÃ­nico no encontrado.", 404);
  }

  return mapRegistroClinico(record);
}

export async function updateRegistroClinico(id: string, input: RegistroClinicoInput, usuarioId?: string) {
  await getRegistroClinicoById(id);

  const record = await prisma.registroClinico.update({
    where: { id },
    data: {
      pacienteId: input.pacienteId,
      tratamientoId: input.tratamientoId ?? null,
      diagnostico: input.diagnosis,
      piezaDental: input.piezaDental ?? null,
      medicamentos: input.medicamentos ?? null,
      notas: input.notas ?? null,
      proximaCitaRecomendada: input.nextRecommendedCita ? new Date(input.nextRecommendedCita) : null,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "CLINICAL_RECORD_UPDATE",
    tipoEntidad: "CLINICAL_RECORD",
    entidadId: record.id,
    descripcion: `Registro clÃ­nico actualizado para paciente ${record.pacienteId}.`,
    metadatos: { pacienteId: record.pacienteId, tratamientoId: record.tratamientoId }
  });

  return mapRegistroClinico(record);
}

export async function deleteRegistroClinico(id: string, usuarioId?: string) {
  const record = await getRegistroClinicoById(id);
  await prisma.registroClinico.delete({ where: { id } });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "CLINICAL_RECORD_DELETE",
    tipoEntidad: "CLINICAL_RECORD",
    entidadId: record.id,
    descripcion: `Registro clÃ­nico eliminado para paciente ${record.pacienteId}.`,
    metadatos: { pacienteId: record.pacienteId, tratamientoId: record.tratamientoId }
  });
}
