import { z } from "zod";

import { cuidParamSchema } from "@/validators/common.validator";

export const clinicalRecordSchema = z.object({
  body: z.object({
    pacienteId: z.string().cuid(),
    tratamientoId: z.string().cuid().optional().nullable(),
    diagnosis: z.string().min(5).max(1000),
    piezaDental: z.string().max(20).optional().nullable(),
    medicamentos: z.string().max(1000).optional().nullable(),
    notas: z.string().max(1500).optional().nullable(),
    nextRecommendedCita: z.string().datetime().optional().nullable()
  })
});

export const clinicalRecordIdSchema = cuidParamSchema;
