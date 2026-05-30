import { z } from "zod";

import { cuidParamSchema } from "@/validators/common.validator";

const mediaRefSchema = z.union([z.string().startsWith("/uploads/"), z.string().url()]);

export const treatmentSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120),
    description: z.string().min(10).max(1000),
    imagenes: z.array(mediaRefSchema).max(12).default([]),
    precioEstimado: z.number().nonnegative().optional().nullable(),
    duracionAproximada: z.number().int().min(5).max(480).optional().nullable(),
    activo: z.boolean().optional()
  })
});

export const tratamientoIdSchema = cuidParamSchema;
