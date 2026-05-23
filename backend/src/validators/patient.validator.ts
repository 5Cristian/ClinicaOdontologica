import { z } from "zod";

import { cuidParamSchema } from "@/validators/common.validator";

export const patientSchema = z.object({
  body: z.object({
    nombreCompleto: z.string().min(3).max(160),
    dpi: z.string().max(32).optional().nullable(),
    fechaNacimiento: z.string().datetime().optional().nullable(),
    age: z.number().int().min(0).max(120).optional().nullable(),
    telefono: z.string().min(8).max(32),
    whatsapp: z.string().min(8).max(32),
    email: z.string().email().optional().nullable(),
    direccion: z.string().max(255).optional().nullable(),
    historialMedico: z.string().max(2000).optional().nullable(),
    alergias: z.string().max(1000).optional().nullable(),
    observaciones: z.string().max(1000).optional().nullable()
  })
});

export const pacienteIdSchema = cuidParamSchema;
