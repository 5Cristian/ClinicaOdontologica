import { z } from "zod";

import { cuidParamSchema } from "@/validators/common.validator";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    role: z.enum(["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"]),
    activo: z.boolean().optional()
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120),
    email: z.string().email(),
    role: z.enum(["ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"]),
    activo: z.boolean(),
    password: z.string().min(8).max(64).optional()
  })
});

export const usuarioIdSchema = cuidParamSchema;
