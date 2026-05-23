import { z } from "zod";

import { cuidParamSchema } from "@/validators/common.validator";

export const appointmentSchema = z.object({
  body: z.object({
    pacienteId: z.string().cuid().optional(),
    tratamientoId: z.string().cuid(),
    nombreCompleto: z.string().min(3).max(160).optional(),
    telefono: z.string().min(8).max(32).optional(),
    whatsapp: z.string().min(8).max(32).optional(),
    email: z.string().email().optional().nullable(),
    programadaPara: z.string().datetime({ offset: true }),
    motivo: z.string().min(10).max(1000),
    observaciones: z.string().max(1000).optional().nullable(),
    origen: z.string().max(32).optional()
  })
});

export const appointmentAvailabilitySchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
    tratamientoId: z.string().cuid().optional()
  })
});

export const citaIdSchema = cuidParamSchema;

export const appointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid()
  }),
  body: z.object({
    estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "NO_ASISTIO"])
  })
});
