import { EstadoCita } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { recordRegistroAuditoria } from "@/services/audit-log.service";
import {
  createWhatsappRecordatorio,
  getRecordatorioProviderStatus,
  sendAppointmentConfirmation
} from "@/services/reminder.service";
import { AppError } from "@/utils/app-error";

type CitaInput = {
  pacienteId?: string;
  tratamientoId: string;
  nombreCompleto?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string | null;
  programadaPara: string;
  motivo: string;
  observaciones?: string | null;
  origen?: string;
};

const CLINIC_TIMEZONE_OFFSET = "-06:00";
const PUBLIC_SLOT_TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
const PUBLIC_MAX_ADVANCE_DAYS = 90;

async function ensureUniqueSlot(programadaPara: Date, excludeId?: string) {
  // Evita que dos citas activas compartan el mismo horario.
  const existing = await prisma.cita.findFirst({
    where: {
      programadaPara,
      id: excludeId ? { not: excludeId } : undefined,
      estado: {
        in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
      }
    }
  });

  if (existing) {
    throw new AppError("El horario seleccionado ya está ocupado.", 409);
  }
}

function buildClinicDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00${CLINIC_TIMEZONE_OFFSET}`);
}

function parseClinicSlot(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    throw new AppError("Fecha y hora de cita invalidas.", 400);
  }

  return {
    date: match[1],
    time: `${match[2]}:${match[3]}`
  };
}

function validateProgramadaPara(programadaPara: Date) {
  if (Number.isNaN(programadaPara.getTime())) {
    throw new AppError("Fecha y hora de cita invalidas.", 400);
  }
}

function validatePublicAppointmentRules(input: CitaInput, programadaPara: Date) {
  const { time } = parseClinicSlot(input.programadaPara);
  const maxAdvance = new Date(Date.now() + PUBLIC_MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

  if (programadaPara <= new Date()) {
    throw new AppError("La cita debe programarse para una fecha y hora futura.", 400);
  }

  if (programadaPara > maxAdvance) {
    throw new AppError(`La reserva publica solo permite fechas dentro de los proximos ${PUBLIC_MAX_ADVANCE_DAYS} dias.`, 400);
  }

  if (!PUBLIC_SLOT_TIMES.includes(time)) {
    throw new AppError("La hora seleccionada no esta dentro del horario publico de reservas.", 400);
  }
}

function getRequiredSlots(durationMinutes?: number | null) {
  // Usa bloques horarios simples para que la reserva pública sea predecible.
  if (!durationMinutes || durationMinutes <= 60) {
    return 1;
  }

  return Math.ceil(durationMinutes / 60);
}

async function resolvePaciente(input: CitaInput, usuarioId?: string) {
  // Usa un paciente existente si viene por id desde el panel.
  if (input.pacienteId) {
    const patient = await prisma.paciente.findUnique({ where: { id: input.pacienteId } });
    if (!patient) {
      throw new AppError("Paciente no encontrado.", 404);
    }
    return patient;
  }

  // En la reserva pública se crea o actualiza el paciente a partir de contacto.
  if (!input.nombreCompleto || !input.telefono || !input.whatsapp) {
    throw new AppError("Datos del paciente incompletos para la cita pública.", 400);
  }

  const patientLookup: Array<{ telefono?: string; whatsapp?: string; correo?: string }> = [
    { telefono: input.telefono },
    { whatsapp: input.whatsapp }
  ];
  if (input.email) {
    patientLookup.push({ correo: input.email });
  }

  const existingPaciente = await prisma.paciente.findFirst({
    where: {
      OR: patientLookup
    }
  });

  if (existingPaciente) {
    return prisma.paciente.update({
      where: { id: existingPaciente.id },
      data: {
        nombreCompleto: input.nombreCompleto,
        telefono: input.telefono,
        whatsapp: input.whatsapp,
        correo: input.email ?? null,
        actualizadoPor: usuarioId
      }
    });
  }

  return prisma.paciente.create({
    data: {
      nombreCompleto: input.nombreCompleto,
      telefono: input.telefono,
      whatsapp: input.whatsapp,
      correo: input.email ?? null,
      creadoPor: usuarioId,
      actualizadoPor: usuarioId
    }
  });
}

export async function listCitas() {
  // Devuelve la agenda lista para tabla, dashboard y calendario.
  return prisma.cita.findMany({
    include: {
      paciente: true,
      tratamiento: true,
      recordatorio: true
    },
    orderBy: { programadaPara: "asc" }
  });
}

export async function obtenerHorariosDisponibles(date: string, tratamientoId?: string) {
  const treatment = tratamientoId
    ? await prisma.tratamiento.findUnique({
        where: { id: tratamientoId }
      })
    : null;

  if (tratamientoId && (!treatment || !treatment.activo)) {
    throw new AppError("Tratamiento no disponible para reserva.", 404);
  }

  if (buildClinicDateTime(date, "23:59") <= new Date()) {
    throw new AppError("No se puede consultar disponibilidad de fechas pasadas.", 400);
  }

  const requiredSlots = getRequiredSlots(treatment?.duracionAproximada);
  const dayStart = buildClinicDateTime(date, "00:00");
  const dayEnd = buildClinicDateTime(date, "23:59");

  const occupiedCitas = await prisma.cita.findMany({
    where: {
      programadaPara: {
        gte: dayStart,
        lte: dayEnd
      },
      estado: {
        in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
      }
    },
    select: {
      programadaPara: true
    },
    orderBy: { programadaPara: "asc" }
  });

  const occupiedTimes = new Set(
    occupiedCitas.map((appointment) => {
      const hours = appointment.programadaPara.getHours().toString().padStart(2, "0");
      const minutes = appointment.programadaPara.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    })
  );

  const availableSlots = PUBLIC_SLOT_TIMES.filter((time, index) => {
    if (occupiedTimes.has(time)) {
      return false;
    }

    // Si el tratamiento dura más de una hora, exige bloques consecutivos libres.
    for (let offset = 0; offset < requiredSlots; offset += 1) {
      const candidate = PUBLIC_SLOT_TIMES[index + offset];
      if (!candidate || occupiedTimes.has(candidate)) {
        return false;
      }
    }

    return true;
  });

  return {
    date,
    tratamientoId: tratamientoId ?? null,
    duracionAproximada: treatment?.duracionAproximada ?? null,
    occupiedSlots: Array.from(occupiedTimes),
    availableSlots
  };
}

export async function createCita(input: CitaInput, usuarioId?: string) {
  const programadaPara = new Date(input.programadaPara);
  validateProgramadaPara(programadaPara);

  const treatment = await prisma.tratamiento.findUnique({
    where: { id: input.tratamientoId }
  });

  if (!treatment || !treatment.activo) {
    throw new AppError("Tratamiento no disponible para reserva.", 404);
  }

  if (!usuarioId) {
    validatePublicAppointmentRules(input, programadaPara);
  }

  await ensureUniqueSlot(programadaPara);
  const patient = await resolvePaciente(input, usuarioId);

  // Registra la cita con estado inicial pendiente y datos relacionados.
  const appointment = await prisma.cita.create({
    data: {
      pacienteId: patient.id,
      tratamientoId: input.tratamientoId,
      programadaPara,
      motivo: input.motivo,
      observaciones: input.observaciones ?? null,
      origen: input.origen ?? "ADMINISTRADOR_PANEL",
      estado: EstadoCita.PENDIENTE,
      creadoPor: usuarioId,
      actualizadoPor: usuarioId
    },
    include: {
      paciente: true,
      tratamiento: true
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "APPOINTMENT_CREATE",
    tipoEntidad: "APPOINTMENT",
    entidadId: appointment.id,
    descripcion: `Cita creada para ${appointment.paciente.nombreCompleto}.`,
    metadatos: {
      pacienteId: appointment.pacienteId,
      tratamientoId: appointment.tratamientoId,
      programadaPara: appointment.programadaPara.toISOString()
    }
  });

  try {
    const providerStatus = await getRecordatorioProviderStatus();

    // Solo dispara el recordatorio automático cuando existe un proveedor real configurado.
    if (providerStatus.mode === "REAL") {
      await createWhatsappRecordatorio(appointment.id, usuarioId);
    }
  } catch (error) {
    console.error("No se pudo enviar el recordatorio automático de la cita.", error);
  }

  return appointment;
}

export async function getCitaById(id: string) {
  const appointment = await prisma.cita.findUnique({
    where: { id },
    include: {
      paciente: true,
      tratamiento: true,
      recordatorio: true
    }
  });

  if (!appointment) {
    throw new AppError("Cita no encontrada.", 404);
  }

  return appointment;
}

export async function updateCita(id: string, input: CitaInput, usuarioId?: string) {
  await getCitaById(id);
  const programadaPara = new Date(input.programadaPara);
  validateProgramadaPara(programadaPara);

  const treatment = await prisma.tratamiento.findUnique({
    where: { id: input.tratamientoId }
  });

  if (!treatment || !treatment.activo) {
    throw new AppError("Tratamiento no disponible para reserva.", 404);
  }

  await ensureUniqueSlot(programadaPara, id);
  const patient = await resolvePaciente(input, usuarioId);

  // Reprograma o corrige la cita conservando la relación con paciente y tratamiento.
  const appointment = await prisma.cita.update({
    where: { id },
    data: {
      pacienteId: patient.id,
      tratamientoId: input.tratamientoId,
      programadaPara,
      motivo: input.motivo,
      observaciones: input.observaciones ?? null,
      origen: input.origen ?? "ADMINISTRADOR_PANEL",
      actualizadoPor: usuarioId
    },
    include: {
      paciente: true,
      tratamiento: true,
      recordatorio: true
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "APPOINTMENT_UPDATE",
    tipoEntidad: "APPOINTMENT",
    entidadId: appointment.id,
    descripcion: `Cita actualizada para ${appointment.paciente.nombreCompleto}.`,
    metadatos: {
      pacienteId: appointment.pacienteId,
      tratamientoId: appointment.tratamientoId,
      programadaPara: appointment.programadaPara.toISOString()
    }
  });

  return appointment;
}

export async function updateEstadoCita(id: string, estado: EstadoCita, usuarioId?: string) {
  const current = await getCitaById(id);

  // Cambia solo el estado operativo sin tocar los demás datos.
  const appointment = await prisma.cita.update({
    where: { id },
    data: {
      estado,
      actualizadoPor: usuarioId
    }
  });

  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "APPOINTMENT_STATUS_UPDATE",
    tipoEntidad: "APPOINTMENT",
    entidadId: appointment.id,
    descripcion: `Estado de cita cambiado de ${current.estado} a ${estado}.`,
    metadatos: { previousStatus: current.estado, nextStatus: estado }
  });

  if (estado === EstadoCita.CONFIRMADA && current.estado !== EstadoCita.CONFIRMADA) {
    try {
      await sendAppointmentConfirmation(id, usuarioId);
    } catch (error) {
      console.error("No se pudo enviar la confirmacion automatica de la cita.", error);
    }
  }

  return appointment;
}

export async function deleteCita(id: string, usuarioId?: string) {
  const appointment = await getCitaById(id);
  await prisma.cita.delete({ where: { id } });
  await recordRegistroAuditoria({
    usuarioActorId: usuarioId,
    accion: "APPOINTMENT_DELETE",
    tipoEntidad: "APPOINTMENT",
    entidadId: appointment.id,
    descripcion: `Cita eliminada para ${appointment.paciente.nombreCompleto}.`,
    metadatos: {
      pacienteId: appointment.pacienteId,
      tratamientoId: appointment.tratamientoId,
      programadaPara: appointment.programadaPara.toISOString()
    }
  });
}
