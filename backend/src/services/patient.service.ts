import { prisma } from "@/config/prisma";
import { recordRegistroAuditoria } from "@/services/audit-log.service";
import { AppError } from "@/utils/app-error";

type PacienteInput = {
  nombreCompleto: string;
  dpi?: string | null;
  fechaNacimiento?: string | null;
  age?: number | null;
  telefono: string;
  whatsapp: string;
  email?: string | null;
  direccion?: string | null;
  historialMedico?: string | null;
  alergias?: string | null;
  observaciones?: string | null;
};

export async function listPacientes() {
  return prisma.paciente.findMany({
    orderBy: { creadoEn: "desc" }
  });
}

export async function createPaciente(input: PacienteInput, usuarioId?: string) {
  const patient = await prisma.paciente.create({
    data: {
      ...input,
      fechaNacimiento: input.fechaNacimiento ? new Date(input.fechaNacimiento) : null,
      creadoPor: usuarioId,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "PATIENT_CREATE",
    tipoEntidad: "PATIENT",
    entidadId: patient.id,
    descripcion: `Paciente creado: ${patient.nombreCompleto}.`,
    metadatos: { nombreCompleto: patient.nombreCompleto, telefono: patient.telefono }
  });

  return patient;
}

export async function getPacienteById(id: string) {
  const patient = await prisma.paciente.findUnique({
    where: { id },
    include: {
      citas: {
        include: {
          tratamiento: true
        },
        orderBy: { programadaPara: "desc" }
      },
      registrosClinicos: {
        include: {
          tratamiento: true
        },
        orderBy: { atendidoEn: "desc" }
      }
    }
  });

  if (!patient) {
    throw new AppError("Paciente no encontrado.", 404);
  }

  return patient;
}

export async function updatePaciente(id: string, input: PacienteInput, usuarioId?: string) {
  await getPacienteById(id);

  const patient = await prisma.paciente.update({
    where: { id },
    data: {
      ...input,
      fechaNacimiento: input.fechaNacimiento ? new Date(input.fechaNacimiento) : null,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "PATIENT_UPDATE",
    tipoEntidad: "PATIENT",
    entidadId: patient.id,
    descripcion: `Paciente actualizado: ${patient.nombreCompleto}.`,
    metadatos: { nombreCompleto: patient.nombreCompleto, telefono: patient.telefono }
  });

  return patient;
}

export async function deletePaciente(id: string, usuarioId?: string) {
  const patient = await getPacienteById(id);
  await prisma.paciente.delete({ where: { id } });
  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "PATIENT_DELETE",
    tipoEntidad: "PATIENT",
    entidadId: patient.id,
    descripcion: `Paciente eliminado: ${patient.nombreCompleto}.`,
    metadatos: { nombreCompleto: patient.nombreCompleto, telefono: patient.telefono }
  });
}
